import { Pool } from "pg";

/**
 * Postgres da própria stack — `ceramica-db`, na rede interna do compose, sem
 * porta publicada.
 *
 * Saiu do Supabase em setembro de 2026: guardar lead de formulário não
 * justificava uma dependência externa, com chave de service_role circulando e
 * um serviço fora da máquina para uma tabela só. O banco agora vive ao lado do
 * site, é backupeado pelo mesmo cron das outras stacks e não fala com o banco
 * do Prisma.
 *
 * O pool é criado uma vez por processo e guardado no globalThis: em
 * desenvolvimento o hot reload reavalia o módulo a cada mudança, e sem isto
 * cada reload abriria um pool novo até estourar o limite de conexões.
 */

const global_ = globalThis as typeof globalThis & { __poolCeramica?: Pool };

export function db(): Pool {
  if (global_.__poolCeramica) return global_.__poolCeramica;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL ausente: defina no .env (ver .env.example e o README)."
    );
  }

  const pool = new Pool({
    connectionString: url,
    // Site de baixo tráfego com um único caminho de escrita. Um punhado de
    // conexões é mais que suficiente, e o teto baixo protege o Postgres de
    // uma rajada de bots no formulário.
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  // Sem este handler, um erro em conexão ociosa (o banco reiniciou, por
  // exemplo) derruba o processo do Node inteiro — o site sairia do ar por
  // causa do banco de leads.
  pool.on("error", (err) => {
    console.error("[db] erro em conexão ociosa:", err.message);
  });

  global_.__poolCeramica = pool;
  return pool;
}
