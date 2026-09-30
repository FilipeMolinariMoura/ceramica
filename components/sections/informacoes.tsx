import Link from "next/link";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { CURSO, TURMAS } from "@/lib/constants";
import { vitrineDasAulas } from "@/lib/vitrine";

const COR_TURMA = ["bg-vermelho", "bg-verde"];

/**
 * A ficha da turma. O preço e a próxima data vêm do banco, pela vitrine: aqui
 * morava "Início: 1º de setembro" e "R$ 800" como texto fixo, e a ficha
 * continuava anunciando setembro em outubro.
 */
export async function Informacoes() {
  const { mensal, avulsa, proximoPacote } = await vitrineDasAulas();

  const ficha = [
    {
      rotulo: "Próximo início",
      valor: proximoPacote
        ? `${proximoPacote.dia} ${proximoPacote.data}, ${proximoPacote.periodo.toLowerCase()}`
        : "Lista de espera aberta",
    },
    { rotulo: "Onde", valor: CURSO.endereco },
  ];

  return (
    <section id="informacoes" className="bg-papel py-20 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Informações</Eyebrow>
          <h2 className="titulo-secao mt-5 max-w-lg font-display font-normal tracking-[-0.01em] text-preto">
            Tudo o que você precisa saber.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-10">
            {/* Dois horários — sempre às terças. Manhã ou tarde, bem separados. */}
            <Reveal>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-preto/45">
                Duas turmas · sempre às terças
              </p>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {TURMAS.map((t, i) => (
                  <div
                    key={t.id}
                    className={
                      i === 1
                        ? "border-t border-linha pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
                        : ""
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 rounded-full ${COR_TURMA[i]}`}
                      />
                      <span className="text-sm font-semibold uppercase tracking-[0.12em] text-preto/70">
                        {t.periodo}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-2xl text-preto">
                      {t.horario}
                    </p>
                    <p className="mt-1 text-sm text-preto/55">
                      {CURSO.vagasPorTurma} lugares na mesa
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <dl>
                {ficha.map((f) => (
                  <div
                    key={f.rotulo}
                    className="flex flex-col gap-1 border-t border-linha py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-preto/45">
                      {f.rotulo}
                    </dt>
                    <dd className="font-display text-xl text-preto sm:text-right">
                      {f.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {mensal ? (
            <Reveal className="flex flex-col gap-6">
              <div className="border-t border-linha pt-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-preto/45">
                  Turma mensal · {mensal.aulas} terças
                </p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-4xl text-preto sm:text-5xl">
                    {mensal.porAula}
                  </span>
                  <span className="text-preto/60">por aula</span>
                  {avulsa ? (
                    <span className="font-display text-xl text-preto/35 line-through decoration-vermelho/70">
                      {avulsa.preco}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-preto/60">
                  {mensal.pix} no Pix · {mensal.cartao} no cartão
                </p>
              </div>

              <div className="bg-vermelho p-6 text-branco">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-papel/70">
                  Começa quando você quiser
                </p>
                <p className="mt-2 text-[1.05rem] leading-relaxed">
                  São {mensal.aulas} terças seguidas a partir da data que você
                  escolher, e você economiza{" "}
                  <em className="font-display italic">{mensal.economia}</em> em
                  relação às aulas avulsas.
                </p>
              </div>

              <Link
                href="/aulas?plano=mensal#agenda"
                className="inline-flex h-[3.35rem] items-center justify-center self-start bg-vermelho px-8 text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
              >
                Garantir minhas terças
              </Link>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
