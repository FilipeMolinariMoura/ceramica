-- Mídia, fotos por seção e páginas criadas pela Isabela.
--
-- Até aqui toda foto do site era um import estático em `lib/fotos.ts`: trocar
-- a foto do hero era mexer no código e esperar deploy. Isto aqui é o que dá a
-- ela a chave do próprio site.

create table midias (
  id        uuid        primary key default gen_random_uuid(),
  -- Nome NO DISCO, gerado por nós (uuid + extensão). O nome original que veio
  -- do computador dela não vira caminho nunca: é o caminho que o servidor
  -- monta a partir desta linha que é usado para ler o arquivo, e não texto
  -- que chegou pela rede.
  arquivo   text        not null unique,
  nome      text        not null,
  alt       text        not null default '',
  largura   integer     not null check (largura > 0),
  altura    integer     not null check (altura > 0),
  tipo      text        not null,
  bytes     integer     not null check (bytes > 0),
  criada_em timestamptz not null default now()
);

create index midias_criada_idx on midias (criada_em desc);

-- Que foto aparece em que lugar do site.
--
-- A "vaga" é uma CHAVE de texto (`home.hero`, `aulas.sobre`, `atelie`), e não
-- uma coluna por lugar: cada seção nova exigiria uma migration, e a ideia é
-- justamente ela poder montar seção nova sem deploy. A chave é declarada no
-- código, em `lib/secoes-de-foto.ts`, que é quem sabe o que cada vaga
-- significa e quantas fotos ela aceita.
create table secao_midias (
  chave    text        not null,
  midia_id uuid        not null references midias (id) on delete cascade,
  ordem    smallint    not null default 0,
  posta_em timestamptz not null default now(),
  primary key (chave, midia_id)
);

create index secao_midias_chave_idx on secao_midias (chave, ordem);

-- ── Páginas criadas por ela ───────────────────────────────────────────────

create table paginas (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null,
  titulo        text        not null,
  descricao_seo text,
  publicada     boolean     not null default false,
  no_menu       boolean     not null default false,
  ordem         smallint    not null default 0,
  criada_em     timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

-- Único por slug NORMALIZADO: no Postgres 'Prints' e 'prints' são diferentes,
-- e as duas páginas responderiam na mesma URL.
create unique index paginas_slug_idx on paginas (lower(slug));

-- Um bloco é `tipo` + `dados` em jsonb. Sem coluna por campo: cada tipo de
-- bloco novo viraria migration, e o objetivo é ela montar página sem deploy.
-- Quem valida o formato de cada tipo é o código, na gravação — o banco só
-- garante que é jsonb.
create table blocos (
  id        uuid     primary key default gen_random_uuid(),
  pagina_id uuid     not null references paginas (id) on delete cascade,
  tipo      text     not null,
  ordem     smallint not null default 0,
  dados     jsonb    not null default '{}'::jsonb
);

create index blocos_pagina_idx on blocos (pagina_id, ordem);
