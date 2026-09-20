import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { InscricaoCta } from "@/components/inscricao-cta";
import { fotos } from "@/lib/fotos";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { CURSO, SERVICO_AULA_AVULSA } from "@/lib/constants";

/**
 * Abertura de `/aulas`.
 *
 * Vende DUAS coisas, e a avulsa vem primeiro. A versão anterior abria com
 * "um espaço para criar, experimentar e desenvolver sua relação com o barro"
 * e um parágrafo de quatro linhas sobre a turma mensal — bonito, e pedindo
 * exatamente o que a Isabela disse que ninguém faz: ler.
 *
 * Agora a primeira dobra responde o que custa e o que dá para marcar hoje, e
 * o botão principal desce para a agenda em vez de abrir um formulário.
 */
export async function Hero() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  const CAMINHOS = [
    {
      titulo: "Aula avulsa",
      valor: preco ?? "sob consulta",
      detalhe: "Duas horas, com dia e hora marcados",
    },
    {
      titulo: "Turma mensal",
      valor: CURSO.mensalidadePix,
      detalhe: `${CURSO.diaSemana}, ${CURSO.vagasPorTurma} pessoas por turma`,
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="lg:grid lg:min-h-[90svh] lg:grid-cols-2 lg:items-stretch">
        <div className="relative order-1 h-[42svh] w-full overflow-hidden sm:h-[52svh] lg:order-2 lg:h-auto lg:min-h-[90svh]">
          <Image
            src={fotos.hero.src}
            alt={fotos.hero.alt}
            fill
            priority
            quality={90}
            placeholder="blur"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="hero-img object-cover object-center"
          />
        </div>

        <div className="order-2 flex items-center lg:order-1 lg:justify-end">
          <div
            data-enter
            /* pt maior que pb: a barra do site é fixa e mede 4.25rem, e sem
               esta folga o eyebrow corre por baixo dela quando a coluna é
               alta demais para centralizar. */
            className="flex w-full max-w-xl flex-col items-start gap-6 px-6 pb-12 pt-10 sm:px-8 lg:max-w-[34rem] lg:pb-16 lg:pr-14 lg:pt-[7rem]"
          >
            <Eyebrow>Aulas de cerâmica · Pinheiros</Eyebrow>

            <h1 className="titulo-hero versalete font-display text-vermelho">
              Mão no barro,
              <br />
              nesta semana
            </h1>

            <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
              Você escolhe o horário, paga aqui e vem. Barro, ferramentas,
              esmalte e queima inclusos. Não precisa ter experiência.
            </p>

            <dl className="grid w-full gap-px border border-linha bg-linha sm:grid-cols-2">
              {CAMINHOS.map((c) => (
                <div key={c.titulo} className="flex flex-col gap-1 bg-papel p-4">
                  <dt className="versalete-larga text-[0.6rem] text-preto/50">
                    {c.titulo}
                  </dt>
                  <dd className="font-display text-xl text-preto">{c.valor}</dd>
                  <dd className="text-[0.82rem] leading-snug text-grafite/75">
                    {c.detalhe}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="#agenda"
                className="inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px hover:bg-vermelho-escuro"
              >
                Ver os horários
              </Link>
              <InscricaoCta
                origem="hero"
                label="Quero a turma mensal"
                variant="contorno"
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
