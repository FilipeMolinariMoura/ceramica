-- Semente mínima para o site funcionar assim que sobe.
--
-- Só o que o código precisa encontrar para não quebrar: o serviço que a página
-- de aulas procura por slug. Horário NÃO é semeado aqui — horário é dado
-- operacional, quem cria é a Isabela pelo painel, e uma migration que inventa
-- agenda colocaria aula fantasma no ar.
--
-- Os valores são os que ela passou em 18/09: aula avulsa de R$ 250, quatro
-- vagas por horário, duas horas. Depois disso a fonte da verdade é o painel —
-- esta migration não roda de novo e não sobrescreve o que ela mudar.

insert into servicos (slug, nome, descricao, duracao_min, preco_centavos, vagas_padrao, ordem)
values (
  'aula-avulsa',
  'Aula avulsa de cerâmica',
  'Duas horas no torno ou na modelagem, com acompanhamento individual. Para quem quer experimentar sem assinar um mês inteiro.',
  120,
  25000,
  4,
  1
)
on conflict (slug) do nothing;

-- Conteúdo que a Isabela muda sem deploy. Chave/valor para não virar uma
-- migration a cada campo novo de texto.
insert into config (chave, valor) values
  ('agenda.aviso', '""'::jsonb),
  ('pacote.ativo', 'false'::jsonb),
  ('pacote.texto', '""'::jsonb)
on conflict (chave) do nothing;
