import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF antes de WebP: melhor qualidade por byte, preserva a nitidez das fotos.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
