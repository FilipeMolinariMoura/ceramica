import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { ARTISTA } from "@/lib/constants";

export function ArtistaBreve() {
  return (
    <section className="bg-lona-100 py-20 sm:py-28 lg:py-32">
      <Container className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <Reveal className="relative order-1 aspect-[5/4] w-full overflow-hidden rounded-lg">
          <Image
            src={fotos.isabela.src}
            alt={fotos.isabela.alt}
            fill
            placeholder="blur"
            quality={90}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>

        <div className="order-2 flex flex-col items-start gap-6">
          <Eyebrow>A artista</Eyebrow>
          <Reveal>
            <h2 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-barro sm:text-5xl">
              {ARTISTA.nome}
            </h2>
            <p className="mt-3 text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-cobalto">
              {ARTISTA.titulo}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p className="max-w-md text-[1.08rem] leading-relaxed text-barro-ink/85">
              {ARTISTA.formacao}. Há {ARTISTA.anosEnsinando} anos orienta
              processos criativos em cerâmica, unindo{" "}
              <em className="font-display italic text-barro">técnica</em>,{" "}
              <em className="font-display italic text-barro">experimentação</em>{" "}
              e a construção de repertório artístico.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <Link
              href="/sobre"
              className="group inline-flex items-center gap-2 border-b border-cobalto/30 pb-1 text-cobalto transition-colors hover:border-cobalto"
            >
              Conhecer o trabalho dela
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
