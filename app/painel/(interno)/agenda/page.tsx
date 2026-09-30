import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import {
  chaveDia,
  diaLongo,
  expirarVencidas,
  hora,
  horariosDisponiveis,
  montarPacotes,
} from "@/lib/agenda";
import { SERVICO_AULA_AVULSA, SERVICO_TURMA_MENSAL, TURMAS } from "@/lib/constants";
import {
  abrirHorario,
  abrirTercasEmLote,
  fecharHorario,
  reabrirHorario,
  salvarServico,
} from "@/app/painel/acoes";

export const dynamic = "force-dynamic";

type LinhaServico = {
  id: number;
  slug: string;
  nome: string;
  vagas_padrao: number;
  preco_centavos: number;
  preco_cartao_centavos: number | null;
  duracao_min: number;
  aulas: number;
};

type LinhaHorario = {
  id: number;
  inicio: Date;
  vagas: number;
  ocupadas: number;
  publicado: boolean;
  servico: string;
  mensal: number;
  avulsa: number;
};

const CAMPO =
  "h-11 border border-linha bg-branco px-3 text-[0.9rem] text-preto outline-none focus-visible:border-vermelho";
const ROTULO = "versalete-larga text-[0.6rem] text-preto/50";
const BOTAO =
  "h-11 bg-vermelho px-6 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-branco transition-colors hover:bg-vermelho-escuro";

const emReais = (centavos: number | null) =>
  centavos === null ? "" : (Number(centavos) / 100).toFixed(2);

