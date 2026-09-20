import type { StaticImageData } from "next/image";

import interditoMontagem from "@/assets/trajetoria/interdito-montagem.jpg";
import interditoSala from "@/assets/trajetoria/interdito-sala.jpg";
import paraisosOcultos from "@/assets/trajetoria/paraisos-ocultos.jpg";
import mostraDeProcessos from "@/assets/trajetoria/mostra-de-processos.jpg";
import mostraPublico from "@/assets/trajetoria/mostra-de-processos-publico.jpg";
import xiqueXiqueQueima from "@/assets/trajetoria/xique-xique-queima.jpg";
import xiqueXiquePeca from "@/assets/trajetoria/xique-xique-peca.jpg";
import retrato from "@/assets/trajetoria/retrato.jpg";

/**
 * A TRAJETÓRIA — exposições, residências, projetos e formação.
 *
 * Isto estava marcado como pendência havia semanas: o `components/home/
 * artista-breve.tsx` levava para uma seção de exposições que não existia,
 * porque a regra do projeto é não inventar linha de currículo. O portfólio
 * de 2026 resolveu a pendência. Cada linha abaixo está na página 23 dele.
 *
 * Se for preciso acrescentar algo, a fonte é o portfólio ou a própria
 * Isabela. Nunca uma inferência.
 */

export type TipoDeEntrada =
  | "individual"
  | "coletiva"
  | "residencia"
  | "projeto";

export type Entrada = {
  id: string;
  ano: string;
  titulo: string;
  local: string;
  cidade: string;
  tipo: TipoDeEntrada;
  /** Uma linha a mais, quando ela muda o que a entrada significa. */
  nota?: string;
  foto?: StaticImageData;
  alt?: string;
};

export const TIPO_ROTULO: Record<TipoDeEntrada, string> = {
  individual: "Exposição individual",
  coletiva: "Exposição coletiva",
  residencia: "Residência artística",
  projeto: "Projeto",
};

export const TRAJETORIA: Entrada[] = [
  {
    id: "xique-xique",
    ano: "2025",
    titulo: "Residência Artística Mirante Xique Xique",
    local: "Mirante Xique Xique",
    cidade: "Igatu, BA",
    tipo: "residencia",
    foto: xiqueXiqueQueima,
    alt: "Duas pessoas alimentam uma fogueira de queima a céu aberto, à noite: as peças estão empilhadas numa torre de tijolos sobre a chama.",
  },
  {
    id: "mostra-de-processos",
    ano: "2024",
    titulo: "Mostra de Processos",
    local: "Zona Fluxus",
    cidade: "Salvador, BA",
    tipo: "coletiva",
    foto: mostraDeProcessos,
    alt: "Mesa expositiva branca com peças cilíndricas de cerâmica vazada em terracota, cercadas de placas e tigelas de barro.",
  },
  {
    id: "do-interdito-ao-ceu",
    ano: "2023",
    titulo: "Do interdito ao céu",
    local: "Teatro de Arena Eugênio Kusnet",
    cidade: "São Paulo, SP",
    tipo: "individual",
    nota: "Projeto contemplado com apoio da Funarte",
    foto: interditoMontagem,
    alt: "Uma visitante de costas diante de dois desenhos de grande formato em sanguínea, montados lado a lado na parede branca da galeria.",
  },
  {
    id: "paraisos-ocultos",
    ano: "2023",
    titulo: "Paraísos ocultos",
    local: "Casa Pirâmide",
    cidade: "São Paulo, SP",
    tipo: "coletiva",
    foto: paraisosOcultos,
    alt: "Duas pessoas conversam diante de uma pintura figurativa em vermelho e azul, numa sala de paredes de madeira, com uma escultura de cerâmica sobre um pedestal ao lado.",
  },
  {
    id: "a-bela-ceramica",
    ano: "desde 2022",
    titulo: "A Bela Cerâmica",
    local: "Projeto próprio de oficinas de experimentação expressiva com o barro",
    cidade: "São Paulo, SP",
    tipo: "projeto",
    nota: "Mais de oito edições",
  },
];

/** Vistas que valem por si, fora da lista de currículo. */
export const VISTAS = [
  {
    id: "interdito-sala",
    foto: interditoSala,
    alt: "Vista geral da exposição: uma pessoa sentada num banco de madeira no centro da sala, cercada pelos desenhos em sanguínea e por pedestais com esculturas.",
    legenda: "Do interdito ao céu · Teatro de Arena Eugênio Kusnet, 2023",
  },
  {
    id: "xique-xique-peca",
    foto: xiqueXiquePeca,
    alt: "Peça de cerâmica com fendas horizontais, marcada pela fumaça da queima, apoiada num muro de pedra ao entardecer.",
    legenda: "Peça queimada a céu aberto · Igatu, Bahia, 2025",
  },
  {
    id: "mostra-publico",
    foto: mostraPublico,
    alt: "Público circula por uma sala iluminada de rosa e azul, entre tecidos pendurados com desenhos em terracota e uma mesa com peças de cerâmica.",
    legenda: "Mostra de Processos · Zona Fluxus, Salvador, 2024",
  },
] as const;

export const RETRATO = {
  foto: retrato,
  alt: "Retrato de Isabela Molinari apoiando o rosto na mão, de blusa vermelha, contra um fundo claro.",
} as const;

/**
 * FORMAÇÃO. "Em curso" é dela e fica: a pós-graduação em Arteterapia ainda
 * não terminou, e o portfólio diz isso com todas as letras.
 */
export const FORMACAO = [
  {
    curso: "Pós-graduação em Arteterapia",
    estado: "em curso",
    instituicao: "Centro Universitário Belas Artes de São Paulo",
  },
  {
    curso: "Bacharelado em Artes Visuais",
    instituicao: "Centro Universitário Belas Artes de São Paulo",
  },
] as const;

/**
 * A PESQUISA, em três parágrafos.
 *
 * Reescrito a partir da página 2 do portfólio — encurtado para a web, sem
 * trocar o que ela afirma. A referência ao Bataille fica: é ela quem a faz, e
 * é o que separa este site de um ateliê de bairro.
 */
export const PESQUISA = [
  "Minha prática investiga o corpo, o simbólico e o inconsciente por meio da cerâmica, do desenho e da escrita. O que me interessa é o fazer manual como caminho de autoconhecimento e escuta sensível — a matéria como um jeito de chegar onde a explicação não chega.",
  "Em Do interdito ao céu, exposição individual de 2023, parti de O Erotismo, de Georges Bataille, e da relação entre interdito e transgressão: o erotismo como metáfora de tudo que rompe limites, usando o corpo, o desejo e a morte como meios de expressão — não como explicação, mas como vivência.",
  "Hoje desenvolvo Flores de Luto, formas circulares em cerâmica sobre o ciclo de vida e morte. As peças guardam o contato direto com o barro molhado: o processo fica visível na peça pronta, e o fazer vira gesto meditativo e reparador.",
] as const;

/** A frase dela, do portfólio. Usada uma vez, e em destaque. */
export const CITACAO = {
  texto:
    "Num paralelo ao fazer artístico, o amor erótico arranca o indivíduo das obrigações mundanas e conduz uma propensão à entrega e ao sacrifício.",
  /* Em versalete, "sobre Do interdito" virava "SOBRE DO INTERDITO" e
     tropeçava na leitura. O ponto médio resolve sem perder a referência. */
  fonte: "Isabela Molinari · Do interdito ao céu, 2023",
} as const;
