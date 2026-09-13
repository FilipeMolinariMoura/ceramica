import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { ARTISTA, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE } from "@/lib/constants";

const description =
  "Isabela Molinari é artista visual e arteterapeuta, bacharela em Artes Visuais pela Belas Artes de São Paulo. Há quatro anos orienta processos criativos em cerâmica, em Pinheiros.";

export const metadata: Metadata = {
  title: "Sobre",
  description,
  alternates: { canonical: "/sobre" },
  openGraph: { title: "Sobre · Isabela Molinari", description, url: "/sobre" },
};

/* Três eixos do trabalho — os mesmos que a aba de aulas já nomeia. Não são
   slogan: descrevem o que acontece no ateliê. */
const EIXOS = [
  {
    titulo: "Técnica",
    texto:
      "Os fundamentos do barro: preparo, construção, secagem, queima e esmalte. O que dá liberdade depois é saber o que o material aguenta.",
  },
  {
    titulo: "Experimentação",
    texto:
      "Forma, textura e superfície testadas na prática, peça a peça. É onde cada pessoa descobre o que quer fazer com o barro.",
  },
  {
    titulo: "Repertório",
    texto:
      "Referências de arte e de cerâmica que ampliam o vocabulário de quem cria — para o trabalho ter de onde vir.",
  },
] as const;

export default function Sobre() {
  return (
    <>
      <PageHero
        eyebrow="A artista"
        titulo="Isabela Molinari"
        texto={`${ARTISTA.tituloFrase}. ${ARTISTA.formacao}.`}
      />

      <section className="bg-lona pb-20 sm:pb-24">
        <Container className="grid items-start gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <Reveal className="relative aspect-[5/4] w-full overflow-hidden rounded-lg">
            <Image
              src={fotos.isabela.src}
              alt={fotos.isabela.alt}
              fill
              priority
              placeholder="blur"
              quality={90}
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </Reveal>

          <div className="flex flex-col gap-5 text-[1.08rem] leading-relaxed text-barro-ink/85">
            <Reveal>
              <p>
                Trabalho com cerâmica como linguagem de criação, e não como
                técnica a ser reproduzida. Interessa o que acontece entre a
                primeira intenção e a peça que sai do forno — o que o barro
                aceita, o que ele recusa e o que aparece no caminho.
              </p>
            </Reveal>
            <Reveal delay={70}>
              <p>
                Sou bacharela em Artes Visuais pela Belas Artes de São Paulo e
                arteterapeuta. Essas duas formações se encontram no ateliê: há{" "}
                {ARTISTA.anosEnsinando} anos oriento processos criativos em
                cerâmica, acompanhando cada pessoa no que ela está construindo,
                no ritmo dela.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p>
                O ateliê fica em {SITE.cidade}, e é dele que saem as peças
                autorais, as encomendas e as turmas de terça.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-b border-cobalto/30 pb-1 text-cobalto transition-colors hover:border-cobalto"
              >
                Acompanhar no Instagram @{INSTAGRAM_HANDLE}
              </a>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-parede py-20 text-barro sm:py-24">
        <Container>
          <Eyebrow tone="barro">O que guia o trabalho</Eyebrow>
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {EIXOS.map((eixo, i) => (
              <Reveal key={eixo.titulo} delay={i * 90}>
                <li className="border-t border-barro/20 pt-5">
                  <h2 className="font-display text-2xl text-barro">
                    {eixo.titulo}
                  </h2>
                  <p className="mt-2 text-[1rem] leading-relaxed text-barro-ink/80">
                    {eixo.texto}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-lona py-20 sm:py-24">
        <Container className="flex flex-col items-start gap-6">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-barro sm:text-4xl">
              Dá para começar do zero —{" "}
              <em className="italic text-cobalto">a maioria começa</em>.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-xl text-[1.05rem] leading-relaxed text-barro-ink/80">
              As turmas recebem quem nunca encostou em barro. São seis pessoas
              por turma justamente para caber acompanhamento individual.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <Link
              href="/aulas"
              className="inline-flex h-[3.35rem] items-center justify-center rounded-full bg-cobalto px-8 text-base font-medium tracking-tight text-lona-100 shadow-[0_14px_30px_-16px_rgba(29,79,160,0.85)] transition-colors hover:bg-cobalto-700"
            >
              Ver as turmas
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
