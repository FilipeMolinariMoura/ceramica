-- A manhã sai a partir de novembro, e entra um sábado avulso.
--
-- Pedido da Isabela em 26/10/2026: a partir das terças de novembro não há
-- mais a turma da manhã (10h), e no sábado 14/11 há uma aula única das 14h às
-- 16h, pelo preço da avulsa. Como a 007, é agenda confirmada por ela, e
-- precisa estar no ar no mesmo deploy que tira a manhã dos textos do site.
--
-- Nada é APAGADO. Despublicar só tira da vitrine: quem já tinha reserva ou
-- pacote numa terça de manhã de novembro continua com ela de pé, e a Isabela
-- vê pelo painel quem é para avisar.

-- Tira do ar as terças às 10h de 03/11/2026 em diante.
update horarios h
   set publicado = false
  from servicos s
 where s.id = h.servico_id
   and s.slug = 'aula-avulsa'
   and h.publicado
   and h.inicio >= timestamptz '2026-11-03 00:00 America/Sao_Paulo'
   and extract(isodow from h.inicio at time zone 'America/Sao_Paulo') = 2
   and to_char(h.inicio at time zone 'America/Sao_Paulo', 'HH24:MI') = '10:00';

-- Sábado, 14/11/2026, às 14h. A duração (2h) e o preço são os da avulsa;
-- os lugares, os de sempre. Sábado não é turma, então só se vende avulsa —
-- o site o mostra na aba "Outros".
insert into horarios (servico_id, inicio, vagas)
select s.id, timestamptz '2026-11-14 14:00 America/Sao_Paulo', s.vagas_padrao
  from servicos s
 where s.slug = 'aula-avulsa'
on conflict (servico_id, inicio) do update
   set publicado = true,
       vagas = greatest(excluded.vagas, horarios.ocupadas);
