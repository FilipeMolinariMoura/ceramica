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
    chave: "home.hero",
    nome: "Foto de abertura da home",
    onde: "A foto larga logo abaixo do nome, na primeira tela",
    maximo: 1,
    padrao: fotos.hero,
  },
  {
    chave: "home.porta.aulas",
    nome: "Porta · Turma de aulas",
    onde: "Primeira das três portas do catálogo",
    maximo: 1,
    padrao: fotos.isabela,
  },
  {
    chave: "home.porta.oficinas",
    nome: "Porta · Sua oficina",
    onde: "Segunda das três portas",
    maximo: 1,
    padrao: fotos.prova,
  },
  {
    chave: "home.porta.atendimentos",
    nome: "Porta · Atendimento 1:1",
    onde: "Terceira das três portas",
    maximo: 1,
    padrao: fotos.quebra,
  },
  {
    chave: "home.artista",
    nome: "Retrato da Isabela",
    onde: 'Seção "Conheça Isabela Molinari", na home',
    maximo: 1,
    padrao: fotos.isabela,
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
  {
    chave: "atendimentos.hero",
    nome: "Foto dos atendimentos",
    onde: "A foto larga da página de atendimentos",
    maximo: 1,
    padrao: fotos.quebra,
  },
];

export const VAGA_POR_CHAVE = new Map(VAGAS.map((v) => [v.chave, v]));
