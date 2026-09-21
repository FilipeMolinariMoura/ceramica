import { FotoDaSecao } from "@/components/foto-da-secao";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { SERVICO_AULA_AVULSA } from "@/lib/constants";

/**
 * AS TRÊS PORTAS DA PÁGINA INICIAL.
 *
 * Ditadas pela Isabela, com estas palavras: "na página inicial existem 3
 * cliques, pouquíssima informação e os 3 chamam: Bela Cerâmica / Conheça mais
 * sobre Isabela Molinari / Agende sua consulta astrológica. O mínimo de texto
 * nesse momento!"
 *
 * ── O que mudou, e é mais do que parece ───────────────────────────────────
 * As portas eram Aulas, Oficinas e Atendimento 1:1 — três PRODUTOS. Agora são
 * três SETORES, e a cerâmica virou um deles em vez de ser o site inteiro.
 * Aulas e oficinas desceram um nível: viram os dois cliques de dentro da Bela
 * Cerâmica.
 *
 * Parece perder um passo de venda, e não perde: a barra tem botão de agendar
 * em toda tela, e a porta da cerâmica já mostra o preço da aula. O que se
 * ganha é a astrologia deixar de ser puxadinho de uma escola de barro, e a
 * obra dela deixar de ser rodapé de um ateliê.
 *
 * ── "O mínimo de texto" ───────────────────────────────────────────────────
 * Uma linha por porta, e só. A porta da cerâmica carrega o preço porque é a
 * única das três que se compra sozinho; as outras duas carregam o que são.
 * Nenhuma tem parágrafo.
 */
const PORTAS = [
  {
    href: "/ceramica",
    titulo: "Bela Cerâmica",
    linha: "Aulas e oficinas, no ateliê em Pinheiros",
    chaveFoto: "home.porta.ceramica",
    tingido: "bg-osso/40",
  },
  {
    href: "/sobre",
    titulo: "Conheça mais sobre Isabela Molinari",
    linha: "A obra, a pesquisa e a trajetória",
    chaveFoto: "home.porta.artista",
    tingido: "bg-cinza/20",
  },
  {
    href: "/atendimentos",
    titulo: "Agende sua consulta astrológica",
    linha: "Mapa natal e tarot, em sessão individual",
    chaveFoto: "home.porta.astrologia",
    tingido: "bg-sanguinea/20",
  },
] as const;

export async function Portas() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  const valor: Record<string, string | null> = {
    "/ceramica": preco ? `aula avulsa a partir de ${preco}` : null,
    "/sobre": null,
    "/atendimentos": null,
  };

  return (
    <section className="creme pt-14 pb-20 sm:pt-16 sm:pb-24">
      <Container className="grid gap-x-5 gap-y-10 sm:grid-cols-3">
        {PORTAS.map((porta, i) => (
          <Reveal key={porta.href} indice={i} tipo="cartao" className="h-full">
            <Link href={porta.href} className="group flex h-full flex-col">
              <div
                className={`relative aspect-[4/5] w-full overflow-hidden ${porta.tingido}`}
              >
                <FotoDaSecao
                  chave={porta.chaveFoto}
                  quality={86}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
              </div>

              <div className="mt-4 flex flex-1 flex-col gap-1.5 border-t border-borda pt-3.5">
                <div className="flex items-baseline gap-3">
                  <span aria-hidden className="indice shrink-0 text-realce/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="titulo-cartao font-display text-texto transition-colors group-hover:text-realce">
                    {porta.titulo}
                  </h2>
                </div>

                <p className="pl-[calc(0.68rem+1.5ch)] text-[0.85rem] leading-snug text-texto/55">
                  {porta.linha}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-3 pl-[calc(0.68rem+1.5ch)]">
                  {valor[porta.href] ? (
                    <span className="numeral text-[0.95rem] text-realce">
                      {valor[porta.href]}
                    </span>
                  ) : (
                    <span className="versalete-larga text-[0.6rem] text-realce">
                      Entrar
                    </span>
                  )}
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
  );
}
