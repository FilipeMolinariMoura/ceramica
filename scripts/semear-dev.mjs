// Agenda de desenvolvimento, no mesmo formato da real.
//
// Em produção quem abre horário é a Isabela, pelo painel (ou a migration 007,
// uma vez). Aqui serve para a agenda ter o que mostrar — e segue a agenda de
// verdade, terças às 10h e às 13h30 com seis lugares, porque desenvolver em
// cima de horário inventado esconde exatamente os casos que importam: a
// mensal precisa de quatro terças seguidas na mesma turma.
//
// Uso:  npm run semear:dev

import pg from "pg";

const URL = process.env.DATABASE_URL ?? "postgres://ceramica:dev@localhost:5432/ceramica";
if (!/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(URL)) {
  console.error("semear-dev: só roda em localhost.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: URL });

// Garante os serviços em vez de exigir que as migrations 003 e 006 ainda
// estejam de pé: elas rodam uma vez só, e qualquer `delete` no banco de
// desenvolvimento as deixaria sem volta.
await pool.query(
  `insert into servicos (slug, nome, descricao, duracao_min, preco_centavos, vagas_padrao, ordem)
   values ('aula-avulsa', 'Aula avulsa de cerâmica',
           'Duas horas no torno ou na modelagem, com acompanhamento individual.',
           120, 25000, 6, 1)
   on conflict (slug) do nothing`
);
await pool.query(
  `insert into servicos (slug, nome, descricao, duracao_min, preco_centavos,
                         preco_cartao_centavos, vagas_padrao, aulas, ordem)
   values ('turma-mensal', 'Turma mensal de cerâmica',
           'Quatro terças seguidas, na mesma turma, com a mesma mesa.',
           120, 80000, 83508, 6, 4, 2)
   on conflict (slug) do nothing`
);

const { rows } = await pool.query(
  `select id, vagas_padrao from servicos where slug = 'aula-avulsa'`
);
const { id, vagas_padrao } = rows[0];

// Terças, 10h e 13h30, nas próximas oito semanas.
const r = await pool.query(
  `insert into horarios (servico_id, inicio, vagas)
   select $1, (d::date + t::time) at time zone 'America/Sao_Paulo', $2
     from generate_series(
            (now() at time zone 'America/Sao_Paulo')::date,
            (now() at time zone 'America/Sao_Paulo')::date + 56,
            interval '1 day') as d
    cross join (values ('10:00'), ('13:30')) as horas (t)
    where extract(isodow from d) = 2
      and (d::date + t::time) at time zone 'America/Sao_Paulo' > now()
   on conflict (servico_id, inicio) do nothing`,
  [id, vagas_padrao]
);

console.log(`semear-dev: ${r.rowCount ?? 0} horários criados.`);
await pool.end();
