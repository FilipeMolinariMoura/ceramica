import { HeroHome } from "@/components/home/hero-home";
import { Portas } from "@/components/home/portas";
import { ArtistaBreve } from "@/components/home/artista-breve";
import { PrintsEmBreve } from "@/components/home/prints-em-breve";
import { ConviteFinal } from "@/components/home/convite-final";
import { GaleriaAtelie } from "@/components/galeria-atelie";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";

// O hero e as portas leem o preço da aula avulsa no banco. Sem isto o Next
// tentaria prerenderizar a home no `docker build`, onde não há Postgres.
export const dynamic = "force-dynamic";

/**
 * A home é um CATÁLOGO, não uma página de venda.
 *
 * Ela abre em três portas — aulas, oficinas e atendimento 1:1 — e só depois
 * apresenta a artista. Foi o pedido da Isabela, e resolve o problema da
 * versão anterior, que abria numa foto de tela cheia sem dizer o que estava à
 * venda nem por quanto.
 */
export default function Home() {
  return (
    <>
      <HeroHome />
      <Portas />
      <ArtistaBreve />
      <PrintsEmBreve />

      <section className="bg-papel py-16 sm:py-20">
        <Container className="mb-8 flex flex-col gap-4">
          <Eyebrow>O ateliê</Eyebrow>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete max-w-lg font-display text-vermelho">
              O trabalho acontecendo
            </h2>
          </Reveal>
        </Container>
        <Container>
          <GaleriaAtelie variante="faixa" />
        </Container>
      </section>

      <ConviteFinal />
    </>
  );
}
