import Link from "next/link";
import { exigirSessao } from "@/lib/auth";
import { listarPaginas } from "@/lib/paginas";
import { apagarPagina } from "@/app/painel/acoes-conteudo";
import { NovaPagina } from "./nova";

export const dynamic = "force-dynamic";

export default async function Paginas() {
  await exigirSessao();
  const paginas = await listarPaginas();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="versalete font-display text-xl text-vermelho">
            Criar uma página
          </h2>
          <p className="mt-1 text-[0.85rem] text-grafite/75">
            Para um evento, um workshop, uma exposição — o que você quiser
            anunciar sem depender de ninguém.
          </p>
        </div>
        <NovaPagina />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="versalete font-display text-xl text-vermelho">
          Suas páginas
        </h2>

        {paginas.length === 0 ? (
          <p className="border border-linha bg-branco p-8 text-center text-grafite/70">
            Nenhuma ainda.
          </p>
        ) : (
          <ul className="divide-y divide-linha border border-linha bg-branco">
            {paginas.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-preto">{p.titulo}</p>
                  <p className="text-[0.8rem] text-grafite/70">
                    /{p.slug} · {p.blocos} {p.blocos === 1 ? "bloco" : "blocos"}
                    {p.noMenu ? " · no menu" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`versalete-larga px-2.5 py-1 text-[0.58rem] ${
                      p.publicada
                        ? "bg-verde text-branco"
                        : "border border-linha text-preto/55"
                    }`}
                  >
                    {p.publicada ? "no ar" : "rascunho"}
                  </span>
                  {p.publicada ? (
                    <a
                      href={`/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="versalete-larga text-[0.6rem] text-preto/55 underline underline-offset-4 hover:text-vermelho"
                    >
                      Ver
                    </a>
                  ) : null}
                  <Link
                    href={`/painel/paginas/${p.id}`}
                    className="versalete-larga text-[0.6rem] text-vermelho underline underline-offset-4"
                  >
                    Editar
                  </Link>
                  <form action={apagarPagina}>
                    <input type="hidden" name="paginaId" value={p.id} />
                    <button
                      type="submit"
                      className="versalete-larga text-[0.6rem] text-preto/45 underline underline-offset-4 hover:text-vermelho"
                    >
                      Apagar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
