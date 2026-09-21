import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FotoDaSecao } from "@/components/foto-da-secao";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { GaleriaAtelie } from "@/components/galeria-atelie";
import { ProximosHorarios } from "@/components/home/proximos-horarios";
import { ConviteFinal } from "@/components/home/convite-final";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { OFICINA } from "@/lib/oficina";
import { LINHA, SERVICO_AULA_AVULSA, SETOR, SITE } from "@/lib/constants";

// Lê o preço da aula e os horários abertos a cada visita.
export const dynamic = "force-dynamic";

const description =
  "Bela Cerâmica, o ateliê de Isabela Molinari em Pinheiros: aula avulsa com hora marcada e pagamento online, turma mensal de seis pessoas, e oficinas para empresas e eventos.";

export const metadata: Metadata = {
  title: SETOR.ceramica,
  description,
  alternates: { canonical: "/ceramica" },
  openGraph: {
    title: `${SETOR.ceramica} · ${SITE.artista}`,
    description,
    url: "/ceramica",
  },
};

/**
 * BELA CERÂMICA — o setor.
 *
 * Nível novo, pedido pela Isabela: "vamos começar pelo bela cerâmica. Lá
 * existem 2 cliques: Agende sua aula / Faça o orçamento da sua oficina."
 *
 * ── Por que ele precisa existir ───────────────────────────────────────────
 * Antes, `/aulas` e `/oficinas` eram irmãs de `/atendimentos` na barra, e as
 * três estavam no mesmo nível da obra e da trajetória. Isso fazia a cerâmica
 * ocupar dois dos cinco lugares e empurrava tudo o mais para a margem. Com a
 * página, a cerâmica passa a ocupar UM lugar na home e a se abrir por dentro.
 *
 * ── A frase mudou de endereço ─────────────────────────────────────────────
 * "O barro guarda o gesto" abria a home. Ela fala de cerâmica, e a cerâmica
 * deixou de ser o site inteiro — então ela desceu para cá, onde é verdade sem
 * ressalva, e a home ficou com o nome da Isabela.
 *
 * ── E os dois cliques não são iguais ──────────────────────────────────────
 * A aula tem preço e fecha sozinha, no site. A oficina é orçamento e passa por
 * conversa. Dar o mesmo peso visual aos dois esconderia essa diferença, que é
 * justamente o que a pessoa precisa saber antes de clicar.
 */
const CLIQUES = [
  {
    href: "/aulas#agenda",
    titulo: "Agende sua aula",
    linha: "Escolha o dia no calendário, pague e venha.",
    chaveFoto: "ceramica.porta.aulas",
    tingido: "bg-osso/40",
  },
  {
    href: "/oficinas",
    titulo: "Faça o orçamento da sua oficina",
    linha: `De ${OFICINA.minimo} a ${OFICINA.maximo} pessoas, para empresa ou evento.`,
    chaveFoto: "ceramica.porta.oficinas",
    tingido: "bg-sanguinea/20",
  },
] as const;

export default async function Ceramica() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  const valor: Record<string, string> = {
    "/aulas#agenda": preco ? `a partir de ${preco}` : "sob consulta",
    "/oficinas": `R$ ${OFICINA.precoPorPessoa} por pessoa`,
  };

  return (
    <>
      <section className="bg-papel pt-[6.5rem] pb-12 sm:pt-[8rem] sm:pb-14">
        <Container className="grid items-end gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div data-enter className="flex flex-col items-start gap-5">
            <p className="rotulo">
              {SETOR.ceramica} · desde 2022
            </p>

            <h1 className="cartaz font-display text-preto">
              O barro
              <br />
              guarda
              <br />
              <em className="italic text-vermelho">o gesto</em>
            </h1>

            <p className="max-w-md text-[1.02rem] leading-relaxed text-grafite">
              {LINHA.apoio}
            </p>
          </div>

          <figure className="lg:mb-2">
            <div className="sobreimpressao w-full">
              <div className="fuga relative aspect-[4/3] w-full overflow-hidden">
                <FotoDaSecao
                  chave="ceramica.hero"
                  priority
                  quality={90}
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="hero-img object-cover"
                />
              </div>
            </div>
          </figure>
        </Container>
      </section>

      {/* Os dois cliques. */}
      <section className="creme py-14 sm:py-16">
        <Container className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {CLIQUES.map((clique, i) => (
            <Reveal key={clique.href} indice={i} tipo="cartao" className="h-full">
              <Link href={clique.href} className="group flex h-full flex-col">
                <div
                  className={`relative aspect-[3/2] w-full overflow-hidden ${clique.tingido}`}
                >
                  <FotoDaSecao
                    chave={clique.chaveFoto}
                    quality={86}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-1.5 border-t border-borda pt-3.5">
                  <div className="flex items-baseline gap-3">
                    <span aria-hidden className="indice shrink-0 text-realce/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="titulo-cartao font-display text-texto transition-colors group-hover:text-realce">
                      {clique.titulo}
                    </h2>
                  </div>
                  <p className="text-[0.85rem] leading-snug text-texto/55">
                    {clique.linha}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <span className="numeral text-[1rem] text-realce">
                      {valor[clique.href]}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-realce transition-transform duration-[var(--t-estado)] ease-[var(--ease-firme)] group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </Container>
      </section>

      <ProximosHorarios />

      <section className="creme py-14 sm:py-16">
        <Container className="mb-7 flex flex-col gap-3">
          <p className="rotulo">O ateliê</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete max-w-lg font-display text-realce">
              Onde a aula acontece
            </h2>
          </Reveal>
        </Container>
        <Container>
          <GaleriaAtelie variante="faixa" />
        </Container>
      </section>

      <ConviteFinal />
    </>
  );
}
