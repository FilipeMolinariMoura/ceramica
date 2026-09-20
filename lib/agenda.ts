import { db } from "@/lib/db";

/**
 * Leitura da agenda: quais horários existem e quantas vagas sobraram.
 *
 * Toda data aqui é `timestamptz` e todo formato para humano passa por
 * `America/Sao_Paulo`. O contêiner roda em UTC; um `toLocaleString` sem fuso
 * explícito mostraria a aula das 9h30 como 12h30 em produção e ninguém
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
  vagasPadrao: number;
};

/**
 * Devolve vagas vencidas aos seus horários.
 *
 * O `group by` não é detalhe: `update ... from` afeta cada linha-alvo UMA vez,
 * por mais linhas que casem na origem. Sem agregar, duas reservas vencidas no
 * mesmo horário devolveriam uma vaga só, e a outra ficaria presa para sempre.
 *
 * Roda na leitura da agenda porque é barato e mantém a tela honesta. NÃO é a
 * fonte da verdade sobre expiração — quem garante que uma reserva paga não
 * seja expirada por engano é a reconciliação (ver `infra/reconciliar.sh`).
 */
export async function expirarVencidas(): Promise<number> {
  const { rows } = await db().query<{ devolvidas: string }>(
    `with vencidas as (
       update reservas set status = 'expirada'
       where status = 'pendente' and expira_em <= now()
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
  return Number(rows[0]?.devolvidas ?? 0);
}

export async function servicoPorSlug(slug: string): Promise<Servico | null> {
  const { rows } = await db().query(
    `select id, slug, nome, descricao, duracao_min, preco_centavos, vagas_padrao
       from servicos where slug = $1 and ativo`,
    [slug]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: Number(r.id),
    slug: r.slug,
    nome: r.nome,
    descricao: r.descricao,
    duracaoMin: Number(r.duracao_min),
    precoCentavos: Number(r.preco_centavos),
    vagasPadrao: Number(r.vagas_padrao),
  };
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

export function hora(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(d);
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

/** "setembro" — para separar os meses na régua de dias. */
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
