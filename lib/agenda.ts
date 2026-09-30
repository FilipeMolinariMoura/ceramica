import { db } from "@/lib/db";
import { TURMAS, type TurmaId } from "@/lib/constants";

/**
 * Leitura da agenda: quais horários existem e quantas vagas sobraram.
 *
 * Toda data aqui é `timestamptz` e todo formato para humano passa por
 * `America/Sao_Paulo`. O contêiner roda em UTC; um `toLocaleString` sem fuso
 * explícito mostraria a aula das 10h como 13h em produção e ninguém
 * perceberia até uma aluna aparecer no horário errado.
 */

export const FUSO = "America/Sao_Paulo";

export type Horario = {
  id: number;
  inicio: Date;
  vagas: number;
  ocupadas: number;
  restantes: number;
};

export type Servico = {
  id: number;
  slug: string;
  nome: string;
  descricao: string | null;
  duracaoMin: number;
  precoCentavos: number;
  /** Preço no cartão, quando difere do Pix. Nulo = um preço só. */
  precoCartaoCentavos: number | null;
  vagasPadrao: number;
  /** Aulas que o serviço vende de uma vez: 1 na avulsa, 4 na mensal. */
  aulas: number;
};

/**
 * Devolve vagas vencidas aos seus horários.
 *
 * O `group by` não é detalhe: `update ... from` afeta cada linha-alvo UMA vez,
 * por mais linhas que casem na origem. Sem agregar, duas reservas vencidas no
 * mesmo horário devolveriam uma vaga só, e a outra ficaria presa para sempre.
 *
 * `skip locked`: uma reserva travada agora está sendo confirmada (ou liberada)
 * por outra transação. Esperar por ela abriria espaço para deadlock com a
 * confirmação do pacote, que trava pacote → reservas → horários; pular é
 * seguro, porque a próxima varredura a encontra no estado final.
 *
 * As filhas de um pacote vencem pelo mesmo statement que as avulsas — cada
 * uma devolve o seu lugar. O segundo statement só fecha o pacote em si.
 *
 * Roda na leitura da agenda porque é barato e mantém a tela honesta. NÃO é a
 * fonte da verdade sobre expiração: um pagamento que chegue depois é
 * retomado por `confirmarPagamento`.
 */
export async function expirarVencidas(): Promise<number> {
  try {
    const { rows } = await db().query<{ devolvidas: string }>(
      `with vencidas as (
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
       select coalesce(sum(n), 0)::text as devolvidas from devolvidas`
    );

    await db().query(
      `update pacotes set status = 'expirada'
        where id in (
          select id from pacotes
           where status = 'pendente' and expira_em <= now()
           for update skip locked
        )`
    );

    return Number(rows[0]?.devolvidas ?? 0);
  } catch (err) {
    // Deadlock com uma compra de pacote em andamento: o Postgres derrubou esta
    // varredura, não a compra. A próxima leitura da agenda varre de novo — e a
    // página não pode cair por causa de uma faxina.
    if (codigoPg(err) === "40P01") return 0;
    throw err;
  }
}

export function codigoPg(err: unknown): string | null {
  return typeof err === "object" && err !== null && "code" in err
    ? String((err as { code: unknown }).code)
    : null;
}

function paraServico(r: Record<string, unknown>): Servico {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    nome: String(r.nome),
    descricao: (r.descricao as string | null) ?? null,
    duracaoMin: Number(r.duracao_min),
    precoCentavos: Number(r.preco_centavos),
    precoCartaoCentavos:
      r.preco_cartao_centavos === null || r.preco_cartao_centavos === undefined
        ? null
        : Number(r.preco_cartao_centavos),
    vagasPadrao: Number(r.vagas_padrao),
    aulas: Number(r.aulas ?? 1),
  };
}

export async function servicoPorSlug(slug: string): Promise<Servico | null> {
  const { rows } = await db().query(
    `select id, slug, nome, descricao, duracao_min, preco_centavos,
            preco_cartao_centavos, vagas_padrao, aulas
       from servicos where slug = $1 and ativo`,
    [slug]
  );
  return rows[0] ? paraServico(rows[0]) : null;
}

/**
 * Horários publicados e ainda no futuro, com a lotação já corrigida.
 *
 * `margemMin` tira da vitrine o que começa daqui a pouco: vender uma vaga para
 * as 14h às 13h58 não ajuda ninguém.
 */
export async function horariosDisponiveis(
  servicoId: number,
  opcoes: { diasAFrente?: number; margemMin?: number } = {}
): Promise<Horario[]> {
  const { diasAFrente = 60, margemMin = 120 } = opcoes;

  await expirarVencidas();

  const { rows } = await db().query(
    `select id, inicio, vagas, ocupadas
       from horarios
      where servico_id = $1
        and publicado
        and inicio > now() + make_interval(mins => $2::int)
        and inicio < now() + make_interval(days => $3::int)
      order by inicio`,
    [servicoId, margemMin, diasAFrente]
  );

  return rows.map((r) => ({
    id: Number(r.id),
    inicio: r.inicio as Date,
    vagas: Number(r.vagas),
    ocupadas: Number(r.ocupadas),
    restantes: Math.max(Number(r.vagas) - Number(r.ocupadas), 0),
  }));
}

