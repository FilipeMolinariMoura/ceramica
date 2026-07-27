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
  inicio: "4 de agosto",
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
