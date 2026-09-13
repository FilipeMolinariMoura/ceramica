// Dados do curso e links de contato. Ajuste o @ do Instagram antes de publicar.

export const WHATSAPP_NUMBER = "5511957040729";

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
  const msg = `Oi, Isabela! ${abertura} garantir minha vaga na turma de cerâmica${periodo}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export const WHATSAPP_DUVIDA = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Oi, Isabela! Tenho uma dúvida sobre a turma de cerâmica."
)}`;

export const INSTAGRAM_HANDLE = "zabelamolinari";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export const CURSO = {
  inicio: "1º de setembro",
  diaSemana: "Terças",
  vagasPorTurma: 6,
  endereco: "Rua Irmão Lucas, 75, Pinheiros, São Paulo",
  mensalidadePix: "R$ 800",
  mensalidadeCartao: "R$ 835,08",
} as const;

// Duas turmas, ambas às terças; só muda o horário.
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

/* ──────────────────────────────────────────────────────────────────────────
   Site completo
   Até setembro de 2026 isto aqui era uma landing de uma turma só. O site
   passou a ter quatro portas de entrada (obras, sobre, aulas, encomendas) e
   o que era "o curso" virou UMA delas. As constantes acima seguem sendo a
   fonte da verdade da aba de aulas; as daqui para baixo são do site.
   ────────────────────────────────────────────────────────────────────────── */

export const SITE = {
  nome: "Bela Cerâmica",
  artista: "Isabela Molinari",
  dominio: "https://belaceramica.prismax.tech",
  bairro: "Pinheiros",
  cidade: "Pinheiros, São Paulo",
} as const;

/** Ordem da navegação: o trabalho primeiro, a venda por último. */
export const NAV = [
  { href: "/obras", label: "Obras" },
  { href: "/sobre", label: "Sobre" },
  { href: "/aulas", label: "Aulas" },
  { href: "/encomendas", label: "Encomendas" },
] as const;

/** Fatos verificados sobre a Isabela — não invente linha nova aqui. */
export const ARTISTA = {
  nome: "Isabela Molinari",
  /** Com separador, para as linhas de crédito sob o nome. */
  titulo: "Artista visual · Arteterapeuta",
  /** Em frase corrida, para parágrafos. */
  tituloFrase: "Artista visual e arteterapeuta",
  formacao: "Bacharela em Artes Visuais pela Belas Artes de São Paulo",
  anosEnsinando: 4,
} as const;

export function whatsappObra(peca: string): string {
  const msg = `Oi, Isabela! Vi a peça "${peca}" no site e queria saber mais.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export const WHATSAPP_ENCOMENDA = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Oi, Isabela! Queria conversar sobre uma encomenda."
)}`;