export default async function Agenda() {
  await exigirSessao();
  await expirarVencidas();

  const [{ rows: servicos }, { rows: horarios }, { rows: datas }] = await Promise.all([
    db().query<LinhaServico>(
      `select id, slug, nome, vagas_padrao, preco_centavos, preco_cartao_centavos,
              duracao_min, aulas
         from servicos where ativo order by ordem, nome`
    ),
    // A composição de cada horário: quantos lugares são de mensalistas e
    // quantos de avulsos. Conta o que ocupa lugar — pendente e confirmada.
    db().query<LinhaHorario>(
      `select h.id, h.inicio, h.vagas, h.ocupadas, h.publicado, s.nome as servico,
              count(r.id) filter (where r.pacote_id is not null)::int as mensal,
              count(r.id) filter (where r.pacote_id is null)::int as avulsa
         from horarios h
         join servicos s on s.id = h.servico_id
         left join reservas r
           on r.horario_id = h.id and r.status in ('pendente', 'confirmada')
        where h.inicio > now() - interval '1 day'
        group by h.id, s.nome
        order by h.inicio
        limit 300`
    ),
    // Hoje e a próxima terça, em Brasília. Montadas no Postgres pelo mesmo
    // motivo do resto da agenda: o servidor roda em UTC.
    db().query<{ hoje: string; proxima_terca: string }>(
      `select to_char(d, 'YYYY-MM-DD') as hoje,
              to_char(d + ((9 - extract(isodow from d)::int) % 7), 'YYYY-MM-DD') as proxima_terca
         from (select (now() at time zone 'America/Sao_Paulo')::date as d) x`
    ),
  ]);

  const hoje = datas[0]?.hoje ?? chaveDia(new Date());
  const proximaTerca = datas[0]?.proxima_terca ?? hoje;

  const avulsa = servicos.find((s) => s.slug === SERVICO_AULA_AVULSA);
  const mensal = servicos.find((s) => s.slug === SERVICO_TURMA_MENSAL);

  // A mensal só vende com N terças seguidas abertas. Se uma turma não tem
  // nenhum pacote comprável, a Isabela precisa saber AQUI, antes de alguém
  // chegar no site e dar com a porta fechada.
  const semPacote: string[] = [];
  if (avulsa && mensal) {
    const agenda = await horariosDisponiveis(Number(avulsa.id), { diasAFrente: 120 });
    for (const t of TURMAS) {
      const opcoes = montarPacotes(agenda, t.id, Number(mensal.aulas));
      if (!opcoes.some((o) => o.disponivel)) semPacote.push(t.periodo.toLowerCase());
    }
  }

  const porDia = new Map<string, LinhaHorario[]>();
  for (const h of horarios) {
    const k = chaveDia(h.inicio);
    porDia.set(k, [...(porDia.get(k) ?? []), h]);
  }

  return (
    <div className="flex flex-col gap-10">
      {semPacote.length > 0 && mensal ? (
        <div className="border-l-2 border-vermelho bg-branco p-5">
          <p className="versalete font-display text-lg text-vermelho">
            A mensal está sem datas para vender
          </p>
          <p className="mt-1 text-[0.9rem] leading-relaxed text-grafite">
            Turma da {semPacote.join(" e da ")}: não há {mensal.aulas} terças
            seguidas com vaga. Abra mais semanas logo abaixo — enquanto isso, o
            site oferece a lista de espera no lugar do pagamento.
          </p>
        </div>
      ) : null}

      {/* ── Preço ────────────────────────────────────────────────────────
          Estava só na semente do banco: mudar de R$ 250 para R$ 280 exigia
          deploy. É o número mais provável de mudar no site inteiro. */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="versalete font-display text-xl text-vermelho">
            Preço e formato
          </h2>
          <p className="mt-1 text-[0.85rem] text-grafite/75">
            Muda em todo lugar do site de uma vez, inclusive o &ldquo;preço por
            aula&rdquo; da mensal. Reservas já feitas mantêm o valor que a pessoa viu.
          </p>
        </div>

        {servicos.map((sv) => {
          const ehMensal = sv.slug === SERVICO_TURMA_MENSAL;
          return (
            <form
              key={sv.id}
              action={salvarServico}
              className="grid gap-4 border border-linha bg-branco p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
            >
              <input type="hidden" name="servicoId" value={sv.id} />
              <div className="sm:pb-3">
                <p className="font-medium text-preto">{sv.nome}</p>
                {ehMensal ? (
                  <p className="text-[0.78rem] text-grafite/65">
                    Pacote de {sv.aulas} terças · R${" "}
                    {(Number(sv.preco_centavos) / Number(sv.aulas) / 100).toFixed(2).replace(".", ",")}{" "}
                    por aula no Pix
                  </p>
                ) : null}
              </div>

              <label className="grid gap-1.5">
                <span className={ROTULO}>{ehMensal ? "Pix (R$)" : "Valor (R$)"}</span>
                <input
                  name="preco"
                  inputMode="decimal"
                  defaultValue={emReais(sv.preco_centavos)}
                  className="h-11 w-28 border border-linha bg-branco px-3 text-[0.9rem]"
                />
              </label>

              {ehMensal ? (
                <label className="grid gap-1.5">
                  <span className={ROTULO}>Cartão (R$)</span>
                  <input
                    name="precoCartao"
                    inputMode="decimal"
                    defaultValue={emReais(sv.preco_cartao_centavos)}
                    className="h-11 w-28 border border-linha bg-branco px-3 text-[0.9rem]"
                  />
                </label>
              ) : (
                <label className="grid gap-1.5">
                  <span className={ROTULO}>Minutos</span>
                  <input
                    name="duracao"
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    defaultValue={sv.duracao_min}
                    className="h-11 w-24 border border-linha bg-branco px-3 text-[0.9rem]"
                  />
                </label>
              )}

              {/* Na mensal, duração e lugares não se editam aqui: a aula é a
                  mesma da avulsa, e quem tem lugares é cada terça. */}
              {ehMensal ? (
                <>
                  <input type="hidden" name="duracao" value={sv.duracao_min} />
                  <input type="hidden" name="vagas" value={sv.vagas_padrao} />
                </>
              ) : (
                <label className="grid gap-1.5">
                  <span className={ROTULO}>Vagas</span>
                  <input
                    name="vagas"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={sv.vagas_padrao}
                    className="h-11 w-20 border border-linha bg-branco px-3 text-[0.9rem]"
                  />
                </label>
              )}

              <button
                type="submit"
                className="h-11 bg-vermelho px-5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-branco transition-colors hover:bg-vermelho-escuro"
              >
                Salvar
              </button>
            </form>
          );
        })}
      </section>

      {/* ── Terças em lote ─────────────────────────────────────────────────
          O jeito normal de abrir agenda. Mensal e avulsa usam os MESMOS
          horários: cada terça tem N lugares, e quem chegar primeiro, de
          qualquer um dos dois, fica com ele. */}
      {avulsa ? (
        <section className="border border-linha bg-branco p-6">
          <h2 className="versalete font-display text-xl text-vermelho">
            Abrir terças
          </h2>
          <p className="mt-1 text-[0.85rem] text-grafite/75">
            Abre as terças das próximas semanas nos horários das turmas. Os
            lugares valem para a mensal e para a avulsa ao mesmo tempo. Terças
            que você tirou do ar continuam fora.
          </p>

          <form
            action={abrirTercasEmLote}
            className="mt-5 grid gap-4 sm:grid-cols-[auto_auto_1fr_auto_auto] sm:items-end"
          >
            <input type="hidden" name="servicoId" value={avulsa.id} />
            <label className="grid gap-1.5">
              <span className={ROTULO}>A partir de</span>
              <input type="date" name="aPartir" required min={hoje} defaultValue={proximaTerca} className={CAMPO} />
            </label>
            <label className="grid gap-1.5">
              <span className={ROTULO}>Semanas</span>
              <input type="number" name="semanas" required min={1} max={12} defaultValue={8} className={`${CAMPO} w-24`} />
            </label>
            <fieldset className="flex flex-wrap gap-4 sm:pb-3">
              <legend className={`${ROTULO} mb-1.5`}>Turmas</legend>
              {TURMAS.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-[0.9rem] text-preto">
                  <input type="checkbox" name={`turma-${t.id}`} defaultChecked className="h-4 w-4 accent-vermelho" />
                  {t.periodo} · {t.horario}
                </label>
              ))}
            </fieldset>
            <label className="grid gap-1.5">
              <span className={ROTULO}>Lugares</span>
              <input
                type="number"
                name="vagas"
                required
                min={1}
                max={20}
                defaultValue={avulsa.vagas_padrao}
                className={`${CAMPO} w-24`}
              />
            </label>
            <button type="submit" className={BOTAO}>
              Abrir
            </button>
          </form>
        </section>
      ) : null}

      <section className="border border-linha bg-branco p-6">
        <h2 className="versalete font-display text-xl text-vermelho">
          Abrir um horário avulso
        </h2>
        <p className="mt-1 text-[0.85rem] text-grafite/75">
          Para um horário fora das turmas (só aula avulsa). Horário de Brasília.
          Abrir um horário que já existe só atualiza as vagas dele.
        </p>

        <form action={abrirHorario} className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
          <label className="grid gap-1.5">
            <span className={ROTULO}>Aula</span>
            <select name="servicoId" required className={CAMPO}>
              {servicos
                .filter((s) => Number(s.aulas) === 1)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className={ROTULO}>Dia</span>
            <input type="date" name="data" required min={hoje} className={CAMPO} />
          </label>

          <label className="grid gap-1.5">
            <span className={ROTULO}>Hora</span>
            <input type="time" name="hora" required step={900} className={CAMPO} />
          </label>

          <label className="grid gap-1.5">
            <span className={ROTULO}>Vagas</span>
            <input
              type="number"
              name="vagas"
              required
              min={1}
              max={20}
              defaultValue={avulsa?.vagas_padrao ?? 6}
              className={`${CAMPO} w-24`}
            />
          </label>

          <button type="submit" className={BOTAO}>
            Abrir
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="versalete font-display text-xl text-vermelho">
          Próximos horários
        </h2>

        {porDia.size === 0 ? (
          <p className="border border-linha bg-branco p-8 text-center text-grafite/70">
            Nenhum horário aberto. Enquanto não houver, a página de aulas
            oferece o WhatsApp no lugar da agenda.
          </p>
        ) : null}

        {[...porDia.entries()].map(([dia, lista]) => (
          <div key={dia} className="border border-linha bg-branco">
            <p className="versalete-larga border-b border-linha px-5 py-3 text-[0.62rem] text-preto/55">
              {diaLongo(lista[0]!.inicio)}
            </p>
            <ul className="divide-y divide-linha">
              {lista.map((h) => {
                const livres = Math.max(h.vagas - h.ocupadas, 0);
                return (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-display text-lg text-preto">{hora(h.inicio)}</span>
                      {/* Um ponto por lugar: verde = mensal, vermelho =
                          avulsa, vazio = livre. Lê-se a mesa num relance. */}
                      <span className="flex gap-1" aria-hidden>
                        {Array.from({ length: h.vagas }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < h.mensal
                                ? "h-2.5 w-2.5 rounded-full bg-verde"
                                : i < h.mensal + h.avulsa
                                  ? "h-2.5 w-2.5 rounded-full bg-vermelho"
                                  : "h-2.5 w-2.5 rounded-full border border-preto/25"
                            }
                          />
                        ))}
                      </span>
                      <span className="text-[0.85rem] text-grafite/75">
                        {h.mensal} mensal · {h.avulsa} avulsa · {livres}{" "}
                        {livres === 1 ? "livre" : "livres"}
                      </span>
                      {!h.publicado ? (
                        <span className="versalete-larga bg-preto/80 px-2 py-0.5 text-[0.55rem] text-branco">
                          Fora do ar
                        </span>
                      ) : null}
                    </div>

                    <form action={h.publicado ? fecharHorario : reabrirHorario}>
                      <input type="hidden" name="horarioId" value={h.id} />
                      <button
                        type="submit"
                        className="versalete-larga text-[0.6rem] text-preto/50 underline underline-offset-4 transition-colors hover:text-vermelho"
                      >
                        {h.publicado ? "Tirar do ar" : "Pôr no ar"}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <p className="text-[0.8rem] leading-relaxed text-grafite/65">
          Tirar do ar some com o horário da agenda pública, mas mantém de pé
          quem já reservou. Não existe apagar horário no painel de propósito:
          apagaria a aula de quem pagou. Fechar uma terça com mensalista dentro
          (ponto verde) não remarca ninguém: avise a pessoa e combine a
          reposição.
        </p>
      </section>
    </div>
  );
}