/* ── Turmas e pacotes ──────────────────────────────────────────────────── */

/** Terça-feira, no fuso de Brasília. */
export function ehTerca(d: Date): boolean {
  return (
    new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: FUSO }).format(d) === "Tue"
  );
}

/**
 * A turma a que um horário pertence: terça às 10h é a manhã, terça às 13h30 é
 * a tarde. Qualquer outro horário que a Isabela abra pelo painel é só aula
 * avulsa, e não entra em pacote.
 */
export function turmaDe(d: Date): TurmaId | null {
  if (!ehTerca(d)) return null;
  const h = hora(d);
  return TURMAS.find((t) => t.inicio === h)?.id ?? null;
}

/**
 * O máximo entre a primeira e a última aula de um pacote. Quatro terças
 * seguidas cabem em 21 dias; 28 tolera UMA terça fechada no meio (feriado),
 * sem deixar um pacote se esticar por dois meses.
 */
export const JANELA_PACOTE_DIAS = 28;

export type OpcaoPacote = {
  /** O horário da primeira aula — é o que identifica a opção. */
  inicioId: number;
  ids: number[];
  inicios: Date[];
  /** O menor número de lugares livres entre as aulas do pacote. */
  minRestantes: number;
  disponivel: boolean;
  /** Por que não dá para comprar: faltam terças abertas ou uma delas lotou. */
  motivo: "faltam_tercas" | "lotado" | null;
};

/**
 * Monta, para uma turma, todos os pacotes possíveis a partir de cada terça.
 *
 * Função PURA, usada dos dois lados: a página mostra as opções com ela, e o
 * servidor a roda de novo na hora de comprar, com os dados relidos do banco.
 * Se o resultado não bater com o que a pessoa viu, a compra é recusada — não há
 * como pagar por datas diferentes das que estavam na tela.
 */
export function montarPacotes(
  horarios: Horario[],
  turma: TurmaId,
  aulas: number
): OpcaoPacote[] {
  const daTurma = horarios
    .filter((h) => turmaDe(h.inicio) === turma)
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  return daTurma.map((primeira, i) => {
    const grupo = daTurma.slice(i, i + aulas);
    const completo =
      grupo.length === aulas &&
      grupo[grupo.length - 1]!.inicio.getTime() - primeira.inicio.getTime() <=
        JANELA_PACOTE_DIAS * 86_400_000;
    const minRestantes = grupo.length
      ? Math.min(...grupo.map((h) => h.restantes))
      : 0;

    return {
      inicioId: primeira.id,
      ids: grupo.map((h) => h.id),
      inicios: grupo.map((h) => h.inicio),
      minRestantes,
      disponivel: completo && minRestantes > 0,
      motivo: !completo ? "faltam_tercas" : minRestantes <= 0 ? "lotado" : null,
    };
  });
}

export type PrecosMensal = {
  pixCentavos: number;
  cartaoCentavos: number;
  aulas: number;
  porAulaPixCentavos: number;
  porAulaCartaoCentavos: number;
  avulsaCentavos: number;
  /** Quanto se economiza no Pix contra comprar as mesmas aulas avulsas. */
  economiaCentavos: number;
  /** Desconto por aula, em %, arredondado. */
  pctEconomia: number;
};

/**
 * A âncora de preço da mensal, calculada do banco: nada aqui é número fixo, e
 * uma mudança de preço no painel chega ao comparador sem deploy.
 */
export function precosDaMensal(avulsa: Servico, mensal: Servico): PrecosMensal {
  const aulas = Math.max(mensal.aulas, 1);
  const pix = mensal.precoCentavos;
  const cartao = mensal.precoCartaoCentavos ?? pix;
  const porAulaPix = Math.round(pix / aulas);
  const avulsaCentavos = avulsa.precoCentavos;
  return {
    pixCentavos: pix,
    cartaoCentavos: cartao,
    aulas,
    porAulaPixCentavos: porAulaPix,
    porAulaCartaoCentavos: Math.round(cartao / aulas),
    avulsaCentavos,
    economiaCentavos: Math.max(avulsaCentavos * aulas - pix, 0),
    pctEconomia:
      avulsaCentavos > 0
        ? Math.max(Math.round((1 - porAulaPix / avulsaCentavos) * 100), 0)
        : 0,
  };
}

/* ── Formatação, sempre em horário de Brasília ─────────────────────────── */

export function diaLongo(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: FUSO,
  }).format(d);
}

export function diaCurto(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: FUSO,
  }).format(d);
}

/** "ter" — o dia da semana em três letras, para chips e cartões. */
export function diaSemanaCurto(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: FUSO })
    .format(d)
    .replace(".", "");
}

export function hora(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(d);
}

/** "10h" / "13h30" — a hora como se fala, para rótulos curtos. */
export function horaCurta(d: Date): string {
  const [h, m] = hora(d).split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** Chave `2026-09-22` no fuso de Brasília — para agrupar horários por dia. */
export function chaveDia(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: FUSO,
  }).format(d);
}

/** "outubro" — para separar os meses na régua de dias. */
export function mes(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: FUSO }).format(d);
}

export function reais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: centavos % 100 === 0 ? 0 : 2,
  });
}
