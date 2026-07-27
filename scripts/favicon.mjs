// Gera favicon.ico (PNG-in-ICO 16/32/48) e apple-icon.png a partir de app/icon.svg.
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const svg = await readFile(path.resolve("app/icon.svg"));

// Apple touch icon (iOS arredonda sozinho).
await sharp(svg).resize(180, 180).png().toFile(path.resolve("app/apple-icon.png"));

// Preview grande só para conferência visual (não versionado).
await sharp(svg).resize(256, 256).png().toFile(path.resolve("scripts/_favicon-preview.png"));

// favicon.ico multi-resolução com PNGs embutidos.
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(svg).resize(s, s).png().toBuffer())
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reservado
header.writeUInt16LE(1, 2); // tipo: ícone
header.writeUInt16LE(sizes.length, 4);

const entries = [];
let offset = 6 + sizes.length * 16;
sizes.forEach((s, i) => {
  const data = pngs[i];
  const e = Buffer.alloc(16);
  e.writeUInt8(s >= 256 ? 0 : s, 0); // largura
  e.writeUInt8(s >= 256 ? 0 : s, 1); // altura
  e.writeUInt8(0, 2); // paleta
  e.writeUInt8(0, 3); // reservado
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bits por pixel
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  entries.push(e);
});

await writeFile(
  path.resolve("app/favicon.ico"),
  Buffer.concat([header, ...entries, ...pngs])
);

console.log("app/favicon.ico + app/apple-icon.png gerados");
