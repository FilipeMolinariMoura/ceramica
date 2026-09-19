// Verificação das invariantes da agenda.
//
// O repositório não tem suíte de testes, e estas quatro regras são as que
// impedem vender a mesma vaga duas vezes ou liberar uma aula sem pagamento.
// Elas não podem quebrar em silêncio numa refatoração futura:
//
//   1. N pessoas simultâneas em V vagas produzem exatamente V reservas;
//   2. holds vencidos devolvem UMA vaga cada, inclusive vários no mesmo horário
//      (o `group by` existe por isto: `update ... from` afeta a linha-alvo uma
//      vez só, por mais linhas que casem na origem);
//   3. a mesma transação da InfinitePay não confirma duas reservas;
//   4. nenhum caminho consegue estourar a lotação — o CHECK é a rede.
//
// Uso:  DATABASE_URL=postgres://... node scripts/verificar-agenda.mjs
//
// APAGA os dados de agenda do banco apontado. Por isso só roda em localhost,
// a menos que se passe --eu-sei-o-que-estou-fazendo.

import pg from "pg";

const URL = process.env.DATABASE_URL ?? "postgres://ceramica:dev@localhost:5432/ceramica";

const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(URL);
if (!local && !process.argv.includes("--eu-sei-o-que-estou-fazendo")) {
  console.error(
    "verificar-agenda: este script APAGA reservas, horários e serviços.\n" +
      "O DATABASE_URL não aponta para localhost — recusando por segurança."
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: URL, max: 20 });
const q = (s, p) => pool.query(s, p);
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? "PASSA" : "FALHA"}  ${m}`); if (!c) falhas++; };

// Slug próprio, para este script nunca encostar em dado real. A limpeza no
// fim remove apenas o que tem este serviço como dono.
const SLUG_TESTE = "__verificacao";

await q(
  `delete from reservas where horario_id in (
     select h.id from horarios h join servicos s on s.id = h.servico_id where s.slug = $1)`,
  [SLUG_TESTE]
);
await q(`delete from servicos where slug = $1`, [SLUG_TESTE]);
const { rows: [s] } = await q(
  `insert into servicos (slug,nome,duracao_min,preco_centavos,vagas_padrao)
   values ($1,'Serviço de verificação',120,25000,4) returning id`, [SLUG_TESTE]);
const { rows: [h] } = await q(
  `insert into horarios (servico_id, inicio, vagas) values ($1, now() + interval '3 days', 4) returning id`, [s.id]);

// ── 1. Concorrência: 12 tentativas simultâneas em 4 vagas ────────────────
async function tentarReservar(i) {
  const cx = await pool.connect();
  try {
    await cx.query("begin");
    const vaga = await cx.query(
      `update horarios h set ocupadas = h.ocupadas + 1 from servicos s
        where h.id=$1 and s.id=h.servico_id and h.publicado and s.ativo
          and h.ocupadas < h.vagas and h.inicio > now()
        returning h.id, s.preco_centavos`, [h.id]);
    if (vaga.rowCount === 0) { await cx.query("rollback"); return false; }
    const r = await cx.query(
      `insert into reservas (horario_id,nome,email,whatsapp,valor_centavos,token,expira_em)
       values ($1,$2,$3,$4,$5,$6, now() + interval '20 minutes') returning id`,
      [h.id, `Pessoa ${i}`, `p${i}@ex.com`, "11999999999", 25000, `tok-${i}`]);
    await cx.query(`insert into pagamentos (reserva_id, order_nsu, valor_centavos) values ($1,$2,$3)`,
      [r.rows[0].id, `ord-${i}`, 25000]);
    await cx.query("commit");
    return true;
  } catch { await cx.query("rollback").catch(()=>{}); return false; }
  finally { cx.release(); }
}
const res = await Promise.all(Array.from({ length: 12 }, (_, i) => tentarReservar(i)));
const venceram = res.filter(Boolean).length;
ok(venceram === 4, `12 tentativas simultâneas em 4 vagas -> ${venceram} vencedores (esperado 4)`);
const { rows: [c1] } = await q(`select ocupadas, vagas from horarios where id=$1`, [h.id]);
ok(Number(c1.ocupadas) === 4, `contador em ${c1.ocupadas}/${c1.vagas} (esperado 4/4)`);
const { rows: [n1] } = await q(`select count(*)::int n from reservas where horario_id=$1`, [h.id]);
ok(n1.n === 4, `${n1.n} reservas gravadas (esperado 4) — sem reserva orfã`);

// ── 2. Expiração agregada: 3 holds vencem no MESMO horário ───────────────
await q(`update reservas set expira_em = now() - interval '1 minute'
          where id in (select id from reservas where horario_id=$1 limit 3)`, [h.id]);
const { rows: [dev] } = await q(
  `with vencidas as (
     update reservas set status='expirada'
     where status='pendente' and expira_em <= now() returning horario_id
   ), por_horario as (select horario_id, count(*)::smallint n from vencidas group by horario_id),
     devolvidas as (
       update horarios h set ocupadas = greatest(h.ocupadas - p.n, 0)
       from por_horario p where h.id=p.horario_id returning p.n)
   select coalesce(sum(n),0)::int as total from devolvidas`);
ok(dev.total === 3, `3 holds vencidos no mesmo horário -> ${dev.total} vagas devolvidas (esperado 3)`);
const { rows: [c2] } = await q(`select ocupadas from horarios where id=$1`, [h.id]);
ok(Number(c2.ocupadas) === 1, `contador voltou para ${c2.ocupadas} (esperado 1)`);

// ── 3. Idempotência: varrer de novo não devolve nada ─────────────────────
const { rows: [dev2] } = await q(
  `with vencidas as (
     update reservas set status='expirada' where status='pendente' and expira_em <= now() returning horario_id
   ), por_horario as (select horario_id, count(*)::smallint n from vencidas group by horario_id),
     devolvidas as (update horarios h set ocupadas = greatest(h.ocupadas - p.n,0)
       from por_horario p where h.id=p.horario_id returning p.n)
   select coalesce(sum(n),0)::int as total from devolvidas`);
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

// Limpa o que este script criou. Sem isto sobra horário de mentira no banco
// de desenvolvimento, que depois aparece na agenda como aula fantasma.
// A ordem importa: `horarios` NÃO tem cascade para `reservas`, de propósito —
// apagar um horário com reserva paga em cima teria que ser barrado, e é. Então
// a reserva sai primeiro (levando o pagamento por cascade), e só aí o serviço.
await q(
  `delete from reservas where horario_id in (
     select h.id from horarios h join servicos s on s.id = h.servico_id where s.slug = $1)`,
  [SLUG_TESTE]
);
await q(`delete from servicos where slug = $1`, [SLUG_TESTE]);

await pool.end();
console.log(falhas === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
