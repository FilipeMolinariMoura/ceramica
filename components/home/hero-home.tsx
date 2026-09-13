import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { fotos } from "@/lib/fotos";
import { SITE } from "@/lib/constants";

/**
 * Abertura do site: uma foto só, do tamanho da tela, e o nome por cima.
 *
 * A landing de aulas abre diferente (foto ao lado do texto, com data, vagas e
 * CTA) porque tem 20 segundos para vender uma turma. A home não vende nada na
 * primeira dobra — ela diz de quem é o ateliê. Por isso a foto vem inteira e
 * o texto é curto.
 */
export function HeroHome() {
  return (
    <section className="relative h-[92svh] min-h-[34rem] w-full overflow-hidden">
      <Image
        src={fotos.hero.src}
        alt={fotos.hero.alt}
        fill
        priority
        quality={90}
        placeholder="blur"
        sizes="100vw"
        className="hero-img object-cover object-center"
      />
      {/* Escurece só o suficiente para o texto ter contraste no topo e no pé. */}
      <div className="absolute inset-0 bg-gradient-to-b from-barro/45 via-barro/10 to-barro/60" />

      <Container className="relative flex h-full flex-col justify-end pb-14 sm:pb-20">
        <div data-enter className="flex max-w-2xl flex-col items-start gap-5">
          <Eyebrow tone="lona">Ateliê de cerâmica · {SITE.cidade}</Eyebrow>
          <h1 className="font-display text-[2.7rem] font-light leading-[1.03] tracking-[-0.02em] text-lona sm:text-6xl lg:text-[4.4rem]">
            O barro como{" "}
            <em className="font-normal italic text-parede-soft">
              linguagem de criação
            </em>
            .
          </h1>
          <p className="max-w-lg text-[1.05rem] leading-relaxed text-lona/85">
            Peças autorais, encomendas e turmas conduzidas por{" "}
            {SITE.artista}, artista visual e arteterapeuta.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link
              href="/obras"
              className="inline-flex h-[3.35rem] items-center justify-center rounded-full bg-lona-100 px-8 text-base font-medium tracking-tight text-barro transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.98]"
            >
              Ver as obras
            </Link>
            <Link
              href="/aulas"
              className="inline-flex h-[3.35rem] items-center justify-center rounded-full border border-lona/40 px-8 text-base font-medium tracking-tight text-lona transition-colors duration-200 hover:border-lona hover:bg-lona hover:text-barro"
            >
              Aulas de cerâmica
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
