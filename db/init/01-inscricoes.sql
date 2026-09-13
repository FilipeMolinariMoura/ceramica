-- Tabela de inscrições das turmas de cerâmica.
--
-- Roda AUTOMATICAMENTE na primeira subida do contêiner do Postgres: o
-- docker-entrypoint executa tudo que está em /docker-entrypoint-initdb.d
-- quando o volume de dados ainda está vazio. Em banco já criado, este arquivo
-- é ignorado — mudança de schema depois disso é migration à mão (ver README).
--
-- Não há RLS aqui, ao contrário da versão do Supabase: o banco não é exposto
-- a cliente nenhum. Ele não publica porta, mora na rede interna do compose e
-- só o route handler do site fala com ele.

create table if not exists inscricoes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nome         text not null,
  whatsapp     text not null,
  turma        text check (turma in ('manha', 'tarde', 'tanto_faz')),
  experiencia  text not null check (experiencia in ('nenhuma', 'pouca', 'pratico')),
  status       text not null default 'novo',
  origem       text
);

-- A leitura que a Isabela faz é sempre "quem se inscreveu por último".
create index if not exists inscricoes_created_at_idx
  on inscricoes (created_at desc);
