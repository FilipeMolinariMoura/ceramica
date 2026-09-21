"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/section";
import { ARTISTA, FECHAMENTO, NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * A barra do site.
 *
 * ── O BUG QUE ISTO CONSERTA ───────────────────────────────────────────────
 * O painel do menu mobile era `fixed top-[4.25rem] bottom-0` e ficava DENTRO
 * do `<header>`. E o header tem `backdrop-blur-md`.
 *
 * `backdrop-filter`, como `transform`, cria um BLOCO DE CONTENÇÃO para
 * descendentes `fixed`. Ou seja: o painel não se posicionava contra a
 * viewport, e sim contra o header de 69px. `top: 68px` + `bottom: 0` dentro de
 * uma caixa de 69px dá **altura zero** — medido em produção. O fundo creme do
 * painel pintava um retângulo de 0px, e os cinco links transbordavam por cima
 * da página, sem nada atrás. No celular o menu estava morto.
 *
 * Por isso o painel agora é IRMÃO do header, não filho. Nada acima dele tem
 * transform, filter ou backdrop-filter, então o `fixed` volta a valer contra a
 * viewport. `100dvh` em vez de `100vh` porque a barra do Safari no iPhone
 * encolhe a viewport e `vh` ignora isso.
 *
 * ── A HIERARQUIA DOS LINKS ────────────────────────────────────────────────
 * Aulas, Oficinas e Atendimentos são o que o ateliê vende; Obras e Sobre são
 * o que faz acreditar. Antes os cinco tinham o mesmo peso, o que é uma lista
 * de seções — não uma vitrine. Agora os produtos vêm primeiro e em contraste
 * cheio, os outros dois vêm depois de um filete e mais apagados.
 *
 * ── E O BOTÃO ─────────────────────────────────────────────────────────────
 * A barra é a única coisa presente em toda tela do site. Sem um caminho de
 * compra nela, quem rolou até o meio de `/sobre` precisa voltar ao topo, achar
 * "Aulas" e rolar de novo até a agenda. O botão elimina isso de todo lugar de
 * uma vez, e é o que `FECHAMENTO` existe para centralizar.
 */
export function SiteHeader({
  extras = [],
}: {
  extras?: { slug: string; titulo: string }[];
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = React.useState(false);

  const produtos = NAV.filter((i) => i.tipo === "produto");
  /* As páginas que a Isabela publicou entram junto das laterais: são conteúdo
     dela, não produto do catálogo. */
  const laterais = [
    ...NAV.filter((i) => i.tipo === "lateral"),
    ...extras.map((p) => ({ href: `/${p.slug}`, label: p.titulo, tipo: "lateral" as const })),
  ];

  // Fecha o menu ao navegar: sem isto, no mobile a rota muda por baixo do
  // painel aberto e a pessoa acha que o clique não funcionou.
  React.useEffect(() => setAberto(false), [pathname]);

  // Trava o scroll do fundo enquanto o painel está aberto.
  React.useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  const ativo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClasse = (href: string, lateral: boolean) =>
    cn(
      "versalete-larga relative py-1 text-[0.66rem] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-vermelho after:transition-transform after:duration-300 hover:text-vermelho hover:after:scale-x-100",
      ativo(href)
        ? "text-vermelho after:scale-x-100"
        : lateral
          ? "text-preto/45"
          : "text-preto/75"
    );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-papel/95 backdrop-blur-md">
        <Container className="flex h-[4.25rem] items-center justify-between gap-4">
          {/* A marca é o NOME dela agora. Antes era "BELA CERÂMICA" grande com
              "ISABELA MOLINARI" miúdo embaixo — as duas linhas diziam a mesma
              coisa duas vezes assim que o site passou a se chamar por ela, e a
              segunda linha vira a qualificação. */}
          <Link
            href="/"
            className="group flex shrink-0 flex-col leading-none"
            aria-label={`${SITE.nome} — página inicial`}
          >
            <span className="versalete font-display text-lg text-vermelho transition-colors group-hover:text-vermelho-escuro sm:text-xl">
              {SITE.nome}
            </span>
            <span className="versalete-larga mt-1 hidden text-[0.52rem] text-preto/45 sm:block">
              {ARTISTA.titulo}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {produtos.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo(item.href) ? "page" : undefined}
                className={linkClasse(item.href, false)}
              >
                {item.label}
              </Link>
            ))}

            <span aria-hidden className="h-4 w-px bg-linha" />

            {laterais.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo(item.href) ? "page" : undefined}
                className={linkClasse(item.href, true)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            {/* Curto no telefone, por extenso a partir do tablet: "Marcar aula"
                não cabe ao lado do hambúrguer em 375px sem espremer a marca. */}
            <Link
              href={FECHAMENTO}
              className="inline-flex h-10 items-center justify-center bg-vermelho px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px sm:h-11 sm:px-6 sm:text-[0.72rem]"
            >
              Marcar<span className="hidden sm:inline">&nbsp;aula</span>
            </Link>

            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-mobile"
              aria-label={aberto ? "Fechar o menu" : "Abrir o menu"}
              className="-mr-2 grid h-11 w-11 place-items-center text-preto transition-colors hover:text-vermelho md:hidden"
            >
              {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </Container>
      </header>

      {/* IRMÃO do header, nunca filho — ver o comentário no topo. */}
      <div
        id="menu-mobile"
        data-aberto={aberto}
        className="fixed inset-x-0 top-[4.25rem] z-40 h-[calc(100dvh-4.25rem)] overflow-y-auto bg-papel transition-[opacity,transform] duration-300 data-[aberto=false]:pointer-events-none data-[aberto=false]:-translate-y-2 data-[aberto=false]:opacity-0 md:hidden"
      >
        <Container className="flex flex-col pt-4 pb-10">
          {produtos.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={cn(
                "versalete border-b border-linha py-5 font-display text-2xl transition-colors",
                ativo(item.href) ? "text-vermelho" : "text-preto"
              )}
            >
              {item.label}
            </Link>
          ))}

          {laterais.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={cn(
                "versalete border-b border-linha py-4 font-display text-base transition-colors",
                ativo(item.href) ? "text-vermelho" : "text-preto/50"
              )}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={FECHAMENTO}
            className="mt-7 inline-flex h-[3.4rem] items-center justify-center bg-vermelho px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
          >
            Ver os horários
          </Link>
        </Container>
      </div>
    </>
  );
}
