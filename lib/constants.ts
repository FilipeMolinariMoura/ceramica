// Dados do curso e links de contato. Ajuste o @ do Instagram antes de publicar.

export const WHATSAPP_NUMBER = "5511957040729";

export function whatsappInscricao(nome: string): string {
  const primeiro = nome.trim() || "";
  const msg = primeiro
    ? `Oi, Isabela! Sou a/o ${primeiro} e quero garantir minha vaga na primeira turma de cerâmica.`
    : "Oi, Isabela! Quero garantir minha vaga na primeira turma de cerâmica.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export const WHATSAPP_DUVIDA = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Oi, Isabela! Tenho uma dúvida sobre a turma de cerâmica."
)}`;

export const INSTAGRAM_HANDLE = "zabelamolinari";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export const CURSO = {
  inicio: "4 de agosto",
  quando: "Terças, 9h30 às 11h30",
  vagas: 6,
  endereco: "Rua Irmão Lucas, 75 — Pinheiros, São Paulo",
  mensalidadePix: "R$ 800",
  mensalidadeCartao: "R$ 835,08",
} as const;

export const EXPERIENCIA_OPCOES = [
  { value: "nenhuma", label: "Nunca tive contato" },
  { value: "pouca", label: "Um pouco" },
  { value: "pratico", label: "Sim, já pratico" },
] as const;

export type ExperienciaValor = (typeof EXPERIENCIA_OPCOES)[number]["value"];
