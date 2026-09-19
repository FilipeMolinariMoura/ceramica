"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/section";
import { NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Barra do site: SÓLIDA e sempre escura sobre creme.
 *
 * A versão anterior tinha três tons (`claro`, `claro-ate-lg`, `escuro`) porque
 * cada página começava com uma foto atrás dela e o logotipo precisava virar
 * branco para não sumir. Isso quebrou quando a home passou a abrir em creme: o
 * logotipo branco ficou invisível sobre fundo claro.
 *
 * Em vez de acrescentar um quarto caso, a barra deixou de depender do que está
 * atrás. É também o que a referência faz — barra de creme, filete embaixo,
 * versalete. Cada hero já reserva o espaço dela no topo com `pt`.
 *
 * O item ativo é marcado por `startsWith`, e não por igualdade, para que uma
 * futura `/obras/<peca>` continue acendendo "Obras".
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [aberto, setAberto] = React.useState(false);

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-papel/95 backdrop-blur-md">
      <Container className="flex h-[4.25rem] items-center justify-between gap-6">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label={`${SITE.nome} — página inicial`}
        >
          <span className="versalete font-display text-lg text-vermelho transition-colors group-hover:text-vermelho-escuro sm:text-xl">
            {SITE.nome}
          </span>
          <span className="versalete-larga mt-1 text-[0.55rem] text-preto/45">
            {SITE.artista}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={cn(
                "versalete-larga relative py-1 text-[0.66rem] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-vermelho after:transition-transform after:duration-300 hover:text-vermelho hover:after:scale-x-100",
                ativo(item.href) ? "text-vermelho after:scale-x-100" : "text-preto/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
      </Container>

      {/* Painel mobile: ocupa a tela inteira, um item por linha, tipografia
          grande. Menu de site de artista não é lista de sistema. */}
      <div
        id="menu-mobile"
        data-aberto={aberto}
        className="fixed inset-x-0 top-[4.25rem] bottom-0 z-40 bg-papel transition-[opacity,transform] duration-300 data-[aberto=false]:pointer-events-none data-[aberto=false]:-translate-y-2 data-[aberto=false]:opacity-0 md:hidden"
      >
        <Container className="flex flex-col pt-4">
          {NAV.map((item) => (
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
        </Container>
      </div>
    </header>
  );
}
