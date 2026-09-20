import { lerArquivoDaMidia } from "@/lib/midias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve uma foto do volume.
 *
 * O `[id]` NUNCA vira caminho. Ele é usado para buscar a linha no banco, e o
 * caminho em disco é montado a partir do nome que NÓS geramos na gravação.
 * `%2e%2e%2f` é decodificado antes de chegar aqui, então sanitizar a string
 * seria uma corrida; não concatená-la a um caminho não tem como dar errado.
 *
 * O Caddy compartilhado NÃO serve este volume de propósito: montá-lo lá
 * acoplaria a stack do site ao proxy que atende o painel do Prisma e o
 * PersonalizaML. O tráfego aqui é irrisório e um route handler dá conta.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const arquivo = await lerArquivoDaMidia(id);

  if (!arquivo) {
    return new Response("não encontrado", { status: 404 });
  }

  return new Response(new Uint8Array(arquivo.bytes), {
    headers: {
      "Content-Type": arquivo.tipo,
      // O id é imutável e o conteúdo dele também: trocar a foto de uma seção
      // cria uma mídia nova, com id novo. Cache longo é seguro.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
