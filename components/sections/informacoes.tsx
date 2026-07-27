import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { InscricaoCta } from "@/components/inscricao-cta";
import { CURSO } from "@/lib/constants";

const FICHA = [
  { rotulo: "Início", valor: CURSO.inicio },
  { rotulo: "Quando", valor: "Todas as terças, 9h30 às 11h30" },
  { rotulo: "Onde", valor: CURSO.endereco },
  { rotulo: "Turma", valor: "Até 6 alunos" },
];

export function Informacoes() {
  return (
    <section id="informacoes" className="bg-lona py-20 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Informações</Eyebrow>
          <h2 className="mt-5 max-w-lg font-display text-3xl font-normal leading-[1.12] tracking-[-0.01em] text-barro sm:text-4xl lg:text-[2.9rem]">
            Tudo o que você precisa saber.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <dl>
              {FICHA.map((f) => (
                <div
                  key={f.rotulo}
                  className="flex flex-col gap-1 border-t border-lona-300 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-barro/45">
                    {f.rotulo}
                  </dt>
                  <dd className="font-display text-xl text-barro sm:text-right">
                    {f.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={90} className="flex flex-col gap-6">
            <div className="border-t border-lona-300 pt-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-barro/45">
                Mensalidade
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-4xl text-barro sm:text-5xl">
                  {CURSO.mensalidadePix}
                </span>
                <span className="text-barro/60">no Pix</span>
              </p>
              <p className="mt-1 text-barro/60">
                {CURSO.mensalidadeCartao} no cartão
              </p>
            </div>

            <div className="rounded-2xl bg-cobalto p-6 text-lona-100">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-lona/70">
                Mês com cinco terças
              </p>
              <p className="mt-2 text-[1.05rem] leading-relaxed">
                Mensalidade fixa. Alguns meses têm cinco terças — nesses, você
                tem <em className="font-display italic">uma aula a mais</em> sem
                pagar a mais.
              </p>
            </div>

            <InscricaoCta origem="informacoes" label="Quero minha vaga" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
