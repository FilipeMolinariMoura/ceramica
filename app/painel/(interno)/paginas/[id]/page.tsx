import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { TIPOS_DE_BLOCO, type Bloco } from "@/lib/paginas";
import { listarMidias, urlDaMidia } from "@/lib/midias";
import {
  acrescentarBloco,
  apagarBloco,
  moverBloco,
  salvarBloco,
  salvarPagina,
} from "@/app/painel/acoes-conteudo";

export const dynamic = "force-dynamic";

/**
 * O construtor de páginas.
 *
 * Um formulário por bloco, com `action` de Server Action e sem estado de
 * cliente nenhum: salvar um bloco é um POST que revalida a página. Não é
 * elegante como um editor de arrastar, e é o que funciona sem carregar um
 * editor inteiro no navegador de quem vai usar isto do celular, sentada no
 * ateliê.
 */
export default async function EditarPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirSessao();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const { rows } = await db().query(
    `select id, slug, titulo, descricao_seo, publicada, no_menu
       from paginas where id = $1`,
    [id]
  );
  const pagina = rows[0];
  if (!pagina) notFound();

  const [{ rows: blocos }, biblioteca] = await Promise.all([
    db().query(`select id, tipo, ordem, dados from blocos
                 where pagina_id = $1 order by ordem, id`, [id]),
    listarMidias(100),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/painel/paginas"
        className="versalete-larga w-fit text-[0.6rem] text-preto/55 underline underline-offset-4 hover:text-vermelho"
      >
        ← Todas as páginas
      </Link>

      {/* ── Ajustes da página ────────────────────────────────────────── */}
      <form action={salvarPagina} className="border border-linha bg-branco p-6">
        <input type="hidden" name="paginaId" value={pagina.id} />
        <h2 className="versalete font-display text-xl text-vermelho">
          {pagina.titulo}
        </h2>
        <p className="mt-1 text-[0.8rem] text-grafite/70">/{pagina.slug}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">Título</span>
            <input
              name="titulo"
              defaultValue={pagina.titulo}
              className="h-11 border border-linha bg-branco px-3 text-[0.9rem]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">
              Descrição para o Google
            </span>
            <input
              name="descricao"
              defaultValue={pagina.descricao_seo ?? ""}
              className="h-11 border border-linha bg-branco px-3 text-[0.9rem]"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-[0.88rem]">
            <input type="checkbox" name="publicada" defaultChecked={pagina.publicada} />
            No ar
          </label>
          <label className="flex items-center gap-2 text-[0.88rem]">
            <input type="checkbox" name="no_menu" defaultChecked={pagina.no_menu} />
            Mostrar no menu do site
          </label>
          <button
            type="submit"
            className="h-10 bg-vermelho px-5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-branco transition-colors hover:bg-vermelho-escuro"
          >
            Salvar
          </button>
        </div>
      </form>

      {/* ── Blocos ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="versalete font-display text-xl text-vermelho">
          Blocos da página
        </h2>

        {blocos.length === 0 ? (
          <p className="border border-linha bg-branco p-8 text-center text-grafite/70">
            Página vazia. Acrescente o primeiro bloco abaixo.
          </p>
        ) : null}

        {(blocos as Bloco[]).map((bloco, i) => {
          const def = TIPOS_DE_BLOCO.find((t) => t.tipo === bloco.tipo);
          if (!def) return null;
          const dados = bloco.dados ?? {};

          return (
            <div key={bloco.id} className="border border-linha bg-branco p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="versalete-larga text-[0.62rem] text-preto/55">
                  {i + 1}. {def.nome}
                </p>
                <div className="flex items-center gap-3">
                  {i > 0 ? (
                    <form action={moverBloco}>
                      <input type="hidden" name="blocoId" value={bloco.id} />
                      <input type="hidden" name="direcao" value="cima" />
                      <button type="submit" aria-label="Mover para cima"
                        className="text-[0.9rem] text-preto/50 hover:text-vermelho">↑</button>
                    </form>
                  ) : null}
                  {i < blocos.length - 1 ? (
                    <form action={moverBloco}>
                      <input type="hidden" name="blocoId" value={bloco.id} />
                      <input type="hidden" name="direcao" value="baixo" />
                      <button type="submit" aria-label="Mover para baixo"
                        className="text-[0.9rem] text-preto/50 hover:text-vermelho">↓</button>
                    </form>
                  ) : null}
                  <form action={apagarBloco}>
                    <input type="hidden" name="blocoId" value={bloco.id} />
                    <button type="submit"
                      className="versalete-larga text-[0.58rem] text-preto/45 underline underline-offset-4 hover:text-vermelho">
                      Apagar
                    </button>
                  </form>
                </div>
              </div>

              {def.campos.length === 0 ? (
                <p className="mt-3 text-[0.85rem] text-grafite/70">{def.descricao}</p>
              ) : (
                <form action={salvarBloco} className="mt-4 grid gap-4">
                  <input type="hidden" name="blocoId" value={bloco.id} />
                  {def.campos.map((campo) => (
                    <label key={campo.nome} className="grid gap-1.5">
                      <span className="versalete-larga text-[0.6rem] text-preto/50">
                        {campo.rotulo}
                      </span>

                      {campo.formato === "texto" ? (
                        <textarea
                          name={campo.nome}
                          rows={4}
                          defaultValue={dados[campo.nome] ?? ""}
                          className="w-full border border-linha bg-branco px-3 py-2.5 text-[0.9rem]"
                        />
                      ) : campo.formato === "foto" ? (
                        <div className="flex items-center gap-3">
                          {dados[campo.nome] ? (
                            <Image
                              src={urlDaMidia(dados[campo.nome])}
                              alt=""
                              width={80}
                              height={60}
                              className="h-[3.75rem] w-20 border border-linha object-cover"
                            />
                          ) : null}
                          <select
                            name={campo.nome}
                            defaultValue={dados[campo.nome] ?? ""}
                            className="h-11 min-w-0 flex-1 border border-linha bg-branco px-3 text-[0.9rem]"
                          >
                            <option value="">Sem foto</option>
                            {biblioteca.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.alt || m.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <input
                          name={campo.nome}
                          defaultValue={dados[campo.nome] ?? ""}
                          className="h-11 border border-linha bg-branco px-3 text-[0.9rem]"
                        />
                      )}

                      {campo.dica ? (
                        <span className="text-[0.75rem] text-grafite/60">{campo.dica}</span>
                      ) : null}
                    </label>
                  ))}
                  <button
                    type="submit"
                    className="h-10 w-fit bg-vermelho px-5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-branco transition-colors hover:bg-vermelho-escuro"
                  >
                    Salvar bloco
                  </button>
                </form>
              )}
            </div>
          );
        })}

        <div className="border border-dashed border-linha bg-branco p-5">
          <p className="versalete-larga mb-3 text-[0.62rem] text-preto/55">
            Acrescentar bloco
          </p>
          <div className="flex flex-wrap gap-2">
            {TIPOS_DE_BLOCO.map((t) => (
              <form key={t.tipo} action={acrescentarBloco}>
                <input type="hidden" name="paginaId" value={pagina.id} />
                <input type="hidden" name="tipo" value={t.tipo} />
                <button
                  type="submit"
                  title={t.descricao}
                  className="border border-linha px-3.5 py-2 text-[0.8rem] text-preto transition-colors hover:border-vermelho hover:text-vermelho"
                >
                  + {t.nome}
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
