// Redimensiona e otimiza as fotos-fonte para dentro do projeto.
// Fonte: fotos-fonte/ (na raiz do projeto). Saída: assets/fotos + public/og.jpg
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("fotos-fonte");
const OUT = path.resolve("assets/fotos");
const PUB = path.resolve("public");

// arquivo-fonte -> nome de saída, largura-alvo, qualidade.
// Alvos generosos de propósito: com withoutEnlargement, arquivos pequenos não
// sofrem upscale — mas quando chegar um original em alta, a nitidez é preservada.
const MAP = [
  { src: "image.png", out: "hero.jpg", w: 2600, q: 90 },   // Foto 1 - hero (mesa coletiva)
  { src: "05.png", out: "sobre.jpg", w: 1800, q: 90 },     // Foto 3 - sobre o curso
  { src: "02.png", out: "incluso.jpg", w: 1800, q: 90 },   // Foto 4 - o que esta incluso
  { src: "06.png", out: "isabela.jpg", w: 1800, q: 90 },   // Foto 2 - quem conduz
  { src: "04.png", out: "quebra.jpg", w: 2000, q: 90 },    // Foto 5 - quebra full-bleed (engobe)
  { src: "01.png", out: "prova.jpg", w: 2400, q: 90 },     // Foto 6 - prova social full-bleed (grupo)
];

await mkdir(OUT, { recursive: true });

for (const { src, out, w, q } of MAP) {
  const input = path.join(SRC, src);
  const meta = await sharp(input).metadata();
  const upscale = meta.width < w;
  const info = await sharp(input)
    .rotate()
    .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
    .jpeg({ quality: q, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(OUT, out));
  console.log(
    `${src.padEnd(11)} -> assets/fotos/${out.padEnd(12)} ${info.width}x${info.height}  ${(info.size / 1024) | 0}KB` +
      (upscale ? `  ⚠ fonte só ${meta.width}px de largura` : "")
  );
}

// OG image: recorte 1200x630 a partir do hero (Foto 1)
const og = await sharp(path.join(SRC, "image.png"))
  .rotate()
  .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
  .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(path.join(PUB, "og.jpg"));
console.log(`og           -> public/og.jpg      ${og.width}x${og.height}  ${(og.size / 1024) | 0}KB`);
