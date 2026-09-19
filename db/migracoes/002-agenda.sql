-- Agenda, reservas e pagamento.
--
-- É o que transforma o site de catálogo em ponto de venda: a pessoa escolhe um
-- horário, paga pela InfinitePay e a vaga é confirmada sem passar pelo
-- WhatsApp da Isabela.
--
-- A DECISÃO ESTRUTURAL DESTE ARQUIVO está em `horarios.ocupadas` e no CHECK
-- que o acompanha. A lotação NÃO é calculada contando reservas nem protegida
-- por advisory lock: ela é um contador numa linha, com a invariante declarada
-- no schema. Reservar é `update ... where ocupadas < vagas`, e `rowCount = 0`
-- significa lotado. Vantagem sobre o lock: lock é convenção, e qualquer
-- caminho que esqueça de pegá-lo (o painel remarcando, um psql de correção)
-- fura a regra em silêncio. O CHECK não tem como ser esquecido.

create table servicos (
  id             bigserial primary key,
  slug           text        not null unique,
  nome           text        not null,
  descricao      text,
  duracao_min    integer     not null check (duracao_min > 0),
  preco_centavos integer     not null check (preco_centavos >= 0),
  vagas_padrao   smallint    not null default 4 check (vagas_padrao > 0),
  ativo          boolean     not null default true,
  ordem          smallint    not null default 0,
  criado_em      timestamptz not null default now()
);

-- Um horário é um INSTANTE (timestamptz), não `data` + `hora` separados.
-- O contêiner roda em UTC e a Isabela pensa em horário de Brasília; com duas
-- colunas comparadas a now() a agenda erraria por 3 horas — mostraria vaga de
-- ontem e expiraria reserva cedo demais.
create table horarios (
  id         bigserial   primary key,
  servico_id bigint      not null references servicos (id) on delete cascade,
  inicio     timestamptz not null,
  vagas      smallint    not null check (vagas > 0),
  ocupadas   smallint    not null default 0,
  publicado  boolean     not null default true,
  criado_em  timestamptz not null default now(),
  unique (servico_id, inicio),
  constraint horarios_ocupadas_cabe check (ocupadas >= 0 and ocupadas <= vagas)
);

create index horarios_inicio_idx on horarios (inicio) where publicado;

create table reservas (
  id             uuid        primary key default gen_random_uuid(),
  horario_id     bigint      not null references horarios (id),
  nome           text        not null,
  email          text        not null,
  whatsapp       text        not null,
  valor_centavos integer     not null check (valor_centavos >= 0),
  status         text        not null default 'pendente'
    check (status in ('pendente', 'confirmada', 'cancelada', 'expirada', 'paga_sem_vaga')),
  -- Segredo que vai na URL do webhook e na do comprovante. O webhook da
  -- InfinitePay não é assinado; sem isto a rota seria postável por qualquer
  -- um, e cada POST forjado dispararia uma chamada nossa de saída.
  token          text        not null unique,
  expira_em      timestamptz not null,
  confirmada_em  timestamptz,
  observacao     text,
  criado_em      timestamptz not null default now()
);

create index reservas_horario_idx on reservas (horario_id);
create index reservas_criado_idx  on reservas (criado_em desc);
-- Varredura de holds vencidos.
create index reservas_vencendo_idx on reservas (expira_em) where status = 'pendente';

-- `transaction_nsu` único é a idempotência REAL do pagamento: uma transação da
-- InfinitePay confirma no máximo uma reserva. Sem isto, quem comprasse uma
-- aula de verdade poderia reenviar o mesmo transaction_nsu apontando para a
-- reserva de outra pessoa — o webhook não é assinado e o corpo é do atacante.
-- (Vários NULL convivem num índice único no Postgres, então pagamento ainda
-- não concluído não atrapalha.)
create table pagamentos (
  id              uuid        primary key default gen_random_uuid(),
  reserva_id      uuid        not null references reservas (id) on delete cascade,
  order_nsu       text        not null unique,
  transaction_nsu text        unique,
  valor_centavos  integer     not null,
  status          text        not null default 'iniciado'
    check (status in ('iniciado', 'pago', 'recusado')),
  capture_method  text,
  slug_fatura     text,
  receipt_url     text,
  checkout_url    text,
  bruto           jsonb,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index pagamentos_reserva_idx on pagamentos (reserva_id);

-- Ajustes que a Isabela faz pelo painel sem deploy: textos, WhatsApp, handle
-- da InfinitePay, aviso de férias. Chave/valor para não virar uma migration a
-- cada campo novo de conteúdo.
create table config (
  chave         text        primary key,
  valor         jsonb       not null,
  atualizado_em timestamptz not null default now()
);

create table usuarios (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  senha_hash text        not null,
  nome       text        not null,
  criado_em  timestamptz not null default now()
);

-- Único por e-mail normalizado: 'Isabela@' e 'isabela@' são a mesma pessoa, e
-- um unique simples deixaria as duas contas existirem.
create unique index usuarios_email_idx on usuarios (lower(email));

-- Só o hash do token da sessão é guardado. Vazamento de backup não vira
-- sessão válida.
create table sessoes (
  id         uuid        primary key default gen_random_uuid(),
  usuario_id uuid        not null references usuarios (id) on delete cascade,
  token_hash text        not null unique,
  expira_em  timestamptz not null,
  criado_em  timestamptz not null default now()
);

create index sessoes_expira_idx on sessoes (expira_em);

-- Limite de tentativas de login por IP. Uma senha só num endpoint público sem
-- freio é força bruta esperando acontecer.
create table tentativas_login (
  id bigserial   primary key,
  ip text        not null,
  em timestamptz not null default now()
);

create index tentativas_login_idx on tentativas_login (ip, em desc);
