import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Rasgo } from "@/components/arte/rasgo";
import { OBRAS, ficha } from "@/lib/obras";
import { FORMACAO, RETRATO, TIPO_ROTULO, TRAJETORIA } from "@/lib/trajetoria";
import { ARTISTA, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE } from "@/lib/constants";

const description =
  "Isabela Molinari é artista visual e arteterapeuta. Individual apoiada pela Funarte em 2023, residência em Igatu em 2025, e ateliê próprio em Pinheiros desde 2022.";

export const metadata: Metadata = {
  title: "Sobre",
  description,
  alternates: { canonical: "/sobre" },
  openGraph: { title: "Sobre · Isabela Molinari", description, url: "/sobre" },
};

/**
 * A ARTISTA.
 *
 * A versão anterior desta página tinha três parágrafos de prática, três eixos
 * do trabalho e um convite — tudo verdadeiro, e nenhum fato verificável. Não
 * havia uma data, um lugar, um nome de instituição. Para quem está decidindo
 * pagar R$ 250 por duas horas, ou R$ 320 por cabeça numa oficina de empresa,
 * é justamente o verificável que decide.
 *
 * Agora a página tem: individual com apoio da Funarte em 2023, coletiva em
 * Salvador em 2024, residência em Igatu em 2025, duas formações na Belas
 * Artes e um projeto com mais de oito edições desde 2022. Tudo do portfólio.
 *
 * Os três eixos ficaram — mas deixaram de ser invenção do site. "Técnica,
 * experimentação e construção de repertório artístico" é a frase com que ela
 * mesma descreve o próprio ensino no deck que manda para cliente.
 */

const EIXOS = [
  {
    titulo: "Técnica",
    texto:
      "Os fundamentos do barro: preparo, construção, secagem, queima e esmalte. O que dá liberdade depois é saber o que o material aguenta.",
  },
  {
    titulo: "Experimentação",
    texto:
      "Forma, textura e superfície testadas na prática, peça a peça. É onde cada pessoa descobre o que quer fazer com o barro.",
  },
  {
    titulo: "Repertório",
    texto:
      "Referências de arte e de cerâmica que ampliam o vocabulário de quem cria — para o trabalho ter de onde vir.",
  },
] as const;

