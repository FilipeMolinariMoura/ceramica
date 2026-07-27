import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";

const ITENS = [
  { texto: "Quer aprender cerâmica do zero", cor: "bg-cobalto" },
  { texto: "Busca uma atividade criativa e manual", cor: "bg-coral" },
  { texto: "Quer desacelerar e criar com as próprias mãos", cor: "bg-turquesa" },
  { texto: "Deseja aprofundar uma prática artística", cor: "bg-cobalto" },
  {
    texto: "Tem curiosidade em experimentar o barro como forma de expressão",
    cor: "bg-coral",
  },
];

export function ParaQuem() {
  return (
    <section className="bg-lona py-20 sm:py-28 lg:py-32">
      <Container className="grid gap-10 lg:grid-cols-[0.5fr_1fr] lg:gap-16">
        <Reveal>
          <Eyebrow>Para quem é</Eyebrow>
          <h2 className="mt-5 max-w-xs font-display text-3xl font-normal leading-[1.1] tracking-[-0.01em] text-barro sm:text-4xl">
            Esta turma é para você que…
          </h2>
        </Reveal>

        <ul className="flex flex-col">
          {ITENS.map((item, i) => (
            <Reveal key={item.texto} delay={i * 70}>
              <li className="flex items-baseline gap-5 border-t border-lona-300 py-5 first:border-t-0 sm:py-6">
                <span
                  aria-hidden
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.cor}`}
                />
                <span className="text-xl leading-snug text-barro-ink sm:text-2xl">
                  {item.texto}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
