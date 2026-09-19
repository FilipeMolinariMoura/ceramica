import { Pool, type PoolClient } from "pg";

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
    // Era 5, quando o único caminho de escrita era o formulário de inscrição.
    // O mesmo pool agora serve página pública, agenda, painel, webhook de
    // pagamento e reconciliação: com 5, uma rajada no checkout deixaria o site
    // inteiro sem conexão para renderizar a home.
    max: 12,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // Sem estes dois, uma consulta travada ou uma transação esquecida aberta
    // segura uma conexão para sempre e o pool morre por vazamento. Com eles, o
    // Postgres derruba o caso patológico e a conexão volta.
    statement_timeout: 10_000,
    idle_in_transaction_session_timeout: 15_000,
  });

  // Sem este handler, um erro em conexão ociosa (o banco reiniciou, por
  // exemplo) derruba o processo do Node inteiro — o site sairia do ar por
  // causa do banco.
  pool.on("error", (err) => {
    console.error("[db] erro em conexão ociosa:", err.message);
  });

  global_.__poolCeramica = pool;
  return pool;
}

/**
 * Roda `fn` dentro de UMA transação, na MESMA conexão.
 *
 * Existe porque `db().query()` faz checkout e devolve a conexão a cada
 * chamada: um `begin` por ali fica numa conexão que volta para o pool no
 * mesmo instante, e o `insert` seguinte sai em outra, fora de transação
 * nenhuma. O bug é invisível em teste manual e só aparece com duas pessoas
 * clicando no mesmo segundo.
 *
 * NÃO faça I/O externo aqui dentro. Uma chamada HTTP com a transação aberta
 * segura uma conexão pelo tempo do round-trip; um punhado delas esgota o pool
 * e derruba o site inteiro, não só o caminho que chamou.
 */
export async function emTransacao<T>(
  fn: (cx: PoolClient) => Promise<T>
): Promise<T> {
  const cx = await db().connect();
  try {
    await cx.query("begin");
    const resultado = await fn(cx);
    await cx.query("commit");
    return resultado;
  } catch (err) {
    // O rollback pode falhar se a conexão já morreu; o erro que importa é o
    // original, então o de rollback é engolido de propósito.
    await cx.query("rollback").catch(() => {});
    throw err;
  } finally {
    cx.release();
  }
}
