-- Pedidos de orçamento de oficina.
--
-- A segunda porta do catálogo ("faça o orçamento da sua oficina") não tem
-- preço de tabela: depende de quantas pessoas, onde e quando. Então ela não
-- entra na agenda paga — ela vira um briefing que a Isabela responde.
--
-- Tabela própria, e não uma coluna nova em `inscricoes`: são coisas
-- diferentes, com campos diferentes, e misturá-las obrigaria metade das
-- colunas a serem nulas em cada linha.

create table pedidos (
  id         uuid        primary key default gen_random_uuid(),
  tipo       text        not null default 'oficina' check (tipo in ('oficina', 'encomenda')),
  nome       text        not null,
  email      text        not null,
  whatsapp   text        not null,
  ocasiao    text,
  pessoas    integer     check (pessoas is null or pessoas > 0),
  quando     text,
  local      text,
  mensagem   text,
  status     text        not null default 'novo'
    check (status in ('novo', 'respondido', 'fechado', 'descartado')),
  origem     text,
  criado_em  timestamptz not null default now()
);

-- A leitura da Isabela é sempre "o que chegou por último".
create index pedidos_criado_idx on pedidos (criado_em desc);
create index pedidos_status_idx on pedidos (status) where status = 'novo';
