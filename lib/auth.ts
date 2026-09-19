import "server-only";
import {
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { COOKIE_SESSAO } from "@/lib/auth-cookie";

/**
 * Autenticação do painel.
 *
 * Uma pessoa só usa este painel. Por isso: sem biblioteca de auth, sem OAuth,
 * sem dependência nova. `scrypt` vem do próprio Node e é o que se deve usar
 * para senha — lento e caro em memória de propósito, ao contrário de um
 * `sha256` cru, que uma GPU testa aos bilhões por segundo.
 *
 * `server-only` no topo não é decoração: se algum dia um import deste arquivo
 * escapar para um componente de cliente, o build QUEBRA em vez de embarcar o
 * hash da senha no bundle que vai para o navegador.
 */

const scrypt = promisify(scryptCb) as (
  senha: string,
  sal: Buffer,
  tamanho: number
) => Promise<Buffer>;

export { COOKIE_SESSAO };
const DIAS_DE_SESSAO = 30;

/* ── Senha ─────────────────────────────────────────────────────────────── */

export async function gerarHash(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const chave = await scrypt(senha, sal, 64);
  return `scrypt$${sal.toString("hex")}$${chave.toString("hex")}`;
}

export async function senhaConfere(senha: string, guardado: string): Promise<boolean> {
  const [algoritmo, salHex, chaveHex] = guardado.split("$");
  if (algoritmo !== "scrypt" || !salHex || !chaveHex) return false;

  const esperado = Buffer.from(chaveHex, "hex");
  const obtido = await scrypt(senha, Buffer.from(salHex, "hex"), esperado.length);

  // `timingSafeEqual` e não `===`: comparação que sai no primeiro byte
  // diferente vaza, pelo tempo de resposta, quantos bytes estavam certos.
  return obtido.length === esperado.length && timingSafeEqual(obtido, esperado);
}

/* ── Sessão ────────────────────────────────────────────────────────────── */

/** Só o hash do token vai para o banco — vazamento de dump não vira sessão. */
function hashDoToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function criarSessao(usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");

  await db().query(
    `insert into sessoes (usuario_id, token_hash, expira_em)
     values ($1, $2, now() + make_interval(days => $3::int))`,
    [usuarioId, hashDoToken(token), DIAS_DE_SESSAO]
  );

  const jar = await cookies();
  jar.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    // Em desenvolvimento o site é http://localhost; `secure` ali impediria o
    // cookie de ser gravado e o login nunca terminaria.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS_DE_SESSAO * 24 * 60 * 60,
  });
}

export type Usuario = { id: string; nome: string; email: string };

/**
 * Quem está logado, ou `null`.
 *
 * Faz a faxina de sessões vencidas de passagem — não vale um cron para isto.
 */
export async function usuarioDaSessao(): Promise<Usuario | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  const { rows } = await db().query(
    `select u.id, u.nome, u.email
       from sessoes s join usuarios u on u.id = s.usuario_id
      where s.token_hash = $1 and s.expira_em > now()`,
    [hashDoToken(token)]
  );

  if (!rows[0]) return null;
  return { id: rows[0].id, nome: rows[0].nome, email: rows[0].email };
}

/**
 * Exige sessão. Use na PRIMEIRA LINHA de toda Server Action do painel.
 *
 * O `middleware.ts` protege as PÁGINAS de `/painel`, e só elas. Cada Server
 * Action é um endpoint POST próprio, invocável direto, que não passa pela
 * mesma checagem — proteger a página e esquecer a action deixaria o painel
 * inteiro aberto por trás de uma porta trancada.
 *
 * REDIRECIONA em vez de lançar. `redirect()` vale nos dois contextos: numa
 * página, manda para a tela de entrada; numa action chamada direto, corta a
 * execução antes de qualquer escrita. Lançar `Error` dava um 500 com digest
 * opaco na tela — sintoma de bug, e não de "faça login".
 */
export async function exigirSessao(): Promise<Usuario> {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/painel/entrar");
  return usuario;
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (token) {
    await db().query(`delete from sessoes where token_hash = $1`, [hashDoToken(token)]);
  }
  jar.delete(COOKIE_SESSAO);
}

/* ── Login ─────────────────────────────────────────────────────────────── */

/** Tentativas por IP numa janela — freio de força bruta. */
const TENTATIVAS = 8;
const JANELA_MIN = 15;

export async function podeTentarLogin(ip: string): Promise<boolean> {
  // Banco, e não memória: aqui o contador NÃO pode zerar a cada deploy, e o
  // custo de uma consulta por tentativa de login é irrelevante.
  await db().query(
    `delete from tentativas_login where em < now() - make_interval(mins => $1::int)`,
    [JANELA_MIN]
  );
  const { rows } = await db().query<{ n: string }>(
    `select count(*)::text as n from tentativas_login
      where ip = $1 and em > now() - make_interval(mins => $2::int)`,
    [ip, JANELA_MIN]
  );
  return Number(rows[0]?.n ?? 0) < TENTATIVAS;
}

export async function registrarTentativa(ip: string): Promise<void> {
  await db().query(`insert into tentativas_login (ip) values ($1)`, [ip]);
}

export async function limparTentativas(ip: string): Promise<void> {
  await db().query(`delete from tentativas_login where ip = $1`, [ip]);
}

export async function autenticar(
  email: string,
  senha: string
): Promise<Usuario | null> {
  const { rows } = await db().query(
    `select id, nome, email, senha_hash from usuarios where lower(email) = lower($1)`,
    [email]
  );
  const u = rows[0];

  // Mesmo sem usuário, gastamos o tempo de um scrypt contra um hash de
  // mentira. Responder rápido para e-mail inexistente e devagar para e-mail
  // real entrega quais endereços existem.
  if (!u) {
    await senhaConfere(senha, `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`);
    return null;
  }

  if (!(await senhaConfere(senha, u.senha_hash))) return null;
  return { id: u.id, nome: u.nome, email: u.email };
}
