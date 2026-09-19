import { SITE } from "@/lib/constants";

/**
 * Origem absoluta do site, para montar as URLs que a InfinitePay vai chamar de
 * volta (retorno e webhook).
 *
 * Não pode sair do `Host` da requisição sem mais: quem controla esse cabeçalho
 * é quem chama, e uma reserva criada com `Host: site-do-atacante` faria a
 * InfinitePay mandar a confirmação do pagamento para lá. Por isso em produção
 * vale o domínio configurado, e o cabeçalho só é usado em desenvolvimento.
 */
export function origemDoSite(req: Request): string {
  const configurada = process.env.SITE_ORIGEM?.trim();
  if (configurada) return configurada.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") return SITE.dominio;
  return new URL(req.url).origin;
}
