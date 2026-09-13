import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Sobre } from "@/components/sections/sobre";
import { DoisCaminhos } from "@/components/sections/dois-caminhos";
import { Incluso } from "@/components/sections/incluso";
import { ParaQuem } from "@/components/sections/para-quem";
import { QuemConduz } from "@/components/sections/quem-conduz";
import { Quebra } from "@/components/sections/quebra";
import { Informacoes } from "@/components/sections/informacoes";
import { Prova } from "@/components/sections/prova";
import { Faq } from "@/components/sections/faq";
import { CtaFinal } from "@/components/sections/cta-final";
import { RetornoInscricao } from "@/components/retorno-inscricao";

const description =
  "Duas turmas às terças, de manhã e de tarde, com seis vagas cada e acompanhamento individual, em Pinheiros. Turmas de cerâmica da artista visual Isabela Molinari.";

export const metadata: Metadata = {
  title: "Aulas de cerâmica",
  description,
  alternates: { canonical: "/aulas" },
  openGraph: {
    title: "Aulas de cerâmica · Isabela Molinari",
    description,
    url: "/aulas",
  },
};

/**
 * A landing original, inteira, virou esta aba. Ela é a página que converte —
 * e por isso continua sendo uma página longa de argumento, com o próprio hero
 * e o próprio CTA, e não uma seção da home.
 *
 * O rodapé, o botão flutuante do WhatsApp e a barra saíram daqui: são do
 * layout agora. `RetornoInscricao` fica, porque é desta página que a pessoa
 * sai para o WhatsApp e é para cá que ela volta.
 */
export default function Aulas() {
  return (
    <>
      <Hero />
      <Sobre />
      <DoisCaminhos />
      <Incluso />
      <ParaQuem />
      <QuemConduz />
      <Quebra />
      <Informacoes />
      <Prova />
      <Faq />
      <CtaFinal />
      <RetornoInscricao />
    </>
  );
}
