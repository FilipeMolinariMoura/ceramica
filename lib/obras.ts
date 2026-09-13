import type { StaticImageData } from "next/image";
import { fotos } from "@/lib/fotos";

/**
 * Catálogo de peças.
 *
 * DECISÃO DELIBERADA: este array nasce VAZIO e assim fica até existirem fotos
 * de peças prontas. Hoje o repositório só tem foto de aula e de processo —
 * mão no barro, mesa coletiva, ferramentas. Preencher a galeria com peça
 * inventada colocaria preço e disponibilidade falsos no ar, e quem clicasse
 * cairia no WhatsApp da Isabela perguntando por uma peça que não existe.
 * Enquanto está vazio, a página mostra o estado "peças novas em breve" e
 * empurra para as encomendas — que é verdade.
 *
 * PARA PUBLICAR UMA PEÇA:
 *   1. ponha a foto em `assets/obras/<id>.jpg` (quadrada ou 4:5, fundo limpo)
 *   2. importe aqui e acrescente o objeto ao array
 *
 *   import tigelaCobalto from "@/assets/obras/tigela-cobalto.jpg";
 *
 *   {
 *     id: "tigela-cobalto",
 *     nome: "Tigela cobalto",
 *     ano: 2026,
 *     tecnica: "Grés torneado, esmalte cobalto",
 *     dimensoes: "12 × 12 × 7 cm",
 *     preco: 280,
 *     estado: "disponivel",
 *     foto: tigelaCobalto,
 *     alt: "Tigela de grés com esmalte cobalto brilhante, vista de três quartos.",
 *   }
 */

export type EstadoPeca = "disponivel" | "vendida" | "sob-encomenda";

export type Obra = {
  id: string;
  nome: string;
  ano: number;
  tecnica: string;
  dimensoes: string;
  /** Em reais. Ausente = "sob consulta". */
  preco?: number;
  estado: EstadoPeca;
  foto: StaticImageData;
  alt: string;
};

export const OBRAS: Obra[] = [];

export const ESTADO_ROTULO: Record<EstadoPeca, string> = {
  disponivel: "Disponível",
  vendida: "Vendida",
  "sob-encomenda": "Sob encomenda",
};

export function precoFormatado(obra: Obra): string {
  if (obra.preco === undefined) return "Sob consulta";
  return obra.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

/**
 * O ateliê em imagens. São as fotos que EXISTEM — processo, mesa coletiva,
 * ferramentas, queima — e elas se apresentam pelo que são, não como catálogo.
 * É também o que as referências (bygweller, isobel-brigham) fazem: metade da
 * galeria é o trabalho acontecendo.
 */
export const ATELIE = [
  { ...fotos.hero, legenda: "Mesa coletiva", formato: "larga" },
  { ...fotos.sobre, legenda: "O barro antes da forma", formato: "alta" },
  { ...fotos.quebra, legenda: "Engobe, camada a camada", formato: "alta" },
  { ...fotos.incluso, legenda: "Ferramentas do ateliê", formato: "larga" },
  { ...fotos.isabela, legenda: "Aula de terça", formato: "larga" },
  { ...fotos.prova, legenda: "Fim de turma", formato: "larga" },
] as const;
