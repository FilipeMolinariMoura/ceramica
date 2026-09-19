import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SITE } from "@/lib/constants";
import "./globals.css";

// Bodoni Moda: serifa de alto contraste, que em versalete com entreletra larga
// é o gesto da referência que a Isabela mandou. Substituiu a Fraunces, que é
// macia e arredondada — exatamente a "tia da cerâmica" que ela pediu para
// evitar. O eixo `opsz` deixa o título grande ganhar contraste sem afinar o
// texto pequeno.
const display = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

const description =
  "Ateliê de cerâmica de Isabela Molinari, artista visual e arteterapeuta, em Pinheiros. Peças autorais, encomendas e turmas de cerâmica com acompanhamento individual.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.dominio),
  title: {
    default: `${SITE.nome} · ${SITE.artista}`,
    // Cada página define só o próprio nome; a marca entra por aqui.
    template: `%s · ${SITE.nome}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE.nome,
    title: `${SITE.nome} · ${SITE.artista}`,
    description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Mesa coletiva de cerâmica vista de cima, com mãos trabalhando o barro.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.nome} · ${SITE.artista}`,
    description,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} antialiased`}
    >
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <WhatsappFab />
        <Toaster />
      </body>
    </html>
  );
}
