import Image from "next/image";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";

export function Quebra() {
  return (
    <section className="relative flex min-h-[440px] items-end overflow-hidden py-16 sm:min-h-[70svh]">
      <Image
        src={fotos.quebra.src}
        alt={fotos.quebra.alt}
        fill
        placeholder="blur"
        quality={90}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-barro/85 via-barro/30 to-barro/10" />
      <Container className="relative">
        <Reveal className="max-w-xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-lona/70">
            Terças, 9h30
          </p>
          <p className="mt-3 font-display text-3xl font-light italic leading-tight text-lona sm:text-4xl lg:text-[2.9rem]">
            Uma pausa no meio da semana — só você e o barro.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
