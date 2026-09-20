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

    // A partir do Next 16 toda `quality` usada precisa estar declarada aqui —
    // qualquer valor fora da lista deixa de ser servido. O dev já avisa a cada
    // requisição. Esta é a lista exata do que o site pede hoje:
    //
    //   80  a risografia dos prints, que é tramada e perdoa compressão
    //   84  as vistas de exposição, pequenas na grade
    //   85  a faixa do ateliê
    //   86  as portas do catálogo
    //   88  o padrão das fotos de seção e das fichas do acervo
    //   90  fotos grandes de página
    //   92  as duas obras de abertura, que ocupam meia tela
    //
    // Se um componente novo pedir outro número, ou ele entra aqui ou usa um
    // destes. Escalonar de 5 em 5 não valeria o cache extra.
    qualities: [80, 84, 85, 86, 88, 90, 92],
  },
};

export default nextConfig;
