import Image from "next/image";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";

const ITENS = [
  {
    tag: "Incluso",
    tom: "sim" as const,
    titulo: "Todas as ferramentas",
    texto: "Você não precisa comprar nada para começar.",
  },
  {
    tag: "Incluso",
    tom: "sim" as const,
    titulo: "Todas as queimas",
    texto: "Queima de baixa temperatura e queima de esmalte.",
  },
  {
    tag: "Por sua conta",
    tom: "quase" as const,
    titulo: "Argila e esmaltes",
    texto:
      "Ficam por conta do aluno — mas nas duas primeiras aulas eu forneço, para você começar sem se preocupar com isso.",
  },
];

export function Incluso() {
  return (
    <section className="bg-parede py-20 text-barro sm:py-28 lg:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div className="flex flex-col items-start gap-8">
          <div className="flex flex-col gap-5">
            <Eyebrow tone="barro">O que está incluso</Eyebrow>
            <Reveal>
              <h2 className="max-w-md font-display text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-barro sm:text-4xl lg:text-[2.9rem]">
                Você não precisa comprar{" "}
                <em className="italic text-cobalto">nada</em> para começar.
              </h2>
            </Reveal>
          </div>

          <ul className="w-full">
            {ITENS.map((item, i) => (
              <Reveal key={item.titulo} delay={i * 80}>
                <li className="flex flex-col gap-2 border-t border-barro/15 py-6 sm:flex-row sm:items-baseline sm:gap-6">
                  <span
                    className={
                      "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] " +
                      (item.tom === "sim"
                        ? "bg-cobalto text-lona-100"
                        : "border border-barro/30 text-barro/70")
                    }
                  >
                    {item.tag}
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-barro">
                      {item.titulo}
                    </h3>
                    <p className="mt-1 text-[1rem] leading-relaxed text-barro-ink/80">
                      {item.texto}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-lg lg:aspect-[3/4]">
          <Image
            src={fotos.incluso.src}
            alt={fotos.incluso.alt}
            fill
            placeholder="blur"
            quality={90}
            sizes="(max-width: 1024px) 100vw, 38vw"
            className="object-cover"
          />
        </Reveal>
      </Container>
    </section>
  );
}
