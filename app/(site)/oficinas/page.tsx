import type { Metadata } from "next";
import { Check } from "lucide-react";
import { FotoDaSecao } from "@/components/foto-da-secao";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Rasgo } from "@/components/arte/rasgo";
import { FormularioOficina } from "@/components/oficinas/formulario-oficina";
import {
  ETAPAS,
  FORMATOS,
  INCLUSO,
  OFICINA,
  PERSONALIZACAO,
  faixaDeInvestimento,
} from "@/lib/oficina";

const description =
  "Oficina de cerâmica para empresas e eventos: 2 horas, de 6 a 30 participantes, R$ 320 por pessoa, com a peça esmaltada, queimada e entregue em até 45 dias.";

export const metadata: Metadata = {
  title: "Oficinas",
  description,
  alternates: { canonical: "/oficinas" },
  openGraph: {
    title: "Oficina de cerâmica para empresas e eventos",
    description,
    url: "/oficinas",
  },
};

/**
 * A OFICINA.
 *
 * ── O que esta página era ─────────────────────────────────────────────────
 * "Aniversário, time, bodas. Duas a três horas de mão no barro." Quatro itens
 * genéricos do que estava incluso. E, no lugar do preço: "o valor depende de
 * quantas pessoas, de onde e de quando — conte no formulário e a Isabela
 * responde com o número."
 *
 * ── O que ela tinha na gaveta ─────────────────────────────────────────────
 * Um deck de quatro páginas, pronto, que ela já manda para cliente: R$ 320
 * por participante na primeira página, de 6 a 30 pessoas, 2 horas adaptáveis
 * para 1h30, quatro etapas numeradas, seis itens inclusos — incluindo ecobag
 * exclusiva criada por ela — e entrega em até 45 dias.
 *
 * A página passa a ser esse deck, em HTML. Não é "colocar mais informação":
 * é parar de esconder a informação que ela mesma já publica. Quem procura
 * oficina para 20 pessoas está comparando três fornecedores numa tarde, e
 * quem obriga a preencher formulário para saber o preço sai da comparação.
 *
 * O formulário continua no fim, e continua sendo o caminho — só deixa de ser
 * pedágio.
 */
