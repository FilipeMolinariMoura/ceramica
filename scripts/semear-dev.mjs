// Horários de brincadeira para desenvolver.
//
// Não existe equivalente em produção de propósito: lá quem abre horário é a
// Isabela, pelo painel. Aqui serve só para a agenda ter o que mostrar.
//
// Uso:  npm run semear:dev

import pg from "pg";

const URL = process.env.DATABASE_URL ?? "postgres://ceramica:dev@localhost:5432/ceramica";
if (!/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(URL)) {
  console.error("semear-dev: só roda em localhost.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: URL });

// Garante o serviço em vez de exigir que a migration 003 ainda esteja de pé:
// ela roda uma vez só, e qualquer `delete` no banco de desenvolvimento a
// deixaria sem volta.
await pool.query(
  `insert into servicos (slug, nome, descricao, duracao_min, preco_centavos, vagas_padrao, ordem)
   values ('aula-avulsa', 'Aula avulsa de cerâmica',
           'Duas horas no torno ou na modelagem, com acompanhamento individual.',
           120, 25000, 4, 1)
   on conflict (slug) do nothing`
);

const { rows } = await pool.query(
  `select id, vagas_padrao from servicos where slug = 'aula-avulsa'`
);
const { id, vagas_padrao } = rows[0];

// Terças e quintas, 9h30 e 14h, nas próximas cinco semanas.
let criados = 0;
for (let d = 1; d <= 35; d++) {
  for (const hora of ["09:30", "14:00"]) {
    const r = await pool.query(
      `insert into horarios (servico_id, inicio, vagas)
       select $1,
              ((current_date + make_interval(days => $2::int)) + $3::time)
                at time zone 'America/Sao_Paulo',
              $4
        where extract(dow from current_date + make_interval(days => $2::int)) in (2, 4)
       on conflict (servico_id, inicio) do nothing
       returning id`,
      [id, d, hora, vagas_padrao]
    );
    criados += r.rowCount ?? 0;
  }
}

console.log(`semear-dev: ${criados} horários criados.`);
await pool.end();
