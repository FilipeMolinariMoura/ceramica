-- Turma mensal vendida pelo site.
--
-- Até aqui a mensal fechava no WhatsApp: formulário, conversa, Pix combinado
-- à mão. Agora ela é um PACOTE DE QUATRO TERÇAS SEGUIDAS, na turma escolhida
-- (manhã 10h ou tarde 13h30), pago pela InfinitePay como a aula avulsa.
--
-- ── A decisão que sustenta o resto ────────────────────────────────────────
-- Mensal e avulsa dividem a MESMA mesa: seis lugares por terça, no total. Por
-- isso o pacote não tem horário próprio. Ele toma um lugar em cada um dos
-- quatro horários de terça que a avulsa já usa, pelo mesmo contador
-- `horarios.ocupadas` e sob o mesmo CHECK. "A mensalista ocupa um lugar por
-- semana e a avulsa fica com o que sobra" vale por construção, e nenhum
-- caminho consegue vender o sétimo lugar.
--
-- Cada uma das quatro aulas é uma `reserva` comum, filha do pacote. É o que
-- deixa `expirarVencidas`, o painel e o CHECK funcionando sem saber que pacote
-- existe. O dinheiro e o token moram no PACOTE: as filhas têm valor zero para
-- o faturamento não contar a mesma venda cinco vezes.
--
-- Tudo aqui é aditivo. O `migrar.mjs` roda antes do `up -d`, então o código
-- antigo passa alguns segundos de pé sobre este schema — e continua
-- funcionando, porque nada do que ele lê mudou de forma.

-- Segundo preço (cartão) e tamanho do pacote. A avulsa fica com cartão nulo,
-- que significa "um preço só", e com uma aula.
alter table servicos
  add column preco_cartao_centavos integer
    check (preco_cartao_centavos is null or preco_cartao_centavos >= preco_centavos),
  add column aulas smallint not null default 1 check (aulas between 1 and 8);

-- Valores que a Isabela passou: R$ 800 no Pix, R$ 835,08 no cartão, quatro
-- terças. Depois disso a fonte da verdade é o painel.
insert into servicos
  (slug, nome, descricao, duracao_min, preco_centavos, preco_cartao_centavos,
   vagas_padrao, aulas, ordem)
values (
  'turma-mensal',
  'Turma mensal de cerâmica',
  'Quatro terças seguidas, na mesma turma, com a mesma mesa.',
  120, 80000, 83508, 6, 4, 2
)
on conflict (slug) do nothing;

create table pacotes (
  id             uuid        primary key default gen_random_uuid(),
  servico_id     bigint      not null references servicos (id),
  turma          text        not null check (turma in ('manha', 'tarde')),
  nome           text        not null,
  email          text        not null,
  whatsapp       text        not null,
  -- O meio que a pessoa ESCOLHEU no site, e que definiu o valor cobrado. A
  -- InfinitePay não deixa travar o meio no checkout, então o que ela usou de
  -- fato vem em `pagamentos.capture_method` — e os dois podem divergir.
  meio           text        not null check (meio in ('pix', 'cartao')),
  valor_centavos integer     not null check (valor_centavos >= 0),
  status         text        not null default 'pendente'
    check (status in ('pendente', 'confirmada', 'cancelada', 'expirada', 'paga_sem_vaga')),
  token          text        not null unique,
  expira_em      timestamptz not null,
  confirmada_em  timestamptz,
  observacao     text,
  origem         text,
  criado_em      timestamptz not null default now()
);

create index pacotes_criado_idx   on pacotes (criado_em desc);
create index pacotes_vencendo_idx on pacotes (expira_em) where status = 'pendente';

-- Sem cascade, como `horarios` → `reservas`: apagar um pacote pago apagaria
-- quatro aulas de alguém que pagou.
alter table reservas
  add column pacote_id uuid references pacotes (id),
  add column origem    text,
  add constraint reservas_filha_sem_valor
    check (pacote_id is null or valor_centavos = 0);

create index reservas_pacote_idx on reservas (pacote_id) where pacote_id is not null;
-- O mesmo pacote não pode pegar duas vezes o mesmo horário.
create unique index reservas_pacote_horario_uq
  on reservas (pacote_id, horario_id) where pacote_id is not null;

-- O pagamento pertence a UMA reserva avulsa OU a UM pacote, nunca aos dois e
-- nunca a nenhum. `transaction_nsu` continua único na tabela inteira: o
-- comprovante de uma aula avulsa não confirma um pacote, e vice-versa.
alter table pagamentos
  alter column reserva_id drop not null,
  add column pacote_id uuid references pacotes (id) on delete cascade,
  add constraint pagamentos_um_dono check (num_nonnulls(reserva_id, pacote_id) = 1);

create unique index pagamentos_pacote_uq on pagamentos (pacote_id) where pacote_id is not null;
