-- Tabela de inscrições da primeira turma de cerâmica.
-- Rode no SQL Editor do Supabase (uma vez).

create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nome text not null,
  whatsapp text not null,
  experiencia text not null check (experiencia in ('nenhuma', 'pouca', 'pratico')),
  status text not null default 'novo',
  origem text
);

alter table inscricoes enable row level security;
-- Sem policy de propósito: a escrita acontece apenas via service_role,
-- no route handler do servidor. O cliente (anon) não lê nem escreve.