export default function Sobre() {
  const escultura = OBRAS.find((o) => o.id === "esc-2023-concha")!;

  return (
    <>
      <section className="bg-papel pt-[6.5rem] pb-16 sm:pt-[8rem] sm:pb-20">
        <Container className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div data-enter className="flex flex-col items-start gap-6">
            <p className="rotulo">A artista</p>
            <h1 className="cartaz font-display text-preto">
              Isabela
              <br />
              <em className="italic text-vermelho">Molinari</em>
            </h1>
            <p className="versalete-larga text-[0.64rem] text-preto/50">
              {ARTISTA.titulo}
            </p>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
              {ARTISTA.formacao}, com pós-graduação em Arteterapia em curso.
              Vive e trabalha em São Paulo, em ateliê próprio.
            </p>
          </div>

          <figure className="flex flex-col lg:mb-2">
            <div className="sobreimpressao w-full">
              <div className="fuga relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={RETRATO.foto}
                  alt={RETRATO.alt}
                  fill
                  priority
                  placeholder="blur"
                  quality={92}
                  sizes="(max-width: 1024px) 92vw, 44vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </figure>
        </Container>
      </section>

      {/* A prática, em primeira pessoa. Continua sendo o texto anterior: ele
          estava bom, e é a voz dela falando da aula — o que nenhum trecho do
          portfólio cobre, porque portfólio fala de obra, não de ensino. */}
      <section className="creme relative py-16 sm:py-20">
        <Rasgo cor="var(--color-papel)" />
        <Container className="grid items-start gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5 text-[1.06rem] leading-relaxed text-cinza">
            <p className="rotulo">A prática</p>
            <Reveal>
              <p>
                Trabalho com cerâmica como linguagem de criação, e não como
                técnica a ser reproduzida. Interessa o que acontece entre a
                primeira intenção e a peça que sai do forno — o que o barro
                aceita, o que ele recusa e o que aparece no caminho.
              </p>
            </Reveal>
            <Reveal>
              <p>
                As duas formações se encontram no ateliê: há{" "}
                {ARTISTA.anosEnsinando} anos oriento processos criativos em
                cerâmica, acompanhando cada pessoa no que ela está construindo,
                no ritmo dela. É a arteterapia entrando pela porta da técnica.
              </p>
            </Reveal>
            <Reveal>
              <p>
                O ateliê fica em {SITE.cidade}, e é dele que saem as peças
                autorais, as encomendas e as turmas de terça.
              </p>
            </Reveal>
            <Reveal>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit border-b border-vermelho/30 pb-1 text-vermelho transition-colors hover:border-vermelho"
              >
                Acompanhar no Instagram @{INSTAGRAM_HANDLE}
              </a>
            </Reveal>
          </div>

          <Reveal tipo="foto">
            <figure>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-osso/30">
                <Image
                  src={escultura.foto}
                  alt={escultura.alt}
                  fill
                  placeholder="blur"
                  quality={88}
                  sizes="(max-width: 1024px) 90vw, 38vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="ficha-parede mt-3 text-texto/55">
                <em className="text-texto">{escultura.titulo}</em>,{" "}
                {escultura.ano}
                <br />
                {ficha(escultura)}
              </figcaption>
            </figure>
          </Reveal>
        </Container>
      </section>

      {/* A trajetória, com imagem. Na home ela é um índice enxuto; aqui cada
          entrada mostra o que foi. */}
      <section id="exposicoes" className="scroll-mt-24 bg-papel py-16 sm:py-20">
        <Container className="mb-10 flex flex-col gap-3">
          <p className="rotulo">Exposições, residências e projetos</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete max-w-2xl font-display text-vermelho">
              Onde o trabalho esteve
            </h2>
          </Reveal>
        </Container>

        <Container className="flex flex-col">
          {TRAJETORIA.map((entrada, i) => (
            <Reveal key={entrada.id} indice={i} tipo="texto">
              <article className="grid gap-5 border-t border-linha py-8 last:border-b sm:grid-cols-[7rem_1fr] sm:gap-8 lg:grid-cols-[7rem_1fr_16rem]">
                <p className="numeral text-[1.1rem] text-vermelho">
                  {entrada.ano}
                </p>

                <div className="flex flex-col gap-1.5">
                  <p className="versalete-larga text-[0.58rem] text-preto/40">
                    {TIPO_ROTULO[entrada.tipo]}
                  </p>
                  <h3 className="font-display text-[1.5rem] leading-tight text-preto sm:text-[1.9rem]">
                    {entrada.titulo}
                  </h3>
                  <p className="text-[0.95rem] leading-relaxed text-cinza">
                    {entrada.local}
                    <br />
                    {entrada.cidade}
                  </p>
                  {entrada.nota ? (
                    <p className="mt-1 text-[0.85rem] text-vermelho">
                      {entrada.nota}
                    </p>
                  ) : null}
                </div>

                {entrada.foto ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-osso/25 lg:aspect-[4/3]">
                    <Image
                      src={entrada.foto}
                      alt={entrada.alt ?? entrada.titulo}
                      fill
                      placeholder="blur"
                      quality={84}
                      sizes="(max-width: 1024px) 90vw, 16rem"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </article>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="escuro relative py-16 sm:py-20">
        <Rasgo cor="var(--color-papel)" />
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="rotulo">Formação</p>
            <ul className="mt-6 flex flex-col">
              {FORMACAO.map((f) => (
                <li
                  key={f.curso}
                  className="border-t border-papel/20 py-4 last:border-b"
                >
                  <p className="font-display text-[1.15rem] leading-snug text-papel">
                    {f.curso}
                    {"estado" in f && f.estado ? (
                      <span className="text-papel/50"> · {f.estado}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-papel/55">
                    {f.instituicao}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="rotulo">O que guia o ensino</p>
            <ul className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-3">
              {EIXOS.map((eixo, i) => (
                <Reveal key={eixo.titulo} indice={i} tipo="cartao">
                  <li className="flex flex-col gap-2 border-t border-papel/20 pt-4">
                    <span aria-hidden className="indice text-osso">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-[1.35rem] text-papel">
                      {eixo.titulo}
                    </h3>
                    <p className="text-[0.92rem] leading-relaxed text-papel/60">
                      {eixo.texto}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-papel py-16 sm:py-20">
        <Container className="flex flex-col items-start gap-6">
          <Reveal tipo="titulo">
            <h2 className="titulo-secao max-w-2xl font-display text-preto">
              Dá para começar do zero —{" "}
              <em className="italic text-vermelho">a maioria começa</em>.
            </h2>
          </Reveal>
          <Reveal>
            <p className="max-w-xl text-[1.05rem] leading-relaxed text-cinza">
              As turmas recebem quem nunca encostou em barro. São seis pessoas
              por turma justamente para caber acompanhamento individual.
            </p>
          </Reveal>
          <Reveal>
            <Link
              href="/aulas#agenda"
              className="inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
            >
              Ver os horários
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
