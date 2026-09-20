import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { db } from "@/lib/db";

/**
 * Fotos que a Isabela sobe pelo painel.
 *
 * ── Onde os arquivos moram ────────────────────────────────────────────────
 * Num volume Docker, não em `public/`: a imagem do contêiner é imutável e
 * `public/` não é gravável em produção. Em desenvolvimento cai em `.midias/`
 * na raiz do projeto, que está no `.gitignore`.
 *
 * ── A regra que impede travessia de caminho ───────────────────────────────
 * O nome do arquivo é GERADO por nós (uuid + extensão) e guardado no banco.
 * Para servir uma foto, buscamos a LINHA pelo id e montamos o caminho a
 * partir do que está nela. Nada que chega pela rede é concatenado a um
 * caminho — nem sanitizado, nem validado: simplesmente não é usado. Sanitizar
 * `..%2f` é uma corrida que se perde uma hora; não concatenar não tem como
 * dar errado.
 */

const TIPOS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

/** 12 MB: foto de celular moderna cabe, e um upload acidental de vídeo não. */
export const LIMITE_BYTES = 12 * 1024 * 1024;

export function pastaDeMidias(): string {
  return process.env.MIDIAS_DIR ?? (process.env.NODE_ENV === "production" ? "/dados/midias" : ".midias");
}

export type Midia = {
  id: string;
  arquivo: string;
  nome: string;
  alt: string;
  largura: number;
  altura: number;
};

export type FalhaUpload = "tipo" | "tamanho" | "ilegivel" | "disco";

export async function guardarMidia(
  arquivo: File,
  alt: string
): Promise<{ ok: true; midia: Midia } | { ok: false; motivo: FalhaUpload }> {
  const ext = TIPOS.get(arquivo.type);
  if (!ext) return { ok: false, motivo: "tipo" };
  if (arquivo.size > LIMITE_BYTES) return { ok: false, motivo: "tamanho" };

  const bytes = Buffer.from(await arquivo.arrayBuffer());

  // O `sharp` decodifica de verdade. Um arquivo que se diz PNG no cabeçalho
  // HTTP mas não é uma imagem morre aqui, antes de tocar o disco.
  let processada: Buffer;
  let largura = 0;
  let altura = 0;
  try {
    const img = sharp(bytes, { failOn: "error" }).rotate(); // rotate() aplica o EXIF
    const meta = await img.metadata();
    if (!meta.width || !meta.height) return { ok: false, motivo: "ilegivel" };

    // Reencoda sempre. Além de reduzir peso, isso descarta metadados EXIF —
    // inclusive a geolocalização que o celular grava na foto, que não tem por
    // que ir para a internet junto com uma peça de cerâmica.
    processada = await img
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const depois = await sharp(processada).metadata();
    largura = depois.width ?? meta.width;
    altura = depois.height ?? meta.height;
  } catch {
    return { ok: false, motivo: "ilegivel" };
  }

  const nomeNoDisco = `${randomUUID()}.webp`;
  try {
    const pasta = pastaDeMidias();
    await mkdir(pasta, { recursive: true });
    await writeFile(join(pasta, nomeNoDisco), processada);
  } catch (err) {
    console.error("[midias] falha ao gravar no disco:", err);
    return { ok: false, motivo: "disco" };
  }

  const { rows } = await db().query(
    `insert into midias (arquivo, nome, alt, largura, altura, tipo, bytes)
     values ($1, $2, $3, $4, $5, 'image/webp', $6)
     returning id, arquivo, nome, alt, largura, altura`,
    [nomeNoDisco, arquivo.name.slice(0, 160), alt.slice(0, 300), largura, altura, processada.length]
  );

  return { ok: true, midia: rows[0] as Midia };
}

/** Lê o arquivo de uma mídia. O caminho vem da LINHA, nunca da requisição. */
export async function lerArquivoDaMidia(
  id: string
): Promise<{ bytes: Buffer; tipo: string } | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;

  const { rows } = await db().query(
    `select arquivo, tipo from midias where id = $1`,
    [id]
  );
  if (!rows[0]) return null;

  try {
    const bytes = await readFile(join(pastaDeMidias(), rows[0].arquivo));
    return { bytes, tipo: rows[0].tipo };
  } catch {
    return null;
  }
}

export async function apagarMidia(id: string): Promise<void> {
  const { rows } = await db().query(
    `delete from midias where id = $1 returning arquivo`,
    [id]
  );
  if (!rows[0]) return;
  // O arquivo some depois da linha: sobrar arquivo órfão no disco é barato,
  // sobrar linha apontando para arquivo inexistente quebra a página.
  await unlink(join(pastaDeMidias(), rows[0].arquivo)).catch(() => {});
}

export async function listarMidias(limite = 200): Promise<Midia[]> {
  const { rows } = await db().query(
    `select id, arquivo, nome, alt, largura, altura
       from midias order by criada_em desc limit $1`,
    [limite]
  );
  return rows as Midia[];
}

/* ── Fotos por seção ───────────────────────────────────────────────────── */

export async function midiasDaSecao(chave: string): Promise<Midia[]> {
  const { rows } = await db().query(
    `select m.id, m.arquivo, m.nome, m.alt, m.largura, m.altura
       from secao_midias s join midias m on m.id = s.midia_id
      where s.chave = $1
      order by s.ordem, s.posta_em`,
    [chave]
  );
  return rows as Midia[];
}

/** Lê várias vagas de uma vez — uma página costuma precisar de três ou quatro. */
export async function midiasDasSecoes(
  chaves: string[]
): Promise<Map<string, Midia[]>> {
  if (chaves.length === 0) return new Map();
  const { rows } = await db().query(
    `select s.chave, m.id, m.arquivo, m.nome, m.alt, m.largura, m.altura
       from secao_midias s join midias m on m.id = s.midia_id
      where s.chave = any($1::text[])
      order by s.chave, s.ordem, s.posta_em`,
    [chaves]
  );
  const mapa = new Map<string, Midia[]>();
  for (const r of rows) {
    const lista = mapa.get(r.chave) ?? [];
    lista.push(r as Midia);
    mapa.set(r.chave, lista);
  }
  return mapa;
}

export function urlDaMidia(id: string): string {
  return `/midias/${id}`;
}
