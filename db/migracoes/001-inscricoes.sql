-- Inscrições das turmas de cerâmica — o schema original do site.
--
-- Era `db/init/01-inscricoes.sql`, executado pelo docker-entrypoint do
-- Postgres. Aquele diretório só roda com o volume VAZIO, então o banco de
-- produção nunca o viu depois da primeira subida: dev e produção estavam
-- divergindo em silêncio. Virou migration para haver uma fonte da verdade só.
--
-- Todo comando aqui é `if not exists`, de propósito: no banco de produção,
-- que já tem estas tabelas, esta migration é um no-op e serve apenas para
-- registrar o ponto de partida em `migracoes`.
--
-- Não há RLS: o banco não publica porta, mora na rede interna do compose e só
-- o servidor do site fala com ele.

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
