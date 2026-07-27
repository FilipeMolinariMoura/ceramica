import Image from "next/image";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";

export function Prova() {
  return (
    <section className="bg-lona-100 py-16 sm:py-20">
      <Reveal className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[16/7]">
        <Image
          src={fotos.prova.src}
          alt={fotos.prova.alt}
          fill
          placeholder="blur"
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-barro/75 via-barro/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 pb-7 sm:pb-10">
          <Container>
            <p className="max-w-lg font-display text-2xl font-light italic leading-tight text-lona sm:text-3xl">
              Quatro anos, muitas mãos no barro.
            </p>
            <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-lona/70">
              Turmas e oficinas anteriores
            </p>
          </Container>
        </div>
      </Reveal>
    </section>
  );
}
