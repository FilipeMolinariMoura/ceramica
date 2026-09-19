// Dados do ateliê e links de contato.

export const WHATSAPP_NUMBER = "5511957040729";

export const SITE = {
  nome: "Bela Cerâmica",
  artista: "Isabela Molinari",
  dominio: "https://belaceramica.prismax.tech",
  bairro: "Pinheiros",
  cidade: "Pinheiros, São Paulo",
  endereco: "Rua Irmão Lucas, 75, Pinheiros, São Paulo",
} as const;

/**
 * Navegação.
 *
 * As três primeiras são as portas do catálogo da home, na ordem em que a
 * Isabela as pediu. `Obras` e `Sobre` vêm depois porque não vendem nada
 * diretamente. `/encomendas` ficou FORA da barra de propósito: seis itens não
 * cabem no mobile sem virar lista de sistema, e ela é alcançada por dentro de
 * `/obras` e pelo rodapé, que é onde as pessoas a procuram.
 */
export const NAV = [
  { href: "/aulas", label: "Aulas" },
  { href: "/oficinas", label: "Oficinas" },
  { href: "/atendimentos", label: "Atendimentos" },
  { href: "/obras", label: "Obras" },
  { href: "/sobre", label: "Sobre" },
] as const;

/** Fatos verificados sobre a Isabela — não invente linha nova aqui. */
export const ARTISTA = {
  nome: "Isabela Molinari",
  titulo: "Artista visual · Arteterapeuta",
  tituloFrase: "Artista visual e arteterapeuta",
  formacao: "Bacharela em Artes Visuais pela Belas Artes de São Paulo",
  anosEnsinando: 4,
} as const;

/* ── Turma mensal ──────────────────────────────────────────────────────── */

export const CURSO = {
  inicio: "1º de setembro",
  diaSemana: "Terças",
  vagasPorTurma: 6,
  endereco: SITE.endereco,
  mensalidadePix: "R$ 800",
  mensalidadeCartao: "R$ 835,08",
} as const;

export const TURMAS = [
  { id: "manha", periodo: "Manhã", horario: "9h30 às 11h30" },
  { id: "tarde", periodo: "Tarde", horario: "13h30 às 15h30" },
] as const;

export const TURMA_OPCOES = [
  { value: "manha", label: "Manhã (9h30 às 11h30)" },
  { value: "tarde", label: "Tarde (13h30 às 15h30)" },
  { value: "tanto_faz", label: "Tanto faz" },
] as const;

export type TurmaValor = (typeof TURMA_OPCOES)[number]["value"];

export const EXPERIENCIA_OPCOES = [
  { value: "nenhuma", label: "Nunca tive contato" },
  { value: "pouca", label: "Um pouco" },
  { value: "pratico", label: "Sim, já pratico" },
] as const;

export type ExperienciaValor = (typeof EXPERIENCIA_OPCOES)[number]["value"];

/* ── Aula avulsa ───────────────────────────────────────────────────────── */

/**
 * O slug que a página de aulas procura no banco. O preço e as vagas NÃO moram
 * aqui: moram na tabela `servicos`, porque a Isabela precisa mudá-los pelo
 * painel sem esperar deploy. Só o identificador é código.
 */
export const SERVICO_AULA_AVULSA = "aula-avulsa";

/* ── WhatsApp ──────────────────────────────────────────────────────────── */

function zap(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export function whatsappInscricao(nome: string, turma?: TurmaValor): string {
  const abertura = nome.trim() ? `Sou a/o ${nome.trim()} e quero` : "Quero";
  const periodo =
    turma === "manha"
      ? ", no horário da manhã (9h30)"
      : turma === "tarde"
        ? ", no horário da tarde (13h30)"
        : turma === "tanto_faz"
          ? ", pode ser de manhã ou de tarde"
          : "";
  return zap(
    `Oi, Isabela! ${abertura} garantir minha vaga na turma de cerâmica${periodo}.`
  );
}

export const WHATSAPP_DUVIDA = zap(
  "Oi, Isabela! Tenho uma dúvida sobre as aulas de cerâmica."
);

export const WHATSAPP_ENCOMENDA = zap(
  "Oi, Isabela! Queria conversar sobre uma encomenda."
);

export const WHATSAPP_OFICINA = zap(
  "Oi, Isabela! Queria um orçamento de oficina de cerâmica."
);

export const WHATSAPP_ATENDIMENTO = zap(
  "Oi, Isabela! Queria marcar um atendimento de tarot ou astrologia."
);

export function whatsappObra(peca: string): string {
  return zap(`Oi, Isabela! Vi a peça "${peca}" no site e queria saber mais.`);
}

export const INSTAGRAM_HANDLE = "zabelamolinari";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
