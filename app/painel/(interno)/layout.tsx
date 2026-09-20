import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/auth";
import { sair } from "@/app/painel/acoes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel",
  // Painel não entra em buscador. `noindex` é higiene, não segurança — quem
  // protege é a sessão.
  robots: { index: false, follow: false },
};

const ABAS = [
  { href: "/painel", label: "Reservas" },
  { href: "/painel/agenda", label: "Agenda" },
  { href: "/painel/fotos", label: "Fotos" },
  { href: "/painel/paginas", label: "Páginas" },
] as const;

/**
 * Casca do painel — e a validação de verdade da sessão.
 *
 * O `middleware.ts` só olha se EXISTE cookie, porque roda no edge e não
 * alcança o banco. É aqui que o cookie é conferido contra `sessoes`, então um
 * cookie inventado passa pelo middleware e morre nesta linha.
 *
 * Mora num GRUPO de rotas — `(interno)` — e não em `app/painel/` direto. Sem
 * o grupo, este layout envolveria também `/painel/entrar`: quem não tivesse
 * sessão seria mandado para a tela de entrada, que renderizaria este layout,
 * que mandaria de novo para a tela de entrada. Laço fechado, painel
 * inalcançável, e o sintoma é só um 307 para a própria URL.
 */
export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/painel/entrar");

  return (
    <div className="min-h-screen bg-papel">
      <div className="border-b border-linha bg-branco">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <span className="versalete font-display text-lg text-vermelho">
              Painel
            </span>
            <nav className="flex gap-5">
              {ABAS.map((aba) => (
                <Link
                  key={aba.href}
                  href={aba.href}
                  className="versalete-larga text-[0.66rem] text-preto/70 transition-colors hover:text-vermelho"
                >
                  {aba.label}
                </Link>
              ))}
            </nav>
          </div>

          <form action={sair} className="flex items-center gap-4">
            <span className="text-[0.8rem] text-grafite/70">{usuario.nome}</span>
            <button
              type="submit"
              className="versalete-larga text-[0.64rem] text-preto/60 underline underline-offset-4 transition-colors hover:text-vermelho"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">{children}</div>
    </div>
  );
}
