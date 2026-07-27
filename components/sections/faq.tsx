import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";

const PERGUNTAS = [
  {
    q: "Preciso ter experiência?",
    a: "Não. A turma recebe iniciantes e o acompanhamento é individual.",
  },
  {
    q: "Preciso comprar ferramentas?",
    a: "Não. Todas as ferramentas estão inclusas.",
  },
  {
    q: "E a queima das peças?",
    a: "Inclusa — tanto a queima de baixa temperatura quanto a de esmalte.",
  },
  {
    q: "Preciso comprar argila?",
    a: "A argila e os esmaltes são por conta do aluno. Nas duas primeiras aulas eu forneço.",
  },
  {
    q: "Quantas aulas por mês?",
    a: "Uma por semana, sempre às terças. Alguns meses têm quatro terças, outros cinco. A mensalidade é a mesma.",
  },
];

export function Faq() {
  return (
    <section className="bg-lona py-20 sm:py-28 lg:py-32">
      <Container className="grid gap-10 lg:grid-cols-[0.5fr_1fr] lg:gap-16">
        <Reveal>
          <Eyebrow>Perguntas frequentes</Eyebrow>
          <h2 className="mt-5 max-w-xs font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-barro sm:text-4xl">
            Ainda em dúvida?
          </h2>
        </Reveal>

        <div>
          {PERGUNTAS.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="group border-t border-lona-300 last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-medium text-barro sm:text-xl">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="faq-plus select-none text-2xl font-light leading-none text-cobalto transition-transform duration-200"
                  >
                    +
                  </span>
                </summary>
                <p className="-mt-1 max-w-2xl pb-6 text-[1.02rem] leading-relaxed text-barro-ink/80">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
