import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { listarPaginas } from "@/lib/paginas";

/* Lê as páginas que a Isabela publicou, então não pode ser prerenderizado no
   `docker build`, onde não existe Postgres. */
export const dynamic = "force-dynamic";

/**
 * O mapa do site.
 *
 * Passou a valer a pena agora: até ontem havia catálogo e formulário, e o que
 * o Google tinha para indexar era o mesmo de qualquer ateliê. Agora existem
 * catorze obras com ficha, uma trajetória com exposição e residência, e uma
 * página de oficina com preço — conteúdo que a busca sabe distinguir.
 *
 * ── Prioridade não é opinião ──────────────────────────────────────────────
 * `/aulas` é 1.0 porque é a página que cobra. `/obras` e `/sobre` vêm logo
 * atrás porque são o que faz alguém confiar o suficiente para pagar. O resto
 * desce a partir daí. Google trata isso como dica, não como ordem — mas uma
 * dica errada é pior que nenhuma.
 *
 * ── Por que as páginas dela entram ────────────────────────────────────────
 * Ela cria páginas de evento pelo painel (`/workshop-de-natal` e afins). Se o
 * sitemap fosse uma lista fixa em código, toda página que ela publicasse
 * nasceria invisível para a busca, e ela não teria como saber por quê.
 *
 * ── E por que há try/catch ────────────────────────────────────────────────
 * Um sitemap é conveniência. Se o banco estiver fora do ar, devolver as rotas
 * fixas é muito melhor do que devolver 500: o rastreador registra o erro e
 * pode demorar a voltar.
 */

const FIXAS: { rota: string; prioridade: number }[] = [
  { rota: "/aulas", prioridade: 1.0 },
  { rota: "/", prioridade: 0.9 },
  { rota: "/obras", prioridade: 0.9 },
  { rota: "/sobre", prioridade: 0.8 },
  { rota: "/oficinas", prioridade: 0.8 },
  { rota: "/atendimentos", prioridade: 0.7 },
  { rota: "/encomendas", prioridade: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const base: MetadataRoute.Sitemap = FIXAS.map(({ rota, prioridade }) => ({
    url: `${SITE.dominio}${rota}`,
    lastModified: agora,
    changeFrequency: rota === "/aulas" ? "daily" : "monthly",
    priority: prioridade,
  }));

  try {
    const paginas = await listarPaginas();
    const dela: MetadataRoute.Sitemap = paginas
      .filter((p) => p.publicada)
      .map((p) => ({
        url: `${SITE.dominio}/${p.slug}`,
        lastModified: agora,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    return [...base, ...dela];
  } catch (err) {
    console.error("[sitemap] não consegui listar as páginas:", err);
    return base;
  }
}
