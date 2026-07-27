import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { InscricaoCta } from "@/components/inscricao-cta";
import { SeisLugares } from "@/components/seis-lugares";

export function CtaFinal() {
  return (
    <section id="inscricao" className="bg-cobalto py-24 text-lona sm:py-32">
      <Container className="flex flex-col items-center text-center">
        <Reveal className="flex flex-col items-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-lona/70">
            4 de agosto · Pinheiros
          </p>
          <h2 className="mt-5 font-display text-5xl font-light leading-[1.02] tracking-[-0.02em] text-lona sm:text-6xl lg:text-7xl">
            Inscrições abertas
          </h2>
          <p className="mt-5 max-w-md text-lg text-lona/85">
            Seis vagas. As aulas começam em 4 de agosto.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10 flex flex-col items-center gap-8">
          <SeisLugares tone="lona" caption="" className="items-center" />
          <InscricaoCta origem="cta-final" variant="claro" label="Quero minha vaga" />
        </Reveal>
      </Container>
    </section>
  );
}
