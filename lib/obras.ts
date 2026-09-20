import type { StaticImageData } from "next/image";
import { fotos } from "@/lib/fotos";

import floresDeLuto from "@/assets/obras/flores-de-luto-2026.jpg";
import floresEspiral from "@/assets/obras/flores-processo-espiral.jpg";
import floresTela from "@/assets/obras/flores-processo-tela.jpg";
import floresDesenho from "@/assets/obras/flores-processo-desenho.jpg";
import escConcha from "@/assets/obras/esc-2023-concha.jpg";
import escEspiral from "@/assets/obras/esc-2023-espiral.jpg";
import escEspiralVerso from "@/assets/obras/esc-2023-espiral-verso.jpg";
import escCone from "@/assets/obras/esc-2023-cone.jpg";
import escTorso from "@/assets/obras/esc-2020-torso.jpg";
import escSerpente from "@/assets/obras/esc-2023-serpente.jpg";
import naturezaVivaLona from "@/assets/obras/natureza-viva-lona.jpg";
import entrelacos from "@/assets/obras/entrelacos-entre-mundos.jpg";
import doInterditoAoCeu from "@/assets/obras/do-interdito-ao-ceu.jpg";
import naturezaVivaTela from "@/assets/obras/natureza-viva-tela.jpg";

/**
 * O ACERVO.
 *
 * Tudo aqui vem do portfólio da artista (`Portfolio-Isabela-Molinari-2026`):
 * título, ano, técnica e dimensões são os dela, transcritos, e as obras sem
 * título aparecem como "Sem título" — que é como ela as apresenta. Nada foi
 * inventado e nada foi rebatizado para soar melhor.
 *
 * ── Por que isto deixou de ser uma vitrine ────────────────────────────────
 * A versão anterior modelava obra como PRODUTO: preço, estado, "disponível"
 * ou "vendida", e o array nascia vazio porque não havia peça fotografada. Mas
 * a Isabela não é uma loja de cerâmica com um catálogo por preencher — ela é
 * uma artista com exposição individual, residência e uma série em curso. O
 * que faltava no site não era foto de produto: era a obra.
 *
 * Peça para comprar continua existindo, e continua em `/encomendas`, que é
 * conversa. Aqui é trabalho, e trabalho não tem botão de comprar.
 */

/** As três frentes do trabalho, na ordem em que o portfólio as mostra. */
export type SerieId = "flores-de-luto" | "esculturas" | "pinturas";

export type Obra = {
  id: string;
  titulo: string;
  ano: string;
  tecnica: string;
  /** Ausente quando o portfólio não registra. Não inventar. */
  dimensoes?: string;
  serie: SerieId;
  foto: StaticImageData;
  alt: string;
  /** Marca a peça que abre a série. Uma por série. */
  capa?: boolean;
};

export const SERIES: {
  id: SerieId;
  nome: string;
  periodo: string;
  texto: string;
}[] = [
  {
    id: "flores-de-luto",
    nome: "Flores de Luto",
    periodo: "Série em desenvolvimento · 2026",
    texto:
      "Formas circulares em cerâmica que simbolizam o ciclo de vida e morte. A série expande os desdobramentos de Do interdito ao céu, aproximando a criação do campo ritual e da passagem, onde o fazer se torna um gesto meditativo e reparador.",
  },
  {
    id: "esculturas",
    nome: "Esculturas",
    periodo: "2020 — 2023",
    texto:
      "Peças em cerâmica modeladas à mão, entre queimas de alta e baixa temperatura, tinta acrílica e spray automotivo.",
  },
  {
    id: "pinturas",
    nome: "Pinturas e desenhos",
    periodo: "2021 — 2023",
    texto:
      "Trabalhos de grande formato em pastel seco, pigmento, tinta acrílica e barro, sobre tela e papel.",
  },
];

export const SERIE_POR_ID = new Map(SERIES.map((s) => [s.id, s]));

