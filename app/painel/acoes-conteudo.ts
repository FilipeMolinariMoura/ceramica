"use server";

import { revalidatePath } from "next/cache";
import { db, emTransacao } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { apagarMidia, guardarMidia } from "@/lib/midias";
import { VAGA_POR_CHAVE } from "@/lib/secoes-de-foto";
import { SLUGS_RESERVADOS, SLUG_VALIDO, TIPOS_DE_BLOCO } from "@/lib/paginas";

/**
 * Fotos e páginas.
 *
 * Como em `acoes.ts`: TODA ação começa com `exigirSessao()`. Server Action é
 * endpoint POST próprio e não passa pelo middleware — esquecer a linha numa
 * única ação abre aquela ação para o mundo.
 */

/* ── Fotos ─────────────────────────────────────────────────────────────── */

const ERRO_UPLOAD: Record<string, string> = {
  tipo: "Formato não aceito. Use JPG, PNG, WebP ou AVIF.",
  tamanho: "Arquivo grande demais. O limite é 12 MB.",
  ilegivel: "Não consegui ler esse arquivo como imagem.",
  disco: "Não consegui guardar o arquivo. Tente de novo.",
};

export async function subirFoto(
  _anterior: { erro?: string; ok?: boolean } | null,
  form: FormData
): Promise<{ erro?: string; ok?: boolean }> {
  await exigirSessao();

  const arquivo = form.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha um arquivo." };
  }

  const alt = String(form.get("alt") ?? "").trim();
  if (alt.length < 4) {
    // Não é burocracia: sem descrição, quem usa leitor de tela não faz ideia
    // do que está na página, e o Google também não.
    return { erro: "Escreva uma descrição curta da foto (o texto alternativo)." };
  }

  const r = await guardarMidia(arquivo, alt);
  if (!r.ok) return { erro: ERRO_UPLOAD[r.motivo] ?? "Não consegui subir a foto." };

  revalidatePath("/painel/fotos");
  return { ok: true };
}

