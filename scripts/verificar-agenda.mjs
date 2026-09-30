// Verificação das invariantes da agenda.
//
// O repositório não tem suíte de testes, e estas regras são as que impedem
// vender a mesma vaga duas vezes ou liberar uma aula sem pagamento. Elas não
// podem quebrar em silêncio numa refatoração futura:
//
//   1. N pessoas simultâneas em V vagas produzem exatamente V reservas;
//   2. holds vencidos devolvem UMA vaga cada, inclusive vários no mesmo horário
//      (o `group by` existe por isto: `update ... from` afeta a linha-alvo uma
//      vez só, por mais linhas que casem na origem);
//   3. a mesma transação da InfinitePay não confirma duas compras;
//   4. nenhum caminho consegue estourar a lotação — o CHECK é a rede;
//   5. pacote da mensal: tudo ou nada, com avulsas disputando os mesmos
//      lugares ao mesmo tempo, sem deadlock e sem pacote pela metade;
//   6. o pacote vencido devolve os quatro lugares uma vez só;
//   7. pagamento tardio de pacote retoma aula por aula.
//
// O SQL crítico aqui é CÓPIA do que está em `lib/agenda.ts` e
// `lib/reservas.ts` (este script é JavaScript puro e não importa TypeScript).
// Mudou lá, muda aqui.
//
// Uso:  DATABASE_URL=postgres://... node scripts/verificar-agenda.mjs
//
// APAGA os dados de agenda de teste do banco apontado. Por isso só roda em
// localhost, a menos que se passe --eu-sei-o-que-estou-fazendo.

import pg from "pg";
import { randomBytes } from "node:crypto";

const URL = process.env.DATABASE_URL ?? "postgres://ceramica:dev@localhost:5432/ceramica";

