import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Rasgo } from "@/components/arte/rasgo";
import { ObraFigura } from "@/components/arte/obra-figura";
import { PrintsEmBreve } from "@/components/home/prints-em-breve";
import { OBRAS, SERIES, obrasDaSerie } from "@/lib/obras";
import { VISTAS } from "@/lib/trajetoria";
import { WHATSAPP_ENCOMENDA } from "@/lib/constants";

const description =
  "Cerâmica, pintura e desenho de Isabela Molinari: a série Flores de Luto, esculturas modeladas à mão e trabalhos de grande formato em pastel seco e sanguínea.";

export const metadata: Metadata = {
  title: "Obras",
  description,
  alternates: { canonical: "/obras" },
  openGraph: { title: "Obras · Isabela Molinari", description, url: "/obras" },
};

/**
 * O ACERVO.
 *
 * ── O que esta página era ─────────────────────────────────────────────────
 * Um estado vazio. O texto dizia "as peças novas estão sendo fotografadas" e
 * mandava para o WhatsApp. A decisão original estava certa — não havia foto
 * de peça, e inventar catálogo com preço falso teria mandado gente perguntar
 * por objeto inexistente.
 *
 * O que ninguém tinha visto é que o problema estava mal enquadrado. Faltavam
 * fotos de PRODUTO. Não faltava obra: há catorze trabalhos documentados no
 * portfólio dela, com técnica e dimensão, de 2020 a 2026, incluindo os
 * desenhos de 2 metros que ocuparam a individual apoiada pela Funarte.
 *
 * ── Por isso a página inverteu ────────────────────────────────────────────
 * Ela deixou de ser uma loja sem estoque e virou o que sempre devia ter sido:
 * um acervo, organizado por série, com ficha de parede e sem botão de
 * comprar. Peça para comprar continua existindo — em `/encomendas`, que é
 * conversa, e é a verdade sobre como ela vende.
 *
 * As séries vêm na ordem do portfólio: primeiro o que ela faz AGORA.
 */
export default function Obras() {
  const capa = OBRAS.find((o) => o.id === "do-interdito-ao-ceu")!;

  return (
    <>
      {/* Abertura em cartaz, como a home — mas com o desenho que dá nome à
          individual dela, e não com a peça em curso. */}
      <section className="bg-papel pt-[6.5rem] pb-16 sm:pt-[8rem] sm:pb-20">
        <Container className="grid items-end gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div data-enter className="flex flex-col items-start gap-6">
            <p className="rotulo">Acervo · 2020 — 2026</p>
            <h1 className="cartaz font-display text-preto">
              A obra
            </h1>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
              Cerâmica, pintura e desenho. As esculturas guardam o contato com
              o barro molhado; os desenhos são sanguínea sobre papel, em
              formatos de dois metros. Três frentes do mesmo assunto.
            </p>
          </div>

          <figure className="flex flex-col lg:mb-2">
            <div className="sobreimpressao w-full">
              <div className="fuga relative aspect-[5/4] w-full bg-papel">
                <Image
                  src={capa.foto}
                  alt={capa.alt}
                  fill
                  priority
                  placeholder="blur"
                  quality={92}
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  className="object-contain"
                />
              </div>
            </div>
            <figcaption className="ficha-parede mt-4 text-preto/55">
              <em className="text-preto">{capa.titulo}</em>, {capa.ano}
              <br />
              {capa.tecnica} · {capa.dimensoes}
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* Uma seção por série. Alternam creme e branco para que a grade não
          vire uma coluna contínua de catorze imagens. */}
      {SERIES.map((serie, i) => {
        const obras = obrasDaSerie(serie.id);
        const par = i % 2 === 0;

        return (
          <section
            key={serie.id}
            id={serie.id}
            className={`${par ? "creme" : "bg-branco"} scroll-mt-24 py-16 sm:py-20`}
          >
            <Container className="mb-10 flex flex-col gap-3">
              <div className="flex items-baseline gap-4">
                <span aria-hidden className="indice text-vermelho/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="rotulo">{serie.periodo}</p>
              </div>
              <Reveal tipo="titulo">
                <h2 className="titulo-secao versalete max-w-2xl font-display text-vermelho">
                  {serie.nome}
                </h2>
              </Reveal>
              <Reveal tipo="texto">
                <p className="max-w-xl text-[1rem] leading-relaxed text-cinza">
                  {serie.texto}
                </p>
              </Reveal>
            </Container>

            <Container className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {obras.map((obra, j) => (
                <ObraFigura key={obra.id} obra={obra} indice={j % 3} />
              ))}
            </Container>
          </section>
        );
      })}

      {/* As vistas de exposição: a obra fora do ateliê, montada e com público.
          É o que prova que o acervo acima não é uma pasta de fotos. */}
      <section className="escuro relative py-16 sm:py-20">
        <Rasgo cor="var(--color-branco)" />
        <Container className="mb-9 flex flex-col gap-3">
          <p className="rotulo">Montagens</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete max-w-lg font-display text-papel">
              A obra montada
            </h2>
          </Reveal>
        </Container>

        <Container className="grid gap-8 sm:grid-cols-3">
          {VISTAS.map((vista, i) => (
            <Reveal key={vista.id} indice={i} tipo="foto">
              <figure>
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={vista.foto}
                    alt={vista.alt}
                    fill
                    placeholder="blur"
                    quality={86}
                    sizes="(max-width: 640px) 90vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="ficha-parede mt-3 text-papel/55">
                  {vista.legenda}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* Os prints vieram da home enxugada. Aqui eles fazem mais sentido do
          que lá: quem está vendo o acervo é quem poderia querer uma impressão
          dele. */}
      <PrintsEmBreve />

      {/* A única porta comercial da página, e ela vem no fim de propósito:
          quem chegou até aqui viu o trabalho antes de ver um botão. */}
      <section className="bg-papel py-16 sm:py-20">
        <Container className="flex max-w-2xl flex-col items-start gap-5">
          <p className="rotulo">Levar uma peça</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao font-display text-preto">
              Peça sua, <em className="italic text-vermelho">feita a quatro mãos</em>
            </h2>
          </Reveal>
          <p className="max-w-xl text-[1.02rem] leading-relaxed text-cinza">
            As obras acima não estão à venda como catálogo — algumas estão em
            coleções, outras em exposição. O que dá para fazer é encomendar:
            conversar sobre forma, tamanho e esmalte, e a peça nascer daí.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_ENCOMENDA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
            >
              Conversar sobre uma peça
            </a>
            <Link
              href="/encomendas"
              className="inline-flex h-[3.1rem] items-center justify-center border border-preto/25 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-preto transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:border-preto active:translate-y-px"
            >
              Como funciona a encomenda
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
