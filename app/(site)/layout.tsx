import { SiteHeader } from "@/components/site-header";
import { paginasDoMenu } from "@/lib/paginas";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";

/**
 * Casca do site público.
 *
 * Saiu do `app/layout.tsx` porque o layout raiz vale para TUDO: o painel da
 * Isabela estava renderizando a barra de navegação, o rodapé e o botão
 * flutuante do WhatsApp por cima da tela de gestão dela. Agora a barra e o
 * rodapé pertencem a este grupo, e `/painel` fica de fora.
 *
 * O grupo `(site)` não aparece na URL: `/aulas` continua sendo `/aulas`.
 */
// Lê as páginas dela a cada visita: o menu muda quando ela publica uma.
export const dynamic = "force-dynamic";

export default async function LayoutSite({
  children,
}: {
  children: React.ReactNode;
}) {
  const extras = await paginasDoMenu();

  return (
    <>
      <SiteHeader extras={extras} />
      <main>{children}</main>
      <SiteFooter />
      <WhatsappFab />
    </>
  );
}
