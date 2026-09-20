import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/constants";
import "./globals.css";

/**
 * DUAS VOZES, e as duas saíram da referência que a Isabela mandou.
 *
 * A Bodoni Moda foi embora. Olhada de perto, a serifa da referência tem
 * SERIFA COM COLO — a haste engrossa antes de virar o pé. Bodoni é didone:
 * serifa reta, fina, sem colo, e um contraste que na tela vira haste
 * quebradiça. Ela lia como capa de revista de moda, não como ateliê.
 *
 * Volta a Fraunces, que era o que estava aqui antes, mas afinada: `WONK` em 0
 * tira as terminações torcidas que a deixavam simpática demais, e `opsz` alto
 * dá o contraste do título sem afinar o texto pequeno. É a serifa da
 * referência com mais carne.
 *
 * E a grotesca saiu: o texto de interface da referência é uma GEOMÉTRICA de
 * entreletra aberta, da família da Futura. A Hanken Grotesk é humanista e
 * neutra — correta, e nada a ver com aquilo. Jost é a geométrica livre mais
 * próxima, e é a mesma escolha já feita no projeto da Landgraf.
 */
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
});

const sans = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

/**
 * A descrição padrão do site.
 *
 * A anterior — "ateliê de cerâmica ... peças autorais, encomendas e turmas com
 * acompanhamento individual" — servia para qualquer ateliê do país. Esta diz o
 * que só vale para ela: individual apoiada pela Funarte, residência, e a
 * cerâmica como pesquisa. É o que aparece no Google e no cartão do WhatsApp,
 * e é onde a diferença precisa caber em duas linhas.
 */
const description =
  "Isabela Molinari é artista visual e arteterapeuta em Pinheiros, São Paulo. Cerâmica, desenho e pintura como pesquisa sobre o corpo e o símbolo — e aulas, oficinas e encomendas saídas do mesmo ateliê.";

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
    /* `public/og.jpg` é a mesma colagem da abertura do site — creme, bloco
       vermelho chapado e uma peça das Flores de Luto fugindo do canto. Era
       uma foto de mesa de aula, que não dizia nem o nome nem o que é. Este
       cartão é o que a Isabela manda no WhatsApp quando divulga uma turma,
       então ele precisa parecer o trabalho dela à primeira vista. */
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Cartaz da Bela Cerâmica: “O barro guarda o gesto”, ao lado de uma peça circular de cerâmica da série Flores de Luto sobre um bloco vermelho.",
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
      {/* A barra e o rodapé NÃO moram aqui: são do grupo `(site)`. O layout
          raiz vale para tudo, inclusive para o painel, que não pode herdar a
          navegação pública nem o botão flutuante do WhatsApp. */}
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
