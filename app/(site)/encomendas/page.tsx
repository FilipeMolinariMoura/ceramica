import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_ENCOMENDA,
} from "@/lib/constants";

const description =
  "Peças de cerâmica sob encomenda feitas à mão no ateliê de Isabela Molinari, em Pinheiros: jogos de mesa, peças para presente e trabalhos para casas e restaurantes.";

export const metadata: Metadata = {
  title: "Encomendas",
  description,
  alternates: { canonical: "/encomendas" },
  openGraph: {
    title: "Encomendas · Bela Cerâmica",
    description,
    url: "/encomendas",
  },
};

/* O processo como ele é. Nenhum prazo ou preço fixo aqui de propósito: os dois
   dependem da peça, da quantidade e da fila do forno, e número inventado no
   site vira discussão desagradável depois. */
const ETAPAS = [
  {
    n: "01",
    titulo: "Conversa",
    texto:
      "Você me conta o que imaginou — a peça, o uso, a quantidade, as cores que gosta. Se tiver referência, melhor ainda.",
  },
  {
    n: "02",
    titulo: "Proposta",
    texto:
      "Volto com forma, tamanho, acabamento, prazo e valor. Encomenda só entra na fila depois que isso está combinado.",
  },
  {
    n: "03",
    titulo: "Ateliê",
    texto:
      "Modelagem ou torno, secagem, primeira queima, esmalte e queima final. Cada etapa tem o tempo dela, e o barro não tem pressa.",
  },
  {
    n: "04",
    titulo: "Entrega",
    texto:
      "Retirada no ateliê, em Pinheiros, ou envio combinado. Peça feita à mão tem variação de forma e de cor — é o que a distingue de peça industrial.",
  },
] as const;

const TIPOS = [
  "Jogos de mesa: pratos, bowls, canecas",
  "Peças únicas para presente",
  "Vasos e peças decorativas",
  "Encomendas para casas, estúdios e restaurantes",
  "Lembranças de casamento e de evento",
] as const;

export default function Encomendas() {
  return (
    <>
      <PageHero
        eyebrow="Sob encomenda"
        titulo="Uma peça pensada"
        destaque="para o seu espaço"
        texto="Do jogo de mesa completo à peça única de presente. Feito à mão, uma por uma, no ateliê em Pinheiros."
      >
        <a
          href={WHATSAPP_ENCOMENDA}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex h-[3.35rem] items-center justify-center rounded-none bg-vermelho px-8 text-base font-medium tracking-tight text-branco transition-colors hover:bg-vermelho-escuro"
        >
          Começar pelo WhatsApp
        </a>
      </PageHero>

      <section className="bg-papel pb-20 sm:pb-24">
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <Reveal className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-none lg:order-1">
            <Image
              src={fotos.sobre.src}
              alt={fotos.sobre.alt}
              fill
              placeholder="blur"
              quality={90}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </Reveal>

          <div className="order-1 lg:order-2">
            <Eyebrow>Como funciona</Eyebrow>
            <ol className="mt-8">
              {ETAPAS.map((etapa, i) => (
                <Reveal key={etapa.n} delay={i * 70}>
                  <li className="flex gap-5 border-t border-linha py-6 last:border-b">
                    <span className="font-display text-lg text-vermelho/70">
                      {etapa.n}
                    </span>
                    <div>
                      <h2 className="font-display text-xl text-preto">
                        {etapa.titulo}
                      </h2>
                      <p className="mt-1.5 max-w-md text-[1rem] leading-relaxed text-grafite/80">
                        {etapa.texto}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="bg-branco py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>O que dá para encomendar</Eyebrow>
            <ul className="mt-7 flex flex-col">
              {TIPOS.map((tipo, i) => (
                <Reveal key={tipo} delay={i * 55}>
                  <li className="flex items-start gap-3 border-t border-linha py-4 text-[1.05rem] text-grafite/85 last:border-b">
                    <span
                      aria-hidden
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-verde"
                    />
                    {tipo}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={120}>
            <div className="flex h-full flex-col items-start justify-center gap-5 rounded-2xl bg-vermelho p-8 text-branco sm:p-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-papel/70">
                Antes de encomendar
              </p>
              <p className="text-[1.08rem] leading-relaxed">
                Peça feita à mão leva tempo de forno e de secagem. Se for
                presente com data — casamento, aniversário, fim de ano —, me
                procure com{" "}
                <em className="font-display italic">folga no calendário</em>.
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                <a
                  href={WHATSAPP_ENCOMENDA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-none bg-branco px-7 text-[0.95rem] font-medium text-vermelho transition-colors hover:bg-branco"
                >
                  Falar no WhatsApp
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-none border border-papel/40 px-7 text-[0.95rem] font-medium text-papel transition-colors hover:border-papel hover:bg-papel hover:text-vermelho"
                >
                  Ver @{INSTAGRAM_HANDLE}
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
