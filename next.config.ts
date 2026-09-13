import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagem Docker enxuta: o build emite .next/standalone com um server.js e
  // só as dependências que ele usa. Sem isto a imagem carregaria node_modules
  // inteiro. Ver Dockerfile.
  output: "standalone",
  images: {
    // AVIF antes de WebP: melhor qualidade por byte, preserva a nitidez das fotos.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
