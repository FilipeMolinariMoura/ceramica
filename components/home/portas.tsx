import { FotoDaSecao } from "@/components/foto-da-secao";
import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { SERVICO_AULA_AVULSA } from "@/lib/constants";
import { OFICINA } from "@/lib/oficina";

/**
 * O catálogo. Três portas, na ordem que a Isabela pediu.
 *
 * ── A numeração não é enfeite ─────────────────────────────────────────────
 * Ela vem do material dela. O deck que a Isabela manda para cliente numera as
 * etapas "0 1  0 2  0 3  0 4" e pagina "0 1 / 0 4", com o dígito espaçado. É
 * a linguagem gráfica que ela já usa quando fala com quem paga — então o site
 * passa a falar igual, em vez de inventar um sistema paralelo.
 *
 * ── O preço aparece ───────────────────────────────────────────────────────
 * Os três valores estavam como "sob consulta" e "sob orçamento". Mas o deck
 * de oficina dela ABRE com R$ 320 por participante, em corpo grande, na
 * primeira página. Esconder no site um número que ela mesma publica no PDF só
 * adiciona uma ida e volta de WhatsApp antes de a pessoa descobrir se cabe no
 * orçamento — e algumas desistem no meio.
 *
 * O 1:1 continua sem número porque ela ainda não definiu, e inventar um seria
 * pior do que não ter.
 *
 * ── Por que não é cartão ──────────────────────────────────────────────────
 * Porque a referência não tem cartão: tem FOTO SOBRE FUNDO TINGIDO, e embaixo,
 * fora da foto, legenda pequena e preço. Sem moldura, sem sombra, sem seta.
 * Os tingidos agora saem da obra — osso, cinza de luto, sanguínea — em vez do
 * verde-sálvia, que não está em nenhum trabalho dela.
 */
const PORTAS = [
  {
    href: "/aulas",
    titulo: "Turma de aulas",
    texto: "Terças, seis por turma. Avulsa com hora marcada ou mensal.",
    chaveFoto: "home.porta.aulas",
    tingido: "bg-osso/40",
  },
  {
    href: "/oficinas",
    titulo: "Sua oficina",
    texto: `De ${OFICINA.minimo} a ${OFICINA.maximo} pessoas, ${OFICINA.duracao}, com a peça esmaltada e entregue.`,
    chaveFoto: "home.porta.oficinas",
    tingido: "bg-sanguinea/20",
  },
  {
    href: "/atendimentos",
    titulo: "Atendimento 1:1",
    texto: "Tarot e astrologia, em sessão individual.",
    chaveFoto: "home.porta.atendimentos",
    tingido: "bg-cinza/20",
  },
] as const;

export async function Portas() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  const valor: Record<string, string> = {
    "/aulas": preco ? `a partir de ${preco}` : "sob consulta",
    "/oficinas": `R$ ${OFICINA.precoPorPessoa} por pessoa`,
    "/atendimentos": "sob consulta",
  };

  return (
    <section className="creme relative pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
      <Container className="mb-10 flex flex-col gap-4 sm:mb-12">
        <p className="rotulo">O que tem aqui</p>
        <Reveal tipo="titulo">
          <h2 className="titulo-secao versalete max-w-2xl font-display text-realce">
            Três portas
          </h2>
        </Reveal>
        <Reveal tipo="texto">
          <p className="max-w-md text-[0.98rem] leading-relaxed text-texto/70">
            Nenhuma delas exige experiência com barro. As duas primeiras têm
            preço aqui embaixo.
          </p>
        </Reveal>
      </Container>

      <Container className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAS.map((porta, i) => (
          <Reveal key={porta.href} indice={i} tipo="cartao">
            <Link href={porta.href} className="group block">
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden ${porta.tingido}`}
              >
                <FotoDaSecao
                  chave={porta.chaveFoto}
                  quality={86}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
              </div>

              <div className="mt-4 flex items-baseline gap-3 border-t border-borda pt-3">
                <span
                  aria-hidden
                  className="indice shrink-0 text-realce/70"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="titulo-cartao font-display text-texto transition-colors group-hover:text-realce">
                    {porta.titulo}
                  </h3>
                  <p className="text-[0.85rem] leading-snug text-texto/60">
                    {porta.texto}
                  </p>
                  <p className="numeral mt-1 text-[1.05rem] text-realce">
                    {valor[porta.href]}
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
