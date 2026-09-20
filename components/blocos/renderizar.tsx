import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { CabecalhoSecao } from "@/components/cabecalho-secao";
import { Reveal } from "@/components/reveal";
import { AgendaAulaAvulsa } from "@/components/agenda/agenda-aula-avulsa";
import { urlDaMidia } from "@/lib/midias";
import type { Bloco } from "@/lib/paginas";

/**
 * Desenha os blocos que a Isabela montou.
 *
 * ── Duas regras que impedem a página de cair ──────────────────────────────
 * 1. TIPO DESCONHECIDO NÃO RENDERIZA NADA. Se um tipo for renomeado no código
 *    e sobrar bloco antigo no banco, a página pública perde aquele bloco e
 *    segue — em vez de lançar e virar 500 na cara de quem entrou.
 * 2. TODO CAMPO É LIDO COMO TEXTO. Nada de `dangerouslySetInnerHTML`. Não é
 *    conservadorismo: o painel é de uma pessoa só, mas se a sessão dela for
 *    comprometida, HTML gravado no banco rodaria na MESMA ORIGEM do cookie do
 *    painel. Texto puro tira essa porta da existência, e parágrafo por linha
 *    em branco cobre 100% do que ela precisa escrever.
 */

function paragrafos(texto: string): string[] {
  return texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function linhas(texto: string): string[] {
  return texto.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function Blocos({ blocos }: { blocos: Bloco[] }) {
  return (
    <>
      {blocos.map((b) => (
        <BlocoUm key={b.id} bloco={b} />
      ))}
    </>
  );
}

function BlocoUm({ bloco }: { bloco: Bloco }) {
  const d = bloco.dados ?? {};
  const texto = (k: string) => (typeof d[k] === "string" ? d[k] : "");

  switch (bloco.tipo) {
    case "titulo":
      return (
        <section className="creme pt-14 sm:pt-16">
          <CabecalhoSecao
            titulo={texto("titulo") || "Sem título"}
            subtitulo={texto("subtitulo") || undefined}
          />
        </section>
      );

    case "texto": {
      const ps = paragrafos(texto("corpo"));
      if (ps.length === 0) return null;
      return (
        <section className="creme py-8">
          <Container className="max-w-2xl">
            <Reveal>
              <div className="flex flex-col gap-4">
                {ps.map((p, i) => (
                  <p key={i} className="text-[1.05rem] leading-relaxed text-texto/85">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      );
    }

    case "foto": {
      const id = texto("midiaId");
      if (!id) return null;
      return (
        <section className="creme py-8">
          <Container>
            <Reveal tipo="foto">
              <figure className="flex flex-col gap-2.5">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={urlDaMidia(id)}
                    alt={texto("legenda")}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                {texto("legenda") ? (
                  <figcaption className="text-[0.85rem] text-texto/60">
                    {texto("legenda")}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          </Container>
        </section>
      );
    }

    case "foto-texto": {
      const id = texto("midiaId");
      return (
        <section className="creme py-10 sm:py-14">
          <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            {id ? (
              <Reveal tipo="foto">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={urlDaMidia(id)}
                    alt={texto("titulo")}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : null}
            <Reveal>
              <div className="flex flex-col gap-4">
                {texto("titulo") ? (
                  <h2 className="titulo-secao versalete font-display text-realce">
                    {texto("titulo")}
                  </h2>
                ) : null}
                {paragrafos(texto("corpo")).map((p, i) => (
                  <p key={i} className="text-[1.02rem] leading-relaxed text-texto/85">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      );
    }

    case "lista": {
      const itens = linhas(texto("itens"));
      if (itens.length === 0) return null;
      return (
        <section className="creme py-10">
          <Container className="max-w-2xl">
            {texto("titulo") ? (
              <h2 className="titulo-secao versalete mb-6 font-display text-realce">
                {texto("titulo")}
              </h2>
            ) : null}
            <ul className="flex flex-col gap-3">
              {itens.map((item, i) => (
                <Reveal key={i} indice={i} tipo="cartao">
                  <li className="flex gap-3 text-[1.02rem] leading-relaxed text-texto/85">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-vermelho" />
                    {item}
                  </li>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      );
    }

    case "cta": {
      const destino = texto("destino");
      // Só endereço interno ou http(s). Um `javascript:` aqui viraria clique
      // executável na página pública.
      const seguro = /^\/(?![/\\])/.test(destino) || /^https?:\/\//.test(destino);
      return (
        <section className="verde py-14 sm:py-16">
          <Container className="flex max-w-2xl flex-col items-start gap-5">
            <h2 className="titulo-secao versalete font-display text-realce">
              {texto("titulo") || "Vamos conversar"}
            </h2>
            {seguro && texto("botao") ? (
              <Link
                href={destino}
                className="inline-flex h-12 items-center justify-center bg-papel px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-vermelho transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-branco active:translate-y-px"
              >
                {texto("botao")}
              </Link>
            ) : null}
          </Container>
        </section>
      );
    }

    case "agenda":
      return <AgendaAulaAvulsa />;

    default:
      // Tipo que o código não conhece mais. Some, não derruba.
      return null;
  }
}
