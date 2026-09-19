import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagem Docker enxuta: o build emite .next/standalone com um server.js e
  // só as dependências que ele usa. Sem isto a imagem carregaria node_modules
  // inteiro. Ver Dockerfile.
  output: "standalone",

  // O `sharp` é `require`ado em runtime pelo otimizador de imagem do Next, e o
  // rastreamento do standalone não seguia até ele nem até os binários nativos
  // por plataforma (`@img/sharp-linuxmusl-*`, porque a base é alpine/musl).
  // Resultado: em produção o otimizador caía de volta para a imagem original,
  // com AVIF configurado logo abaixo e nenhum AVIF sendo gerado. Sem isto o
  // upload de imagem do painel também não teria como gerar derivadas.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/sharp/**", "./node_modules/@img/**"],
  },

  images: {
    // AVIF antes de WebP: melhor qualidade por byte, preserva a nitidez das fotos.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
