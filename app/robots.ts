import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/**
 * `robots.txt`.
 *
 * O site não tinha nenhum, e o padrão de "nenhum robots.txt" é liberar tudo —
 * inclusive o que não deve ser rastreado. Três famílias de caminho precisam
 * ficar de fora, e nenhuma delas é segredo de segurança (o acesso já é barrado
 * por sessão ou por token); é que indexá-las não serve a ninguém e prejudica:
 *
 *   /painel      a área da Isabela. Cada página já redireciona sem sessão,
 *                mas aparecer no Google só convida gente a tentar entrar.
 *
 *   /api         endpoints. Rastrear um POST não produz nada de útil, e o
 *                webhook de pagamento não tem por que existir num índice.
 *
 *   /aulas/reserva/  o comprovante de quem pagou, endereçado por um token de
 *                64 hexadecimais. A página já manda `noindex` no cabeçalho,
 *                mas é dado pessoal de cliente: vale dizer duas vezes.
 *
 *   /midias      as imagens são servidas por id; quem procura a foto acha
 *                pela página em que ela aparece, com a legenda junto.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/painel", "/api/", "/aulas/reserva/", "/midias/"],
    },
    sitemap: `${SITE.dominio}/sitemap.xml`,
    host: SITE.dominio,
  };
}
