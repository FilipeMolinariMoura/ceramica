import Image from "next/image";
import { exigirSessao } from "@/lib/auth";
import { listarMidias, midiasDasSecoes, urlDaMidia } from "@/lib/midias";
import { VAGAS } from "@/lib/secoes-de-foto";
import {
  definirFotoDaSecao,
  removerFoto,
  tirarFotoDaSecao,
} from "@/app/painel/acoes-conteudo";
import { FormularioUpload } from "./formulario-upload";

export const dynamic = "force-dynamic";

export default async function Fotos() {
  await exigirSessao();

  const [biblioteca, porSecao] = await Promise.all([
    listarMidias(),
    midiasDasSecoes(VAGAS.map((v) => v.chave)),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="versalete font-display text-xl text-vermelho">
            Subir uma foto
          </h2>
          <p className="mt-1 text-[0.85rem] text-grafite/75">
            Tudo que você subir fica na biblioteca abaixo e pode ser usado em
            qualquer lugar do site.
          </p>
        </div>
        <FormularioUpload />
      </section>

      {/* ── As vagas do site ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="versalete font-display text-xl text-vermelho">
            Onde cada foto aparece
          </h2>
          <p className="mt-1 text-[0.85rem] text-grafite/75">
            Enquanto você não escolher, vale a foto que já está no site.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {VAGAS.map((vaga) => {
            const atuais = porSecao.get(vaga.chave) ?? [];
            return (
              <div key={vaga.chave} className="border border-linha bg-branco p-5">
                <p className="font-medium text-preto">{vaga.nome}</p>
                <p className="mt-0.5 text-[0.8rem] text-grafite/70">{vaga.onde}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {atuais.map((m) => (
                    <div key={m.id} className="relative">
                      <Image
                        src={urlDaMidia(m.id)}
                        alt={m.alt}
                        width={96}
                        height={72}
                        className="h-[4.5rem] w-24 border border-linha object-cover"
                      />
                      <form action={tirarFotoDaSecao}>
                        <input type="hidden" name="chave" value={vaga.chave} />
                        <input type="hidden" name="midiaId" value={m.id} />
                        <button
                          type="submit"
                          aria-label={`Tirar ${m.alt} desta seção`}
                          className="absolute right-0 top-0 bg-preto/80 px-1.5 text-[0.7rem] leading-5 text-branco transition-colors hover:bg-vermelho"
                        >
                          ×
                        </button>
                      </form>
                    </div>
                  ))}

                  {atuais.length === 0 && vaga.padrao ? (
                    <div className="relative">
                      <Image
                        src={vaga.padrao.src}
                        alt={vaga.padrao.alt}
                        width={96}
                        height={72}
                        className="h-[4.5rem] w-24 border border-dashed border-linha object-cover opacity-60"
                      />
                      <span className="versalete-larga absolute inset-x-0 bottom-0 bg-preto/70 text-center text-[0.5rem] text-branco">
                        padrão
                      </span>
                    </div>
                  ) : null}
                </div>

                {biblioteca.length > 0 &&
                (vaga.maximo === 1 || atuais.length < vaga.maximo) ? (
                  <form action={definirFotoDaSecao} className="mt-4 flex gap-2">
                    <input type="hidden" name="chave" value={vaga.chave} />
                    <select
                      name="midiaId"
                      required
                      defaultValue=""
                      className="h-10 min-w-0 flex-1 border border-linha bg-branco px-2 text-[0.82rem] text-preto"
                    >
                      <option value="" disabled>
                        Escolher da biblioteca…
                      </option>
                      {biblioteca.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.alt || m.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="h-10 shrink-0 bg-vermelho px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-branco transition-colors hover:bg-vermelho-escuro"
                    >
                      {vaga.maximo === 1 ? "Usar" : "Somar"}
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Biblioteca ───────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="versalete font-display text-xl text-vermelho">
          Biblioteca
        </h2>

        {biblioteca.length === 0 ? (
          <p className="border border-linha bg-branco p-8 text-center text-grafite/70">
            Nenhuma foto ainda. Suba a primeira acima.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {biblioteca.map((m) => (
              <figure key={m.id} className="flex flex-col gap-1.5">
                <div className="relative aspect-[4/3] border border-linha">
                  <Image
                    src={urlDaMidia(m.id)}
                    alt={m.alt}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-[0.72rem] leading-snug text-grafite/70">
                  {m.alt || m.nome}
                </figcaption>
                <form action={removerFoto}>
                  <input type="hidden" name="midiaId" value={m.id} />
                  <button
                    type="submit"
                    className="versalete-larga text-[0.58rem] text-preto/45 underline underline-offset-4 transition-colors hover:text-vermelho"
                  >
                    Apagar
                  </button>
                </form>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
