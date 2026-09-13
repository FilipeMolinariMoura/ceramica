import { HeroHome } from "@/components/home/hero-home";
import { Portas } from "@/components/home/portas";
import { ArtistaBreve } from "@/components/home/artista-breve";
import { ConviteFinal } from "@/components/home/convite-final";
import { GaleriaAtelie } from "@/components/galeria-atelie";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <>
      <HeroHome />
      <Portas />
      <ArtistaBreve />

      <section className="bg-lona py-20 sm:py-24">
        <Container className="mb-9 flex flex-col gap-4">
          <Eyebrow>O ateliê</Eyebrow>
          <Reveal>
            <h2 className="max-w-lg font-display text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-barro sm:text-4xl">
              O trabalho acontecendo.
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