export async function removerFoto(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("midiaId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  await apagarMidia(id);
  revalidatePath("/painel/fotos");
  revalidatePath("/", "layout");
}

/** Põe (ou troca) a foto de uma vaga do site. */
export async function definirFotoDaSecao(form: FormData): Promise<void> {
  await exigirSessao();

  const chave = String(form.get("chave") ?? "");
  const midiaId = String(form.get("midiaId") ?? "");
  const vaga = VAGA_POR_CHAVE.get(chave);

  // A chave tem de ser uma vaga DECLARADA. Sem isso, um POST direto plantaria
  // linhas com chave inventada que nada renderiza — lixo silencioso no banco.
  if (!vaga) return;
  if (!/^[0-9a-f-]{36}$/.test(midiaId)) return;

  await emTransacao(async (cx) => {
    if (vaga.maximo === 1) {
      await cx.query(`delete from secao_midias where chave = $1`, [chave]);
    }
    await cx.query(
      `insert into secao_midias (chave, midia_id, ordem)
       values ($1, $2, coalesce(
         (select max(ordem) + 1 from secao_midias where chave = $1), 0))
       on conflict (chave, midia_id) do nothing`,
      [chave, midiaId]
    );
    // Galeria com teto: remove as mais antigas que passarem do limite.
    if (vaga.maximo > 1) {
      await cx.query(
        `delete from secao_midias
          where chave = $1 and midia_id in (
            select midia_id from secao_midias where chave = $1
             order by ordem, posta_em offset $2)`,
        [chave, vaga.maximo]
      );
    }
  });

  revalidatePath("/painel/fotos");
  revalidatePath("/", "layout");
}

export async function tirarFotoDaSecao(form: FormData): Promise<void> {
  await exigirSessao();
  const chave = String(form.get("chave") ?? "");
  const midiaId = String(form.get("midiaId") ?? "");
  if (!VAGA_POR_CHAVE.has(chave) || !/^[0-9a-f-]{36}$/.test(midiaId)) return;
  await db().query(
    `delete from secao_midias where chave = $1 and midia_id = $2`,
    [chave, midiaId]
  );
  revalidatePath("/painel/fotos");
  revalidatePath("/", "layout");
}

/* ── Páginas ───────────────────────────────────────────────────────────── */

export async function criarPagina(
  _anterior: { erro?: string } | null,
  form: FormData
): Promise<{ erro?: string }> {
  await exigirSessao();

  const titulo = String(form.get("titulo") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();

  if (titulo.length < 2) return { erro: "Dê um título à página." };
  if (!SLUG_VALIDO.test(slug)) {
    return { erro: "O endereço só aceita letras minúsculas, números e hífen." };
  }
  if (SLUGS_RESERVADOS.has(slug)) {
    // Sem isto ela cria a página "obras", publica, abre /obras e vê a página
    // antiga: no App Router a rota de arquivo vence a dinâmica. Nada quebra e
    // nada avisa — ela conclui que o site está com defeito.
    return { erro: `"${slug}" já é um endereço do site. Escolha outro.` };
  }

  try {
    const { rows } = await db().query(
      `insert into paginas (slug, titulo) values ($1, $2) returning id`,
      [slug, titulo]
    );
    revalidatePath("/painel/paginas");
    return { erro: undefined, ...(rows[0] as object) };
  } catch (err) {
    if (typeof err === "object" && err && "code" in err && err.code === "23505") {
      return { erro: "Já existe uma página com esse endereço." };
    }
    throw err;
  }
}

export async function salvarPagina(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("paginaId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  await db().query(
    `update paginas
        set titulo = $2,
            descricao_seo = nullif($3, ''),
            publicada = $4,
            no_menu = $5,
            atualizada_em = now()
      where id = $1`,
    [
      id,
      String(form.get("titulo") ?? "").trim().slice(0, 160),
      String(form.get("descricao") ?? "").trim().slice(0, 300),
      form.get("publicada") === "on",
      form.get("no_menu") === "on",
    ]
  );

  revalidatePath("/painel/paginas");
  revalidatePath("/", "layout");
}

export async function apagarPagina(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("paginaId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  await db().query(`delete from paginas where id = $1`, [id]);
  revalidatePath("/painel/paginas");
  revalidatePath("/", "layout");
}

/* ── Blocos ────────────────────────────────────────────────────────────── */

export async function acrescentarBloco(form: FormData): Promise<void> {
  await exigirSessao();
  const paginaId = String(form.get("paginaId") ?? "");
  const tipo = String(form.get("tipo") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(paginaId)) return;
  if (!TIPOS_DE_BLOCO.some((t) => t.tipo === tipo)) return;

  await db().query(
    `insert into blocos (pagina_id, tipo, ordem, dados)
     values ($1, $2, coalesce(
       (select max(ordem) + 1 from blocos where pagina_id = $1), 0), '{}'::jsonb)`,
    [paginaId, tipo]
  );
  revalidatePath("/painel/paginas");
}

export async function salvarBloco(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("blocoId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  const { rows } = await db().query(`select tipo from blocos where id = $1`, [id]);
  const def = TIPOS_DE_BLOCO.find((t) => t.tipo === rows[0]?.tipo);
  if (!def) return;

  // Só os campos DECLARADOS do tipo entram no jsonb. Sem esta peneira, um
  // POST direto plantaria chaves arbitrárias no dado que a página pública
  // renderiza.
  const dados: Record<string, string> = {};
  for (const campo of def.campos) {
    const v = form.get(campo.nome);
    dados[campo.nome] = typeof v === "string" ? v.slice(0, campo.maximo ?? 2000) : "";
  }

  await db().query(
    `update blocos set dados = $2::jsonb where id = $1`,
    [id, JSON.stringify(dados)]
  );
  await db().query(
    `update paginas set atualizada_em = now()
      where id = (select pagina_id from blocos where id = $1)`,
    [id]
  );
  revalidatePath("/painel/paginas");
  revalidatePath("/", "layout");
}

export async function moverBloco(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("blocoId") ?? "");
  const direcao = String(form.get("direcao") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !["cima", "baixo"].includes(direcao)) return;

  // Troca a ordem com o vizinho, num statement só.
  await db().query(
    `with atual as (select id, pagina_id, ordem from blocos where id = $1),
          vizinho as (
            select b.id, b.ordem from blocos b, atual a
             where b.pagina_id = a.pagina_id
               and ($2 = 'cima' and b.ordem < a.ordem or $2 = 'baixo' and b.ordem > a.ordem)
             order by case when $2 = 'cima' then -b.ordem else b.ordem end
             limit 1)
     update blocos b
        set ordem = case when b.id = (select id from atual) then (select ordem from vizinho)
                         else (select ordem from atual) end
       from atual a, vizinho v
      where b.id in (a.id, v.id)`,
    [id, direcao]
  );
  revalidatePath("/painel/paginas");
  revalidatePath("/", "layout");
}

export async function apagarBloco(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("blocoId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  await db().query(`delete from blocos where id = $1`, [id]);
  revalidatePath("/painel/paginas");
  revalidatePath("/", "layout");
}