export const OBRAS: Obra[] = [
  /* ── Flores de Luto ─────────────────────────────────────────────────── */
  {
    id: "flores-de-luto-2026",
    titulo: "Sem título",
    ano: "2026",
    tecnica: "Cerâmica",
    dimensoes: "30 × 27 cm",
    serie: "flores-de-luto",
    capa: true,
    foto: floresDeLuto,
    alt: "Peça circular de cerâmica em pétalas sobrepostas que giram para o centro, em barro claro manchado de cinza-azulado, presa à parede branca.",
  },
  {
    id: "flores-processo-espiral",
    titulo: "Processo",
    ano: "2026",
    tecnica: "Barro cru, ateliê da artista",
    serie: "flores-de-luto",
    foto: floresEspiral,
    alt: "A mesma forma circular ainda em barro cru escuro, úmida, sobre a bancada coberta de lona no ateliê.",
  },
  {
    id: "flores-processo-tela",
    titulo: "Processo",
    ano: "2026",
    tecnica: "Estudo em pintura",
    serie: "flores-de-luto",
    foto: floresTela,
    alt: "Tela grande apoiada na parede do ateliê com um círculo preto denso pintado no centro, ladeada por dois estudos menores.",
  },
  {
    id: "flores-processo-desenho",
    titulo: "Processo",
    ano: "2026",
    tecnica: "Estudo em pigmento sobre tela",
    serie: "flores-de-luto",
    foto: floresDesenho,
    alt: "Estudo em grafite e cinza sobre tela clara, com uma forma orgânica esfumaçada que lembra uma pétala se abrindo.",
  },

  /* ── Esculturas ─────────────────────────────────────────────────────── */
  {
    id: "esc-2023-concha",
    titulo: "Sem título",
    ano: "2023",
    tecnica: "Cerâmica, queima de alta temperatura",
    serie: "esculturas",
    capa: true,
    foto: escConcha,
    alt: "Escultura em cerâmica clara: um cilindro modelado à mão abrigado entre duas abas curvas, como uma concha que se fecha, sobre tecido cinza.",
  },
  {
    id: "esc-2023-espiral",
    titulo: "Sem título",
    ano: "2023",
    tecnica: "Cerâmica, queima de baixa temperatura e tinta acrílica",
    dimensoes: "17 × 18 × 23,5 cm",
    serie: "esculturas",
    foto: escEspiral,
    alt: "Vaso de cerâmica construído em roletes visíveis, cor de areia esverdeada, com a boca voltada para dentro em espiral, sobre um cubo de madeira.",
  },
  {
    id: "esc-2023-espiral-verso",
    titulo: "Sem título · outra vista",
    ano: "2023",
    tecnica: "Cerâmica, queima de baixa temperatura e tinta acrílica",
    dimensoes: "17 × 18 × 23,5 cm",
    serie: "esculturas",
    foto: escEspiralVerso,
    alt: "A mesma peça vista de lado: a espiral de roletes desaba para fora do cubo de madeira e escorre pela lateral como um tecido pesado.",
  },
  {
    id: "esc-2023-cone",
    titulo: "Sem título",
    ano: "2023",
    tecnica: "Cerâmica, queima de baixa temperatura e tinta acrílica",
    dimensoes: "18 × 25 cm",
    serie: "esculturas",
    foto: escCone,
    alt: "Forma cônica de cerâmica pintada em dois vermelhos, separados por uma faixa branca horizontal na altura do meio.",
  },
  {
    id: "esc-2023-serpente",
    titulo: "Sem título",
    ano: "2023",
    tecnica: "Cerâmica, queima de baixa temperatura e tinta acrílica",
    dimensoes: "17 × 18 × 23,5 cm",
    serie: "esculturas",
    foto: escSerpente,
    alt: "Cilindro vermelho de roletes empilhados assentado sobre duas formas sinuosas que se estendem para os lados, como braços ou serpentes.",
  },
  {
    id: "esc-2020-torso",
    titulo: "Sem título",
    ano: "2020",
    tecnica: "Cerâmica, queima de baixa temperatura e spray automotivo",
    dimensoes: "9 × 16,5 × 27 cm",
    serie: "esculturas",
    foto: escTorso,
    alt: "Torso feminino em cerâmica branca acetinada, modelado à mão, sem cabeça nem braços, visto de três quartos.",
  },

  /* ── Pinturas e desenhos ────────────────────────────────────────────── */
  {
    id: "do-interdito-ao-ceu",
    titulo: "Do interdito ao céu",
    ano: "2021",
    tecnica: "Pastel seco sobre papel",
    dimensoes: "2,09 × 1,75 m",
    serie: "pinturas",
    capa: true,
    foto: doInterditoAoCeu,
    alt: "Desenho de grande formato em sanguínea sobre papel, dividido em nove folhas: um corpo se abre em camadas concêntricas de traços paralelos em torno de um centro.",
  },
  {
    id: "entrelacos-entre-mundos",
    titulo: "Entrelaços entre mundos",
    ano: "2023",
    tecnica: "Pastel seco sobre papel",
    dimensoes: "2,08 × 1,99 m",
    serie: "pinturas",
    foto: entrelacos,
    alt: "Desenho em sanguínea de laranja intenso: formas corporais curvas que se cruzam no centro da folha, dividida em quatro partes.",
  },
  {
    id: "natureza-viva-lona",
    titulo: "Natureza viva",
    ano: "2023",
    tecnica: "Tinta acrílica e barro sobre tela",
    dimensoes: "1,64 × 2,5 m",
    serie: "pinturas",
    foto: naturezaVivaLona,
    alt: "Pintura em tons de terra sobre tela solta pregada à parede: duas figuras encolhidas em posição fetal, envoltas em feixes de linhas que as abraçam.",
  },
  {
    id: "natureza-viva-tela",
    titulo: "Natureza viva",
    ano: "2023",
    tecnica: "Tinta acrílica e pigmento sobre tela",
    dimensoes: "80 cm × 1,20 m",
    serie: "pinturas",
    foto: naturezaVivaTela,
    alt: "Pintura de uma figura de costas em vermelho e azul profundo, contra um céu alaranjado que se curva sobre a água.",
  },
];

export function obrasDaSerie(serie: SerieId): Obra[] {
  return OBRAS.filter((o) => o.serie === serie);
}

/** A ficha da obra, como se escreve numa parede de galeria. */
export function ficha(obra: Obra): string {
  return [obra.tecnica, obra.dimensoes].filter(Boolean).join(" · ");
}

/**
 * O ateliê em imagens — as fotos de aula e de processo, que continuam sendo
 * o que são. Elas não entram no acervo: acervo é obra.
 */
export const ATELIE = [
  { ...fotos.hero, legenda: "Mesa coletiva", formato: "larga" },
  { ...fotos.sobre, legenda: "O barro antes da forma", formato: "alta" },
  { ...fotos.quebra, legenda: "Engobe, camada a camada", formato: "alta" },
  { ...fotos.incluso, legenda: "Ferramentas do ateliê", formato: "larga" },
  { ...fotos.isabela, legenda: "Aula de terça", formato: "larga" },
  { ...fotos.prova, legenda: "Fim de turma", formato: "larga" },
] as const;