const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(URL);
if (!local && !process.argv.includes("--eu-sei-o-que-estou-fazendo")) {
  console.error(
    "verificar-agenda: este script APAGA reservas, horários e serviços.\n" +
      "O DATABASE_URL não aponta para localhost — recusando por segurança."
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: URL, max: 30 });
const q = (s, p) => pool.query(s, p);
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? "PASSA" : "FALHA"}  ${m}`); if (!c) falhas++; };
const token = () => randomBytes(32).toString("hex");

// Slugs próprios, para este script nunca encostar em dado real. A limpeza
// remove apenas o que tem estes serviços como dono.
const SLUG_TESTE = "__verificacao";
const SLUG_MENSAL = "__verificacao_mensal";

// Cópia de `expirarVencidas` (lib/agenda.ts).
const SQL_EXPIRAR = `
  with vencidas as (
    update reservas set status = 'expirada'
     where id in (
       select id from reservas
        where status = 'pendente' and expira_em <= now()
        for update skip locked
     )
    returning horario_id
  ), por_horario as (
    select horario_id, count(*)::smallint as n from vencidas group by horario_id
  ), devolvidas as (
    update horarios h set ocupadas = greatest(h.ocupadas - p.n, 0)
    from por_horario p where h.id = p.horario_id
    returning p.n
  )
  select coalesce(sum(n), 0)::int as total from devolvidas`;
const SQL_EXPIRAR_PACOTES = `
  update pacotes set status = 'expirada'
   where id in (
     select id from pacotes where status = 'pendente' and expira_em <= now()
     for update skip locked
   )`;

async function limpar() {
  await q(
    `delete from reservas where horario_id in (
       select h.id from horarios h join servicos s on s.id = h.servico_id where s.slug = $1)`,
    [SLUG_TESTE]
  );
  await q(
    `delete from pacotes where servico_id in (select id from servicos where slug = $1)`,
    [SLUG_MENSAL]
  );
  await q(`delete from servicos where slug = any($1)`, [[SLUG_TESTE, SLUG_MENSAL]]);
}

async function emTransacao(fn) {
  const cx = await pool.connect();
  try {
    await cx.query("begin");
    const r = await fn(cx);
    await cx.query("commit");
    return r;
  } catch (e) {
    await cx.query("rollback").catch(() => {});
    throw e;
  } finally {
    cx.release();
  }
}

await limpar();
const { rows: [s] } = await q(
  `insert into servicos (slug,nome,duracao_min,preco_centavos,vagas_padrao)
   values ($1,'Serviço de verificação',120,25000,4) returning id`, [SLUG_TESTE]);
const { rows: [sm] } = await q(
  `insert into servicos (slug,nome,duracao_min,preco_centavos,preco_cartao_centavos,vagas_padrao,aulas)
   values ($1,'Mensal de verificação',120,80000,83508,6,4) returning id`, [SLUG_MENSAL]);
const { rows: [h] } = await q(
  `insert into horarios (servico_id, inicio, vagas) values ($1, now() + interval '3 days', 4) returning id`, [s.id]);

// ── 1. Concorrência: 12 tentativas simultâneas em 4 vagas ────────────────
async function tentarReservar(horarioId, i, prefixo = "p") {
  try {
    return await emTransacao(async (cx) => {
      const vaga = await cx.query(
        `update horarios h set ocupadas = h.ocupadas + 1 from servicos s
          where h.id=$1 and s.id=h.servico_id and h.publicado and s.ativo
            and h.ocupadas < h.vagas and h.inicio > now()
          returning h.id, s.preco_centavos`, [horarioId]);
      if (vaga.rowCount === 0) throw new Error("esgotado");
      const r = await cx.query(
        `insert into reservas (horario_id,nome,email,whatsapp,valor_centavos,token,expira_em)
         values ($1,$2,$3,$4,$5,$6, now() + interval '20 minutes') returning id`,
        [horarioId, `Pessoa ${i}`, `${prefixo}${i}@ex.com`, "11999999999", 25000, token()]);
      await cx.query(`insert into pagamentos (reserva_id, order_nsu, valor_centavos) values ($1,$2,$3)`,
        [r.rows[0].id, `ord-${prefixo}-${i}-${token().slice(0, 8)}`, 25000]);
      return r.rows[0].id;
    });
  } catch (e) {
    if (e.code === "40P01") deadlocks++;
    return null;
  }
}
let deadlocks = 0;
const res = await Promise.all(Array.from({ length: 12 }, (_, i) => tentarReservar(h.id, i)));
const venceram = res.filter(Boolean).length;
ok(venceram === 4, `12 tentativas simultâneas em 4 vagas -> ${venceram} vencedores (esperado 4)`);
const { rows: [c1] } = await q(`select ocupadas, vagas from horarios where id=$1`, [h.id]);
ok(Number(c1.ocupadas) === 4, `contador em ${c1.ocupadas}/${c1.vagas} (esperado 4/4)`);
const { rows: [n1] } = await q(`select count(*)::int n from reservas where horario_id=$1`, [h.id]);
ok(n1.n === 4, `${n1.n} reservas gravadas (esperado 4) — sem reserva orfã`);

// ── 2. Expiração agregada: 3 holds vencem no MESMO horário ───────────────
await q(`update reservas set expira_em = now() - interval '1 minute'
          where id in (select id from reservas where horario_id=$1 limit 3)`, [h.id]);
const { rows: [dev] } = await q(SQL_EXPIRAR);
ok(dev.total === 3, `3 holds vencidos no mesmo horário -> ${dev.total} vagas devolvidas (esperado 3)`);
const { rows: [c2] } = await q(`select ocupadas from horarios where id=$1`, [h.id]);
ok(Number(c2.ocupadas) === 1, `contador voltou para ${c2.ocupadas} (esperado 1)`);

// ── 3. Idempotência: varrer de novo não devolve nada ─────────────────────
const { rows: [dev2] } = await q(SQL_EXPIRAR);
ok(dev2.total === 0, `varredura repetida devolveu ${dev2.total} (esperado 0)`);

// ── 4. transaction_nsu não pode confirmar duas reservas ──────────────────
const { rows: rs } = await q(`select id from reservas where horario_id=$1 limit 2`, [h.id]);
await q(`update pagamentos set transaction_nsu='TX-UNICA' where reserva_id=$1`, [rs[0].id]);
let barrou = false;
try { await q(`update pagamentos set transaction_nsu='TX-UNICA' where reserva_id=$1`, [rs[1].id]); }
catch (e) { barrou = e.code === "23505"; }
ok(barrou, "reusar transaction_nsu em outra reserva foi barrado pelo banco (23505)");

// ── 5. CHECK impede estouro mesmo por caminho que esqueça a regra ────────
let checou = false;
try { await q(`update horarios set ocupadas = vagas + 1 where id=$1`, [h.id]); }
catch (e) { checou = e.code === "23514"; }
ok(checou, "estourar a lotação por fora foi barrado pelo CHECK (23514)");

/* ── Pacote da turma mensal ────────────────────────────────────────────── */

// Quatro terças de seis lugares, como a agenda real.
const { rows: tercas } = await q(
  `insert into horarios (servico_id, inicio, vagas)
   select $1, now() + make_interval(days => 7 * g), 6 from generate_series(1, 4) g
   returning id`, [s.id]);
const ids = tercas.map((t) => Number(t.id)).sort((a, b) => a - b);

// Cópia do núcleo de `criarPacote` (lib/reservas.ts): trava em ordem de id,
// toma os quatro num update só, e desfaz tudo se não couber nos quatro.
async function comprarPacote(i, meio = "pix") {
  try {
    return await emTransacao(async (cx) => {
      await cx.query(`select id from horarios where id = any($1) order by id for update`, [ids]);
      const tomada = await cx.query(
        `update horarios set ocupadas = ocupadas + 1
          where id = any($1) and publicado and ocupadas < vagas and inicio > now()`, [ids]);
      if (tomada.rowCount !== ids.length) throw new Error("esgotado");
      const valor = meio === "pix" ? 80000 : 83508;
      const pk = await cx.query(
        `insert into pacotes (servico_id, turma, nome, email, whatsapp, meio, valor_centavos, token, expira_em)
         values ($1,'manha',$2,$3,'11999999999',$4,$5,$6, now() + interval '20 minutes')
         returning id, expira_em`,
        [sm.id, `Mensal ${i}`, `m${i}@ex.com`, meio, valor, token()]);
      for (const hid of ids) {
        await cx.query(
          `insert into reservas (horario_id, pacote_id, nome, email, whatsapp, valor_centavos, token, expira_em)
           values ($1,$2,$3,$4,'11999999999',0,$5,$6)`,
          [hid, pk.rows[0].id, `Mensal ${i}`, `m${i}@ex.com`, token(), pk.rows[0].expira_em]);
      }
      await cx.query(`insert into pagamentos (pacote_id, order_nsu, valor_centavos) values ($1,$2,$3)`,
        [pk.rows[0].id, `ord-pk-${i}-${token().slice(0, 8)}`, valor]);
      return pk.rows[0].id;
    });
  } catch (e) {
    if (e.code === "40P01") deadlocks++;
    return null;
  }
}

// Dois pacotes garantidos antes da corrida: os testes 7 e 8 precisam deles,
// e a corrida sozinha pode terminar só com avulsas.
const base = [await comprarPacote("base-1"), await comprarPacote("base-2")];
ok(base.every(Boolean), "dois pacotes comprados em sequência");

// ── 6. 10 pacotes + 8 avulsas ao mesmo tempo, disputando os mesmos lugares ─
deadlocks = 0;
// Intercalados, para que pacote e avulsa cheguem de fato misturados — em
// fila, os pacotes largariam sempre na frente e a disputa não existiria.
const tarefas = [];
for (let i = 0; i < 10; i++) {
  tarefas.push(comprarPacote(i).then((id) => ({ tipo: "pacote", id })));
  if (i < 8) tarefas.push(tentarReservar(ids[1], i, "av").then((id) => ({ tipo: "avulsa", id })));
  // A varredura de expiração rodando no meio, como roda a cada visita.
  if (i === 4) tarefas.push(q(SQL_EXPIRAR).then(() => q(SQL_EXPIRAR_PACOTES)).then(() => ({ tipo: "varredura" })));
}
const corrida = await Promise.all(tarefas);
const pacotesFeitos = corrida.filter((c) => c.tipo === "pacote" && c.id).map((c) => c.id);
const avulsasFeitas = corrida.filter((c) => c.tipo === "avulsa" && c.id).map((c) => c.id);
ok(deadlocks === 0, `nenhum deadlock na corrida (${deadlocks})`);
// 18 pessoas querendo a 2ª terça, que tinha 4 lugares livres: ela TEM de
// lotar, e com exatamente 4 — nem menos (vaga perdida), nem mais (venda dobrada).
ok(pacotesFeitos.length + avulsasFeitas.length === 4,
  `${pacotesFeitos.length} pacotes + ${avulsasFeitas.length} avulsas na terça disputada (esperado 4 no total)`);

const { rows: lotacao } = await q(
  `select h.id, h.ocupadas, h.vagas,
          (select count(*)::int from reservas r where r.horario_id = h.id and r.status = 'pendente') as reais
     from horarios h where h.id = any($1) order by h.id`, [ids]);
ok(lotacao.every((l) => Number(l.ocupadas) <= 6),
  `nenhuma terça passou de 6 (${lotacao.map((l) => l.ocupadas).join(", ")})`);
ok(lotacao.every((l) => Number(l.ocupadas) === l.reais),
  "contador de cada terça bate com as reservas em aberto nela");
const { rows: filhas } = await q(
  `select pk.id, count(r.id)::int as n from pacotes pk
     left join reservas r on r.pacote_id = pk.id
    where pk.servico_id = $1 group by pk.id`, [sm.id]);
ok(filhas.every((f) => f.n === 4), `todo pacote tem exatamente 4 aulas (${filhas.map((f) => f.n).join(",")})`);
ok(filhas.length === pacotesFeitos.length + 2, "nenhum pacote pela metade ficou gravado");

// ── 7. Pacote vencido devolve os 4 lugares, uma vez só ────────────────────
const alvo = base[0];
const antes = (await q(`select sum(ocupadas)::int n from horarios where id = any($1)`, [ids])).rows[0].n;
await q(`update pacotes set expira_em = now() - interval '1 minute' where id = $1`, [alvo]);
await q(`update reservas set expira_em = now() - interval '1 minute' where pacote_id = $1`, [alvo]);
const { rows: [dv] } = await q(SQL_EXPIRAR);
await q(SQL_EXPIRAR_PACOTES);
ok(dv.total === 4, `pacote vencido devolveu ${dv.total} lugares (esperado 4)`);
const { rows: [stPk] } = await q(`select status from pacotes where id = $1`, [alvo]);
ok(stPk.status === "expirada", `pacote vencido ficou '${stPk.status}' (esperado expirada)`);
const { rows: [dv2] } = await q(SQL_EXPIRAR);
ok(dv2.total === 0, `varrer de novo devolveu ${dv2.total} (esperado 0)`);
const depois = (await q(`select sum(ocupadas)::int n from horarios where id = any($1)`, [ids])).rows[0].n;
ok(antes - depois === 4, `contadores caíram ${antes - depois} no total (esperado 4)`);

// ── 8. liberarPacote é idempotente ────────────────────────────────────────
// Cópia de `liberarPacote` + `devolverFilhas`.
async function liberarPacote(id) {
  return emTransacao(async (cx) => {
    const t = await cx.query(`select id from pacotes where id=$1 and status='pendente' for update`, [id]);
    if (t.rowCount === 0) return 0;
    await cx.query(`update pacotes set status='cancelada' where id=$1`, [id]);
    const r = await cx.query(
      `with filhas as (select id from reservas where pacote_id=$1 and status='pendente' order by id for update),
            mudadas as (update reservas r set status='cancelada' from filhas f where r.id=f.id returning r.horario_id)
       update horarios h set ocupadas = h.ocupadas - 1 from mudadas m where h.id=m.horario_id and h.ocupadas > 0`,
      [id]);
    return r.rowCount;
  });
}
const segundo = base[1];
const [l1, l2] = [await liberarPacote(segundo), await liberarPacote(segundo)];
ok(l1 === 4 && l2 === 0, `liberar o mesmo pacote duas vezes devolveu ${l1} e depois ${l2} (esperado 4 e 0)`);

// ── 9. Pagamento tem exatamente um dono ───────────────────────────────────
let semDono = false;
try { await q(`insert into pagamentos (order_nsu, valor_centavos) values ($1, 1)`, [`ord-x-${token()}`]); }
catch (e) { semDono = e.code === "23514"; }
ok(semDono, "pagamento sem reserva nem pacote foi barrado (23514)");
let doisDonos = false;
try {
  await q(`insert into pagamentos (reserva_id, pacote_id, order_nsu, valor_centavos) values ($1,$2,$3,1)`,
    [rs[0].id, alvo, `ord-y-${token()}`]);
} catch (e) { doisDonos = e.code === "23514"; }
ok(doisDonos, "pagamento com dois donos foi barrado (23514)");

// ── 10. Aula de pacote não carrega valor ──────────────────────────────────
let filhaComValor = false;
try {
  await q(`insert into reservas (horario_id, pacote_id, nome, email, whatsapp, valor_centavos, token, expira_em)
           values ($1,$2,'x','x@ex.com','11999999999',100,$3, now())`, [h.id, alvo, token()]);
} catch (e) { filhaComValor = e.code === "23514"; }
ok(filhaComValor, "aula de pacote com valor foi barrada");

// ── 11. O comprovante de uma avulsa não confirma um pacote ────────────────
let cruzado = false;
try { await q(`update pagamentos set transaction_nsu='TX-UNICA' where pacote_id=$1`, [alvo]); }
catch (e) { cruzado = e.code === "23505"; }
ok(cruzado, "transaction_nsu de avulsa reusado num pacote foi barrado (23505)");

// ── 12. Pagamento tardio retoma aula por aula ─────────────────────────────
// O pacote `alvo` venceu e devolveu os lugares. Lotamos UMA das terças e
// confirmamos como `confirmarPacote` faria: essa aula fica sem vaga, as
// outras três voltam.
await q(`update horarios set ocupadas = vagas where id = $1`, [ids[2]]);
const estados = await emTransacao(async (cx) => {
  await cx.query(`select id from pacotes where id=$1 for update`, [alvo]);
  const { rows: fs } = await cx.query(
    `select id, status, horario_id from reservas where pacote_id=$1 order by id for update`, [alvo]);
  const saida = [];
  for (const f of fs) {
    let tem = true;
    if (f.status === "expirada" || f.status === "cancelada") {
      const r = await cx.query(
        `update horarios set ocupadas = ocupadas + 1 where id=$1 and ocupadas < vagas returning id`, [f.horario_id]);
      tem = r.rowCount > 0;
    }
    const st = tem ? "confirmada" : "paga_sem_vaga";
    await cx.query(`update reservas set status=$2 where id=$1`, [f.id, st]);
    saida.push(st);
  }
  return saida;
});
const conf = estados.filter((e) => e === "confirmada").length;
const semVaga = estados.filter((e) => e === "paga_sem_vaga").length;
ok(conf === 3 && semVaga === 1, `retomada tardia: ${conf} confirmadas e ${semVaga} sem vaga (esperado 3 e 1)`);
const { rows: finais } = await q(`select ocupadas, vagas from horarios where id = any($1)`, [ids]);
ok(finais.every((f) => Number(f.ocupadas) <= Number(f.vagas)), "a retomada não passou de nenhuma lotação");

// Limpa o que este script criou. Sem isto sobra horário de mentira no banco
// de desenvolvimento, que depois aparece na agenda como aula fantasma.
// A ordem importa: `horarios` NÃO tem cascade para `reservas`, de propósito —
// apagar um horário com reserva paga em cima teria que ser barrado, e é. Então
// as reservas saem primeiro (levando os pagamentos por cascade), depois os
// pacotes, e só aí os serviços.
await limpar();

await pool.end();
console.log(falhas === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
