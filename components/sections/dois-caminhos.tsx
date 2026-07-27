import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";

const CAMINHOS = [
  {
    nome: "Utilitário",
    cor: "bg-turquesa",
    desc: "Vasos, canecas, pratos.",
    frase: "Peças para usar todo dia.",
  },
  {
    nome: "Autoral",
    cor: "bg-coral",
    desc: "Trabalhos escultóricos e experimentais.",
    frase: "Peças para dizer algo.",
  },
];

export function DoisCaminhos() {
  return (
    <section className="bg-barro py-20 text-lona sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <Eyebrow tone="lona">Dois caminhos</Eyebrow>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden md:grid-cols-2">
          {CAMINHOS.map((c, i) => (
            <Reveal
              key={c.nome}
              delay={i * 90}
              className={
                i === 1
                  ? "border-t border-lona/15 pt-10 md:border-l md:border-t-0 md:pl-14 md:pt-0"
                  : "md:pr-14"
              }
            >
              <div className="flex items-center gap-3">
                <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${c.cor}`} />
                <h3 className="font-display text-4xl font-normal tracking-tight text-lona sm:text-5xl">
                  {c.nome}
                </h3>
              </div>
              <p className="mt-4 text-lg text-lona/70">{c.desc}</p>
              <p className="mt-1 font-display text-xl italic text-lona/90">
                {c.frase}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <p className="mt-14 max-w-2xl text-2xl font-light leading-snug text-lona sm:text-[1.75rem]">
            Você escolhe o caminho,{" "}
            <em className="font-display italic text-parede">
              e pode trocar no meio.
            </em>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