export default function Oficinas() {
  return (
    <>
      <section className="bg-papel pt-[6.5rem] pb-14 sm:pt-[8rem] sm:pb-16">
        <Container className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div data-enter className="flex flex-col items-start gap-6">
            <p className="rotulo">Experiências para empresas e eventos</p>
            <h1 className="cartaz font-display text-preto">
              Oficina de
              <br />
              <em className="italic text-vermelho">cerâmica</em>
            </h1>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
              {OFICINA.resumo}
            </p>
          </div>

          <figure className="lg:mb-2">
            <div className="sobreimpressao w-full">
              <div className="fuga relative aspect-[4/3] w-full overflow-hidden">
                {/* Do painel — ver o comentário em `components/sections/hero.tsx`. */}
                <FotoDaSecao
                  chave="oficinas.hero"
                  priority
                  quality={90}
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="object-cover"
                />
              </div>
            </div>
          </figure>
        </Container>
      </section>

      {/* A ficha técnica, do jeito que o deck dela abre: três números lado a
          lado, grandes, antes de qualquer argumento de venda. */}
      <section className="creme relative py-12 sm:py-14">
        <Rasgo cor="var(--color-papel)" />
        <Container className="grid gap-px border border-borda bg-borda sm:grid-cols-3">
          {[
            {
              rotulo: "Investimento",
              valor: `R$ ${OFICINA.precoPorPessoa}`,
              nota: "por participante · peça finalizada e esmaltada inclusa",
            },
            {
              rotulo: "Grupo",
              valor: `${OFICINA.minimo} — ${OFICINA.maximo}`,
              nota: "mínimo e máximo de participantes",
            },
            {
              rotulo: "Duração",
              valor: OFICINA.duracao,
              nota: OFICINA.duracaoAlternativa,
            },
          ].map((ficha, i) => (
            <Reveal key={ficha.rotulo} indice={i} tipo="cartao">
              <div className="flex h-full flex-col gap-1.5 bg-superficie p-6 sm:p-7">
                <p className="versalete-larga text-[0.58rem] text-texto/45">
                  {ficha.rotulo}
                </p>
                <p className="numeral text-[2.2rem] leading-none text-realce">
                  {ficha.valor}
                </p>
                <p className="mt-1 text-[0.85rem] leading-relaxed text-texto/60">
                  {ficha.nota}
                </p>
              </div>
            </Reveal>
          ))}
        </Container>

        <Container className="mt-5">
          <p className="text-[0.88rem] text-texto/55">
            Uma oficina fechada fica entre{" "}
            <span className="numeral text-realce">{faixaDeInvestimento()}</span>
            , conforme o número de participantes.
          </p>
        </Container>
      </section>

      {/* As quatro etapas, com a numeração e a seta que ela usa no deck. */}
      <section className="bg-branco py-16 sm:py-20">
        <Container className="mb-10 flex flex-col gap-3">
          <p className="rotulo">Formato da atividade</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete max-w-xl font-display text-vermelho">
              Como acontece
            </h2>
          </Reveal>
          <div className="mt-2 flex flex-wrap gap-2">
            {FORMATOS.map((formato) => (
              <span
                key={formato}
                className="versalete-larga border border-linha px-3 py-1.5 text-[0.6rem] text-preto/60"
              >
                {formato}
              </span>
            ))}
          </div>
        </Container>

        <Container>
          <ol className="flex flex-col">
            {ETAPAS.map((etapa, i) => (
              <Reveal key={etapa.titulo} indice={i} tipo="texto">
                <li className="grid grid-cols-[2.6rem_1fr] gap-x-4 border-t border-linha py-6 last:border-b sm:grid-cols-[4rem_1fr] sm:gap-x-8">
                  <span aria-hidden className="indice pt-1.5 text-vermelho">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-[1.35rem] leading-tight text-preto sm:text-[1.6rem]">
                      {etapa.titulo}
                    </h3>
                    <p className="max-w-xl text-[0.98rem] leading-relaxed text-cinza">
                      {etapa.texto}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="escuro relative py-16 sm:py-20">
        <Rasgo cor="var(--color-branco)" />
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <p className="rotulo">O que está incluso</p>
            <ul className="mt-6 flex flex-col">
              {INCLUSO.map((item, i) => (
                <Reveal key={item} indice={i} tipo="texto">
                  <li className="flex items-start gap-3 border-t border-papel/20 py-3.5 last:border-b">
                    <Check
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-osso"
                      strokeWidth={2.4}
                    />
                    <span className="text-[1rem] leading-snug text-papel/85">
                      {item}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 lg:pt-10">
            <p className="rotulo">Personalização</p>
            <Reveal tipo="titulo">
              <h2 className="font-display text-[1.7rem] leading-tight text-papel sm:text-[2.1rem]">
                A oficina veste o evento
              </h2>
            </Reveal>
            <p className="max-w-md text-[1rem] leading-relaxed text-papel/65">
              {PERSONALIZACAO}
            </p>
          </div>
        </Container>
      </section>

      <section id="orcamento" className="scroll-mt-24 bg-papel py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="mb-8 flex flex-col gap-3">
            <p className="rotulo">Orçamento</p>
            <h2 className="titulo-secao versalete font-display text-vermelho">
              Conte o que você quer
            </h2>
            <p className="max-w-xl text-[0.95rem] leading-relaxed text-cinza">
              O preço por pessoa está aqui em cima. O que muda de evento para
              evento é a data, o lugar e o formato das peças — é disso que a
              Isabela precisa saber para fechar.
            </p>
          </div>
          <FormularioOficina />
        </Container>
      </section>
    </>
  );
}
