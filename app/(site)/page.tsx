import { HeroHome } from "@/components/home/hero-home";
import { Portas } from "@/components/home/portas";

// As portas leem o preço da aula no banco. Sem isto o Next tentaria
// prerenderizar a home no `docker build`, onde não há Postgres.
export const dynamic = "force-dynamic";

/**
 * A PÁGINA INICIAL.
 *
 * Três cliques e nada mais — foi o pedido da Isabela, com estas palavras:
 * "na página inicial existem 3 cliques, pouquíssima informação (...) o mínimo
 * de texto nesse momento!"
 *
 * ── O que saiu daqui, e para onde foi ─────────────────────────────────────
 * Esta página tinha nove seções: cartaz, portas, próximos horários, pesquisa,
 * a queima em Igatu, currículo, ateliê, prints e convite. Era um bom arco e
 * era a home errada — quem chega do Instagram precisa escolher para onde ir,
 * não ler uma revista.
 *
 * Nada foi apagado. Cada bloco desceu para trás da porta a que pertence:
 *
 *   próximos horários · ateliê · convite   → `/ceramica`
 *   pesquisa · a queima em Igatu           → `/sobre`
 *   prints                                 → `/obras`
 *
 * A home ficou sendo o que uma home de três setores tem que ser: um lugar de
 * onde se sai rápido.
 */
export default function Home() {
  return (
    <>
      <HeroHome />
      <Portas />
    </>
  );
}
