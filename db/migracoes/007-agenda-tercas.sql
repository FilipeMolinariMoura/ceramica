-- A agenda real: terças, 10h e 13h30, seis lugares.
--
-- Esta migration contraria de propósito o que a 003 diz ("migration que
-- inventa agenda coloca aula fantasma no ar"). Aqui não há invenção: são os
-- horários que a Isabela confirmou em 30/09/2026 — todas as terças, das 10h às
-- 12h e das 13h30 às 15h30 —, e eles precisam estar no ar no MESMO deploy que
-- passa a vender a mensal. Deixar para um clique no painel depois do deploy
-- abriria uma janela em que o site mostraria as quartas, quintas e sábados que
-- tinham sido abertos para teste, e a mensal não teria quatro terças para
-- vender.
--
-- Idempotente e conservadora: nada é APAGADO, e nada com gente dentro muda.

-- Seis lugares é a mesa inteira, dividida entre mensal e avulsa.
update servicos set vagas_padrao = 6 where slug = 'aula-avulsa';

-- Tira do ar (não apaga) o que não é terça às 10h ou às 13h30. Só futuro e só
-- vazio: um horário com reserva em cima fica como está, para a Isabela decidir.
update horarios h
   set publicado = false
  from servicos s
 where s.id = h.servico_id
   and s.slug = 'aula-avulsa'
   and h.publicado
   and h.inicio > now()
   and h.ocupadas = 0
   and (
     extract(isodow from h.inicio at time zone 'America/Sao_Paulo') <> 2
     or to_char(h.inicio at time zone 'America/Sao_Paulo', 'HH24:MI') not in ('10:00', '13:30')
   );

-- Abre as próximas oito terças, nos dois horários. `greatest` impede o CHECK de
-- estourar se algum horário já tiver mais gente do que as vagas novas.
insert into horarios (servico_id, inicio, vagas)
select s.id,
       (d::date + t::time) at time zone 'America/Sao_Paulo',
       6
  from servicos s
 cross join generate_series(
         (now() at time zone 'America/Sao_Paulo')::date,
         (now() at time zone 'America/Sao_Paulo')::date + 62,
         interval '1 day'
       ) as d
 cross join (values ('10:00'), ('13:30')) as horas (t)
 where s.slug = 'aula-avulsa'
   and extract(isodow from d) = 2
   and (d::date + t::time) at time zone 'America/Sao_Paulo' > now()
on conflict (servico_id, inicio) do update
   set publicado = true,
       vagas = greatest(excluded.vagas, horarios.ocupadas);
