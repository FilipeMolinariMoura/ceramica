import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocos } from "@/components/blocos/renderizar";
import { paginaPorSlug } from "@/lib/paginas";
import { SLUG_VALIDO } from "@/lib/paginas";

// Lê o banco a cada visita. Sem isto o Next tentaria prerenderizar no
// `docker build`, onde não existe Postgres.
export const dynamic = "force-dynamic";

/**
 * As páginas que a Isabela monta no painel.
 *
 * Esta rota NÃO conflita com `/obras`, `/aulas` e companhia: no App Router o
 * segmento estático vence o dinâmico. O risco é o inverso, e está tratado na
 * gravação — ela é impedida de criar uma página com endereço que já existe,
 * porque senão publicaria, abriria a URL, veria a página antiga e concluiria
 * que o site quebrou. Ver `SLUGS_RESERVADOS`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!SLUG_VALIDO.test(slug)) return {};
  const pagina = await paginaPorSlug(slug);
  if (!pagina) return {};
  return {
    title: pagina.titulo,
    description: pagina.descricaoSeo ?? undefined,
    alternates: { canonical: `/${pagina.slug}` },
  };
}

export default async function PaginaDela({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!SLUG_VALIDO.test(slug)) notFound();

  const pagina = await paginaPorSlug(slug);
  if (!pagina) notFound();

  return (
    <div className="pt-[4.25rem]">
      <Blocos blocos={pagina.blocos} />
    </div>
  );
}
