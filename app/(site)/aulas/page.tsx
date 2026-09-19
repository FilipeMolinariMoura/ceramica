import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { AgendaAulaAvulsa } from "@/components/agenda/agenda-aula-avulsa";
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

// A agenda lê o banco a cada visita. Sem isto o Next tentaria prerenderizar
// esta página no `docker build`, onde não existe Postgres, e o build quebraria.
export const dynamic = "force-dynamic";

const description =
  "Aula avulsa de cerâmica com horário marcado e pagamento online, e turmas mensais com seis vagas, em Pinheiros. Com a artista visual Isabela Molinari.";

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
      {/* A agenda vem ANTES do argumento. Quem chega pelo Instagram decidido a
          marcar uma aula não deve ter que rolar a página de venda inteira para
          achar onde clicar. */}
      <AgendaAulaAvulsa />
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
