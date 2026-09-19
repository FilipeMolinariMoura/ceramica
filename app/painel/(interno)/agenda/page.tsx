import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { chaveDia, diaLongo, expirarVencidas, hora } from "@/lib/agenda";
import { abrirHorario, fecharHorario, reabrirHorario } from "@/app/painel/acoes";

export const dynamic = "force-dynamic";

type LinhaHorario = {
  id: number;
  inicio: Date;
  vagas: number;
  ocupadas: number;
  publicado: boolean;
  servico: string;
};

export default async function Agenda() {
  await exigirSessao();
  await expirarVencidas();

  const [{ rows: servicos }, { rows: horarios }] = await Promise.all([
    db().query(`select id, nome, vagas_padrao from servicos where ativo order by ordem, nome`),
    db().query<LinhaHorario>(
      `select h.id, h.inicio, h.vagas, h.ocupadas, h.publicado, s.nome as servico
         from horarios h join servicos s on s.id = h.servico_id
        where h.inicio > now() - interval '1 day'
        order by h.inicio
        limit 300`
    ),
  ]);

  // Data de hoje em Brasília, para o valor mínimo do campo de data. Montada
  // pelo mesmo caminho que formata o resto da agenda, e não por `new Date()`
  // no cliente — o servidor roda em UTC.
  const hoje = chaveDia(new Date());

  const porDia = new Map<string, LinhaHorario[]>();
  for (const h of horarios) {
    const k = chaveDia(h.inicio);
    porDia.set(k, [...(porDia.get(k) ?? []), h]);
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="border border-linha bg-branco p-6">
        <h2 className="versalete font-display text-xl text-vermelho">
          Abrir um horário
        </h2>
        <p className="mt-1 text-[0.85rem] text-grafite/75">
          Horário de Brasília. Abrir um horário que já existe só atualiza as
          vagas dele.
        </p>

        <form action={abrirHorario} className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
          <label className="grid gap-1.5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">Aula</span>
            <select
              name="servicoId"
              required
              className="h-11 border border-linha bg-branco px-3 text-[0.9rem] text-preto outline-none focus-visible:border-vermelho"
            >
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">Dia</span>
            <input
              type="date"
              name="data"
              required
              min={hoje}
              className="h-11 border border-linha bg-branco px-3 text-[0.9rem] text-preto outline-none focus-visible:border-vermelho"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">Hora</span>
            <input
              type="time"
              name="hora"
              required
              step={900}
              className="h-11 border border-linha bg-branco px-3 text-[0.9rem] text-preto outline-none focus-visible:border-vermelho"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">Vagas</span>
            <input
              type="number"
              name="vagas"
              required
              min={1}
              max={20}
              defaultValue={servicos[0]?.vagas_padrao ?? 4}
              className="h-11 w-24 border border-linha bg-branco px-3 text-[0.9rem] text-preto outline-none focus-visible:border-vermelho"
            />
          </label>

          <button
            type="submit"
            className="h-11 bg-vermelho px-6 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-branco transition-colors hover:bg-vermelho-escuro"
          >
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
              {lista.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-lg text-preto">{hora(h.inicio)}</span>
                    <span className="text-[0.85rem] text-grafite/75">{h.servico}</span>
                    <span className="text-[0.85rem] text-grafite/75">
                      {h.ocupadas} de {h.vagas} {h.vagas === 1 ? "vaga" : "vagas"}
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
              ))}
            </ul>
          </div>
        ))}

        <p className="text-[0.8rem] leading-relaxed text-grafite/65">
          Tirar do ar some com o horário da agenda pública, mas mantém de pé
          quem já reservou. Não existe apagar horário no painel de propósito:
          apagaria a aula de quem pagou.
        </p>
      </section>
    </div>
  );
}
