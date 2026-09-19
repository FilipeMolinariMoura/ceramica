// Cria (ou troca a senha de) o acesso da Isabela ao painel.
//
// Não há tela de cadastro no site, de propósito: uma pessoa só usa este
// painel, e um endpoint público de criação de conta seria só superfície de
// ataque. A conta nasce daqui, à mão.
//
// Uso:
//   npm run usuario -- isabela@exemplo.com "Isabela Molinari"
//
// A senha NÃO vai na linha de comando — ela é pedida no terminal, para não
// ficar gravada no histórico do shell. Na VPS:
//   docker compose -f docker-compose.prod.yml run --rm -it site \
//     node scripts/criar-usuario.mjs email@dela "Isabela Molinari"

import { createInterface } from "node:readline/promises";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scrypt = promisify(scryptCb);

const [email, nome] = process.argv.slice(2);
if (!email || !nome) {
  console.error('uso: node scripts/criar-usuario.mjs <email> "<nome>"');
  process.exit(1);
}

const URL = process.env.DATABASE_URL;
if (!URL) {
  console.error("criar-usuario: DATABASE_URL ausente.");
  process.exit(1);
}

/**
 * Lê as duas senhas.
 *
 * Com stdin CANALIZADO (teste automatizado, `printf ... | node ...`), o fluxo
 * fecha depois da primeira linha e uma segunda `rl.question` nunca resolve —
 * o processo morre com "unsettled top-level await". Por isso os dois modos
 * são separados em vez de reaproveitar o readline nos dois casos.
 */
async function lerSenhas() {
  if (!process.stdin.isTTY) {
    let bruto = "";
    for await (const parte of process.stdin) bruto += parte;
    const linhas = bruto.split("\n");
    return [linhas[0] ?? "", linhas[1] ?? linhas[0] ?? ""];
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  // Não ecoar a senha: o terminal fica aberto e a tela é lida por quem passa.
  const escrever = rl._writeToOutput?.bind(rl);
  let escondendo = false;
  rl._writeToOutput = (texto) => {
    if (escondendo && !texto.includes("Senha") && !texto.includes("Repita")) return;
    escrever?.(texto);
  };

  escondendo = true;
  const a = await rl.question("Senha: ");
  const b = await rl.question("\nRepita a senha: ");
  escondendo = false;
  rl.close();
  console.log();
  return [a, b];
}

const [senha, repetida] = await lerSenhas();

if (senha !== repetida) {
  console.error("criar-usuario: as senhas não batem.");
  process.exit(1);
}
if (senha.length < 10) {
  console.error("criar-usuario: use pelo menos 10 caracteres.");
  process.exit(1);
}

// Mesmo formato de lib/auth.ts — se um mudar, o outro para de validar.
const sal = randomBytes(16);
const chave = await scrypt(senha, sal, 64);
const hash = `scrypt$${sal.toString("hex")}$${chave.toString("hex")}`;

const cliente = new pg.Client({ connectionString: URL });
await cliente.connect();

const { rows } = await cliente.query(
  `insert into usuarios (email, senha_hash, nome) values ($1, $2, $3)
   on conflict (lower(email)) do update
     set senha_hash = excluded.senha_hash, nome = excluded.nome
   returning id, (xmax = 0) as criado`,
  [email.trim().toLowerCase(), hash, nome.trim()]
);

// Trocar a senha invalida as sessões abertas — é o que se espera de uma troca
// de senha, ainda mais se ela estiver sendo trocada porque vazou.
await cliente.query(`delete from sessoes where usuario_id = $1`, [rows[0].id]);
await cliente.end();

console.log(
  rows[0].criado
    ? `criar-usuario: conta de ${email} criada.`
    : `criar-usuario: senha de ${email} trocada e sessões encerradas.`
);
