import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

const description =
  "Duas turmas às terças, de manhã e de tarde, com seis vagas cada e acompanhamento individual, em Pinheiros. As turmas de cerâmica da artista visual Isabela Molinari começam em 4 de agosto.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ceramica-isabela.vercel.app"),
  title: "Turmas de cerâmica · Isabela Molinari · Pinheiros, SP",
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Cerâmica com Isabela Molinari",
    title: "Turmas de cerâmica · Isabela Molinari",
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
    title: "Turmas de cerâmica · Isabela Molinari",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
