// Aplicador de migrations.
//
// POR QUE NÃO RODA NO BOOT DO CONTÊINER: `docker compose up -d` destrói o
// contêiner antigo ANTES de o novo subir. Migration ruim no boot = crashloop
// com o site já fora do ar e sem rollback. Aqui ele roda como PASSO DE
// RELEASE no deploy (`docker compose run --rm site node scripts/migrar.mjs`,
// entre o `pull` e o `up -d`): se falhar, o `set -e` do deploy aborta, o job
// fica vermelho e o site ANTIGO continua de pé e saudável.
//
// Uso:
//   node scripts/migrar.mjs           aplica o que falta
//   node scripts/migrar.mjs --status  só lista, não aplica

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const AQUI = dirname(fileURLToPath(import.meta.url));
const PASTA = join(AQUI, "..", "db", "migracoes");

// Número arbitrário porém fixo: dois deploys simultâneos pegam o mesmo lock e
// o segundo espera, em vez de aplicarem a mesma migration em paralelo.
const TRAVA = 8_140_2601;

const somenteStatus = process.argv.includes("--status");

function arquivos() {
  return readdirSync(PASTA)
    .filter((n) => n.endsWith(".sql"))
    .sort(); // 001-, 002-, ... — a ordem do nome É a ordem de aplicação
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("migrar: DATABASE_URL ausente.");
    process.exit(1);
  }

  // Client dedicado, não Pool: o advisory lock vive na CONEXÃO. Num pool, cada
  // query pode sair numa conexão diferente e o lock seria solto na hora.
  const cliente = new pg.Client({ connectionString: url });
  await cliente.connect();

  try {
    await cliente.query(
      `create table if not exists migracoes (
         nome       text primary key,
         aplicada_em timestamptz not null default now()
       )`
    );

    await cliente.query("select pg_advisory_lock($1)", [TRAVA]);

    const { rows } = await cliente.query("select nome from migracoes");
    const aplicadas = new Set(rows.map((r) => r.nome));
    const pendentes = arquivos().filter((n) => !aplicadas.has(n));

    if (somenteStatus) {
      for (const n of arquivos()) {
        console.log(`${aplicadas.has(n) ? "✓" : "·"} ${n}`);
      }
      return;
    }

    if (pendentes.length === 0) {
      console.log(`migrar: nada a fazer (${aplicadas.size} já aplicadas).`);
      return;
    }

    for (const nome of pendentes) {
      const sql = readFileSync(join(PASTA, nome), "utf8");
      // Cada migration na PRÓPRIA transação, com o registro dentro dela: ou o
      // schema e o registro avançam juntos, ou nenhum dos dois.
      await cliente.query("begin");
      try {
        await cliente.query(sql);
        await cliente.query("insert into migracoes (nome) values ($1)", [nome]);
        await cliente.query("commit");
        console.log(`migrar: ${nome} aplicada.`);
      } catch (err) {
        await cliente.query("rollback");
        console.error(`migrar: ${nome} FALHOU — nada foi aplicado dela.`);
        throw err;
      }
    }

    console.log(`migrar: ${pendentes.length} aplicada(s).`);
  } finally {
    // O lock cairia junto com a conexão, mas soltar explicitamente deixa o
    // erro de uma migration ruim aparecer sozinho no log.
    await cliente.query("select pg_advisory_unlock($1)", [TRAVA]).catch(() => {});
    await cliente.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
