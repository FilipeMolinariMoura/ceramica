import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO } from "@/lib/auth-cookie";

/**
 * Primeira porta do painel — e só a primeira.
 *
 * O middleware roda no runtime de edge, onde NÃO existe `pg`. Ele portanto não
 * consegue validar a sessão contra o banco: tudo que faz é ver se existe um
 * cookie e mandar quem não tem para a tela de entrada, sem carregar o painel.
 *
 * Quem de fato valida é `exigirSessao()` em `lib/auth.ts`, chamado no layout
 * do painel e na PRIMEIRA LINHA de cada Server Action. Isto não é redundância:
 * Server Action é um endpoint POST próprio e não passa por aqui, então
 * confiar só no middleware deixaria todas as ações do painel abertas.
 */
export function middleware(req: NextRequest) {
  // A exceção da tela de entrada é feita AQUI, e não por lookahead negativo no
  // `matcher`. A conversão que o Next faz do matcher engoliu o `(?!/entrar)` e
  // a própria tela de entrada passou a ser redirecionada para ela mesma —
  // laço fechado, painel inalcançável. Em código, é impossível ler errado.
  if (req.nextUrl.pathname.startsWith("/painel/entrar")) {
    return NextResponse.next();
  }

  const temCookie = req.cookies.has(COOKIE_SESSAO);
  if (temCookie) return NextResponse.next();

  const entrar = new URL("/painel/entrar", req.url);
  // Para devolver a pessoa à página que ela tentou abrir depois do login.
  entrar.searchParams.set("de", req.nextUrl.pathname);
  return NextResponse.redirect(entrar);
}

export const config = {
  matcher: ["/painel", "/painel/:caminho*"],
};
