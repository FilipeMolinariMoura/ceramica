/**
 * As VAGAS de foto do site.
 *
 * Cada vaga é uma chave estável que a Isabela vê no painel com um nome em
 * português, e que o componente correspondente lê para saber qual foto
 * mostrar. Se ela não tiver escolhido nada, vale a foto padrão do repositório
 * — o site nunca fica com buraco.
 *
 * Por que uma LISTA declarada em código, e não uma tabela: o painel precisa
 * dizer a ela o que cada vaga significa ("a foto grande da home") e quantas
 * cabem. Isso é conhecimento do layout, e layout mora no código.
 */

import { fotos } from "@/lib/fotos";
import type { StaticImageData } from "next/image";

export type VagaDeFoto = {
  chave: string;
  nome: string;
  onde: string;
  /** Quantas fotos a vaga aceita. 1 = troca; >1 = galeria. */
  maximo: number;
  /** A foto do repositório usada enquanto ela não escolher outra. */
  padrao?: { src: StaticImageData; alt: string };
};

export const VAGAS: VagaDeFoto[] = [
  {
    chave: "ceramica.hero",
    nome: "Foto de abertura da Bela Cerâmica",
    onde: "A foto grande no topo da página de cerâmica",
    maximo: 1,
    padrao: fotos.sobre,
  },
  /* As três portas da home são os três SETORES, na ordem que a Isabela
     escreveu: Bela Cerâmica, a artista, e a astrologia. */
  {
    chave: "home.porta.ceramica",
    nome: "Porta · Bela Cerâmica",
    onde: "Primeira das três portas da página inicial",
    maximo: 1,
    padrao: fotos.hero,
  },
  {
    chave: "home.porta.artista",
    nome: "Porta · Conheça a Isabela",
    onde: "Segunda das três portas da página inicial",
    maximo: 1,
    padrao: fotos.isabelaPeca,
  },
  {
    chave: "home.porta.astrologia",
    nome: "Porta · Consulta astrológica",
    onde: "Terceira das três portas da página inicial",
    maximo: 1,
    padrao: fotos.isabelaPerfil,
  },
  {
    chave: "ceramica.porta.aulas",
    nome: "Cerâmica · Agende sua aula",
    onde: "Primeiro dos dois cliques dentro de Bela Cerâmica",
    maximo: 1,
    padrao: fotos.isabela,
  },
  {
    chave: "ceramica.porta.oficinas",
    nome: "Cerâmica · Orçamento de oficina",
    onde: "Segundo dos dois cliques dentro de Bela Cerâmica",
    maximo: 1,
    padrao: fotos.prova,
  },
  {
    chave: "atelie",
    nome: "Galeria do ateliê",
    onde: "A faixa de fotos na home e a grade em Obras",
    maximo: 12,
  },
  {
    chave: "aulas.hero",
    nome: "Foto de abertura das aulas",
    onde: "A foto ao lado do título, na página de aulas",
    maximo: 1,
    padrao: fotos.hero,
  },
  {
    chave: "oficinas.hero",
    nome: "Foto das oficinas",
    onde: "A foto larga da página de oficinas",
    maximo: 1,
    padrao: fotos.prova,
  },
];

export const VAGA_POR_CHAVE = new Map(VAGAS.map((v) => [v.chave, v]));
