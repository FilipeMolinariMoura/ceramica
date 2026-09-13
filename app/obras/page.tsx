import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { GaleriaAtelie } from "@/components/galeria-atelie";
import { ObraCard } from "@/components/obra-card";
import { OBRAS } from "@/lib/obras";
import { WHATSAPP_ENCOMENDA } from "@/lib/constants";

const description =
  "Peças autorais de cerâmica feitas no ateliê de Isabela Molinari, em Pinheiros. Cada peça é única, torneada ou modelada à mão.";

export const metadata: Metadata = {
  title: "Obras",
  description,
  alternates: { canonical: "/obras" },
  openGraph: { title: "Obras · Bela Cerâmica", description, url: "/obras" },
};

export default function Obras() {
  const disponiveis = OBRAS.filter((o) => o.estado !== "vendida");

  return (
    <>
      <PageHero
        eyebrow="Peças"
        titulo="Cada peça sai do ateliê"
        destaque="uma vez só"
        texto="Trabalho em pequenas séries e peças únicas. Quando uma sai, não volta igual — o barro, o esmalte e a queima nunca se repetem exatamente."
      />

      <section className="bg-lona pb-20 sm:pb-24">
        <Container>
          {OBRAS.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {OBRAS.map((obra, i) => (
                <ObraCard key={obra.id} obra={obra} delay={(i % 3) * 80} />
              ))}
            </div>
          ) : (
            /* Sem peça fotografada ainda. O estado vazio não se desculpa: diz
               o que está acontecendo e oferece a porta que funciona hoje. */
            <Reveal>
              <div className="flex flex-col items-start gap-5 rounded-lg border border-lona-300 bg-lona-100 px-7 py-12 sm:px-12 sm:py-16">
                <Eyebrow>Acervo</Eyebrow>
                <h2 className="max-w-xl font-display text-2xl font-normal leading-[1.15] text-barro sm:text-3xl">
                  As peças novas estão sendo fotografadas.
                </h2>
                <p className="max-w-xl text-[1.05rem] leading-relaxed text-barro-ink/80">
                  Enquanto isso, o que sai do forno vai primeiro para o
                  Instagram — e encomenda pode ser conversada a qualquer
                  momento, direto comigo.
                </p>
                <div className="mt-1 flex flex-wrap gap-3">
                  <a
                    href={WHATSAPP_ENCOMENDA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-cobalto px-7 text-[0.95rem] font-medium text-lona-100 shadow-[0_14px_30px_-16px_rgba(29,79,160,0.85)] transition-colors hover:bg-cobalto-700"
                  >
                    Conversar sobre uma peça
                  </a>
                  <Link
                    href="/encomendas"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-barro/25 px-7 text-[0.95rem] font-medium text-barro transition-colors hover:border-barro hover:bg-barro hover:text-lona"
                  >
                    Como funciona a encomenda
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {OBRAS.length > 0 && disponiveis.length === 0 ? (
            <p className="mt-10 max-w-xl text-[1.02rem] leading-relaxed text-barro/60">
              Tudo o que está aqui já foi para a casa de alguém. Peças novas
              saem do forno a cada poucas semanas — me chame no WhatsApp para
              saber o que vem aí.
            </p>
          ) : null}
        </Container>
      </section>

      <section className="bg-lona-100 py-20 sm:py-24">
        <Container className="mb-9 flex flex-col gap-4">
          <Eyebrow>O ateliê</Eyebrow>
          <Reveal>
            <h2 className="max-w-lg font-display text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-barro sm:text-4xl">
              Onde as peças nascem.
            </h2>
          </Reveal>
        </Container>
        <GaleriaAtelie variante="grade" />
      </section>
    </>
  );
}
