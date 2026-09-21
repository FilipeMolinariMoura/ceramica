import "server-only";
import { db } from "@/lib/db";
import { NAV } from "@/lib/constants";

/**
 * Páginas montadas pela Isabela, e os blocos que ela pode usar.
 *
 * ── Por que os tipos de bloco moram em código ─────────────────────────────
 * Porque cada tipo tem um COMPONENTE que o desenha. Um tipo declarado só no
 * banco seria um bloco que nada sabe renderizar. Esta lista é o contrato
 * entre o painel (que gera o formulário) e a página pública (que desenha), e
 * é ela também que peneira o que entra no jsonb.
 */

/** Endereços que já são do site. Ver o comentário em `criarPagina`. */
export const SLUGS_RESERVADOS = new Set<string>([
  ...NAV.map((n) => n.href.replace("/", "")),
  /* Rotas REAIS que não estão na barra.
     `aulas` e `oficinas` saíram da NAV quando viraram os dois cliques de
     dentro de `/ceramica` — mas continuam existindo. Sem esta linha a Isabela
     poderia publicar uma página com um desses endereços: o construtor
     aceitaria, e ela veria a página antiga no lugar da dela, sem entender por
     quê. Derivar a lista só da NAV era seguro enquanto NAV e rotas coincidiam. */
  "aulas",
  "oficinas",
  "painel",
  "api",
  "midias",
  "_next",
  "encomendas",
  "favicon.ico",
  "icon.svg",
  "apple-icon.png",
  "og.jpg",
  "robots.txt",
  "sitemap.xml",
]);

/**
 * Minúsculas, números e hífen. O regex não é capricho: ele também barra `..`,
 * maiúsculas e homóglifos unicode, que o índice único sozinho não pega.
 */
export const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CampoDeBloco = {
  nome: string;
  rotulo: string;
  /** `linha` = input; `texto` = textarea; `foto` = escolher da biblioteca. */
  formato: "linha" | "texto" | "foto";
  maximo?: number;
  dica?: string;
};

export type TipoDeBloco = {
  tipo: string;
  nome: string;
  descricao: string;
  campos: CampoDeBloco[];
};

export const TIPOS_DE_BLOCO: TipoDeBloco[] = [
  {
    tipo: "titulo",
    nome: "Título",
    descricao: "Um título grande em vermelho, centrado, com uma linha embaixo.",
    campos: [
      { nome: "titulo", rotulo: "Título", formato: "linha", maximo: 120 },
      { nome: "subtitulo", rotulo: "Linha de apoio", formato: "linha", maximo: 200 },
    ],
  },
  {
    tipo: "texto",
    nome: "Texto",
    descricao: "Um ou mais parágrafos. Linha em branco separa parágrafo.",
    campos: [
      { nome: "corpo", rotulo: "Texto", formato: "texto", maximo: 4000 },
    ],
  },
  {
    tipo: "foto",
    nome: "Foto",
    descricao: "Uma foto larga, da sua biblioteca.",
    campos: [
      { nome: "midiaId", rotulo: "Foto", formato: "foto" },
      { nome: "legenda", rotulo: "Legenda", formato: "linha", maximo: 200 },
    ],
  },
  {
    tipo: "foto-texto",
    nome: "Foto e texto",
    descricao: "Foto de um lado, texto do outro.",
    campos: [
      { nome: "midiaId", rotulo: "Foto", formato: "foto" },
      { nome: "titulo", rotulo: "Título", formato: "linha", maximo: 120 },
      { nome: "corpo", rotulo: "Texto", formato: "texto", maximo: 2000 },
    ],
  },
  {
    tipo: "lista",
    nome: "Lista",
    descricao: "Itens um por linha, com marcador vermelho.",
    campos: [
      { nome: "titulo", rotulo: "Título", formato: "linha", maximo: 120 },
      {
        nome: "itens",
        rotulo: "Itens",
        formato: "texto",
        maximo: 2000,
        dica: "Um por linha.",
      },
    ],
  },
  {
    tipo: "cta",
    nome: "Chamada",
    descricao: "Faixa colorida com uma frase e um botão.",
    campos: [
      { nome: "titulo", rotulo: "Frase", formato: "linha", maximo: 160 },
      { nome: "botao", rotulo: "Texto do botão", formato: "linha", maximo: 40 },
      {
        nome: "destino",
        rotulo: "Para onde vai",
        formato: "linha",
        maximo: 300,
        dica: "Um endereço do site (/aulas) ou um link completo.",
      },
    ],
  },
  {
    tipo: "agenda",
    nome: "Agenda de aula avulsa",
    descricao: "A mesma agenda com pagamento que está na página de aulas.",
    campos: [],
  },
];

export type Bloco = {
  id: string;
  tipo: string;
  ordem: number;
  dados: Record<string, string>;
};

export type Pagina = {
  id: string;
  slug: string;
  titulo: string;
  descricaoSeo: string | null;
  publicada: boolean;
  noMenu: boolean;
  blocos: Bloco[];
};

export async function paginaPorSlug(
  slug: string,
  opcoes: { incluirRascunho?: boolean } = {}
): Promise<Pagina | null> {
  const { rows } = await db().query(
    `select id, slug, titulo, descricao_seo, publicada, no_menu
       from paginas where lower(slug) = lower($1)`,
    [slug]
  );
  const p = rows[0];
  if (!p) return null;
  if (!p.publicada && !opcoes.incluirRascunho) return null;

  const { rows: blocos } = await db().query(
    `select id, tipo, ordem, dados from blocos
      where pagina_id = $1 order by ordem, id`,
    [p.id]
  );

  return {
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    descricaoSeo: p.descricao_seo,
    publicada: p.publicada,
    noMenu: p.no_menu,
    blocos: blocos as Bloco[],
  };
}

export async function listarPaginas(): Promise<
  { id: string; slug: string; titulo: string; publicada: boolean; noMenu: boolean; blocos: number }[]
> {
  const { rows } = await db().query(
    `select p.id, p.slug, p.titulo, p.publicada, p.no_menu,
            (select count(*)::int from blocos b where b.pagina_id = p.id) as blocos
       from paginas p order by p.ordem, p.criada_em desc`
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    titulo: r.titulo,
    publicada: r.publicada,
    noMenu: r.no_menu,
    blocos: r.blocos,
  }));
}

/** As páginas dela que pediram para aparecer no menu do site. */
export async function paginasDoMenu(): Promise<{ slug: string; titulo: string }[]> {
  const { rows } = await db().query(
    `select slug, titulo from paginas
      where publicada and no_menu order by ordem, titulo`
  );
  return rows as { slug: string; titulo: string }[];
}
