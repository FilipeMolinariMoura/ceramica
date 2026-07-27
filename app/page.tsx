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
import { Footer } from "@/components/sections/footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { RetornoInscricao } from "@/components/retorno-inscricao";

export default function Home() {
  return (
    <main>
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
      <Footer />
      <WhatsappFab />
      <RetornoInscricao />
    </main>
  );
}
