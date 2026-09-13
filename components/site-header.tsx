"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/section";
import { NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Barra do site. Três coisas a saber:
 *
 * 1. Ela é TRANSPARENTE no topo e ganha fundo ao rolar. O hero de cada página
 *    começa debaixo dela, então um fundo sólido desde o início cortaria a foto
 *    em duas.
 * 2. Quando tem FOTO atrás, escreve em claro — com a cor normal (barro) o
 *    logotipo some dentro da foto, que é clara justamente no canto superior
 *    esquerdo, onde ele fica. Em `/aulas` a foto só está atrás da barra até o
 *    `lg`: daí para cima ela vai para a coluna da direita e o texto volta a
 *    correr sobre fundo lona. Por isso as variantes `lg:` escritas à mão —
 *    classe montada em runtime o Tailwind não enxerga, e o CSS não sairia.
 * 3. O item ativo é marcado por `startsWith`, e não por igualdade, para que
 *    uma futura `/obras/<peca>` continue acendendo "Obras".
 */

const SOMBRA_LOGO = "drop-shadow-[0_1px_12px_rgba(51,41,31,0.55)]";
const SOMBRA_ITEM = "drop-shadow-[0_1px_10px_rgba(51,41,31,0.55)]";

export function SiteHeader() {
  const pathname = usePathname();
  const [rolou, setRolou] = React.useState(false);
  const [aberto, setAberto] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const tom: "claro" | "claro-ate-lg" | "escuro" =
    rolou || aberto
      ? "escuro"
      : pathname === "/"
        ? "claro"
        : pathname.startsWith("/aulas")
          ? "claro-ate-lg"
          : "escuro";

  return (
    <header
      data-rolou={rolou}
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 data-[rolou=true]:bg-lona/85 data-[rolou=true]:shadow-[0_1px_0_0_rgba(51,41,31,0.08)] data-[rolou=true]:backdrop-blur-md"
    >
      <Container className="flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label={`${SITE.nome} — página inicial`}
        >
          <span
            className={cn(
              "font-display text-xl tracking-[-0.01em] transition-colors sm:text-[1.35rem]",
              tom === "claro" &&
                `text-lona ${SOMBRA_LOGO} group-hover:text-parede-soft`,
              tom === "claro-ate-lg" &&
                `text-lona ${SOMBRA_LOGO} group-hover:text-parede-soft lg:text-barro lg:drop-shadow-none lg:group-hover:text-cobalto`,
              tom === "escuro" && "text-barro group-hover:text-cobalto"
            )}
          >
            {SITE.nome}
          </span>
          <span
            className={cn(
              "mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] transition-colors",
              tom === "claro" && `text-lona/70 ${SOMBRA_ITEM}`,
              tom === "claro-ate-lg" &&
                `text-lona/70 ${SOMBRA_ITEM} lg:text-barro/45 lg:drop-shadow-none`,
              tom === "escuro" && "text-barro/45"
            )}
          >
            {SITE.artista}
          </span>
        </Link>

        {/* No `lg` a barra nunca está sobre foto (nem na home? está — por isso
            o tom "claro" também vale aqui). */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={cn(
                "relative py-1 text-[0.95rem] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                tom === "claro"
                  ? cn(
                      "text-lona/85 after:bg-lona hover:text-lona",
                      SOMBRA_ITEM,
                      ativo(item.href) && "text-lona after:scale-x-100"
                    )
                  : cn(
                      "after:bg-cobalto hover:text-cobalto",
                      ativo(item.href)
                        ? "text-cobalto after:scale-x-100"
                        : "text-barro/75"
                    )
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
          className={cn(
            "-mr-2 grid h-11 w-11 place-items-center rounded-full transition-colors md:hidden",
            tom === "escuro"
              ? "text-barro hover:bg-barro/5"
              : `text-lona ${SOMBRA_ITEM} hover:bg-lona/10`
          )}
        >
          {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {/* Painel mobile: ocupa a tela inteira, um item por linha, tipografia
          grande. Menu de site de artista não é lista de sistema. */}
      <div
        id="menu-mobile"
        data-aberto={aberto}
        className="fixed inset-x-0 top-[4.5rem] bottom-0 z-40 bg-lona transition-[opacity,transform] duration-300 data-[aberto=false]:pointer-events-none data-[aberto=false]:-translate-y-2 data-[aberto=false]:opacity-0 md:hidden"
      >
        <Container className="flex flex-col pt-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={cn(
                "border-b border-lona-300 py-5 font-display text-3xl transition-colors",
                ativo(item.href) ? "text-cobalto" : "text-barro"
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
