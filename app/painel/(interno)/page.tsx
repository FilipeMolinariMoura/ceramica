import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { expirarVencidas, diaCurto, diaLongo, hora, reais } from "@/lib/agenda";
import { cancelarPacote, cancelarReserva } from "@/app/painel/acoes";
import { EXPERIENCIA_OPCOES, TURMAS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Linha = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  status: string;
  valor_centavos: number;
  inicio: Date;
  servico: string;
  receipt_url: string | null;
  capture_method: string | null;
  origem: string | null;
};

type LinhaPacote = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  status: string;
  turma: string;
  meio: string;
  valor_centavos: number;
  observacao: string | null;
  origem: string | null;
  receipt_url: string | null;
  capture_method: string | null;
  aulas: { inicio: string; status: string }[];
};

type Abandono = {
  tipo: "avulsa" | "mensal";
  nome: string;
  whatsapp: string;
  criado_em: Date;
  quando: Date | null;
};

type Inscricao = {
  created_at: Date;
  nome: string;
  whatsapp: string;
  turma: string;
  experiencia: string;
  origem: string | null;
};

const ROTULO: Record<string, string> = {
  confirmada: "Confirmada",
  pendente: "Aguardando pagamento",
  expirada: "Expirada",
  cancelada: "Cancelada",
  paga_sem_vaga: "Paga sem vaga",
};

const COR: Record<string, string> = {
  confirmada: "bg-verde text-branco",
  pendente: "border border-linha text-preto/70",
  expirada: "border border-linha text-preto/40",
  cancelada: "border border-linha text-preto/40",
  paga_sem_vaga: "bg-vermelho text-branco",
};

const TH = "versalete-larga px-4 py-3 text-[0.6rem] font-semibold text-preto/50";
const LINK_ACAO =
  "versalete-larga text-[0.6rem] text-preto/50 underline underline-offset-4 transition-colors hover:text-vermelho";

const periodo = (turma: string) =>
  TURMAS.find((t) => t.id === turma)?.periodo.toLowerCase() ?? turma;

/** wa.me com a mensagem pronta — a Isabela só aperta enviar. */
function zapPara(whatsapp: string, mensagem: string): string {
  return `https://wa.me/55${whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export default async function Reservas() {
  await exigirSessao();

  // Devolve vagas de holds vencidos antes de contar qualquer coisa — senão o
  // painel mostraria dinheiro e lotação que não existem mais.
  await expirarVencidas();

  const [{ rows }, { rows: pacotes }, { rows: abandonos }, { rows: inscricoes }] =
    await Promise.all([
      db().query<Linha>(
        `select r.id, r.nome, r.email, r.whatsapp, r.status, r.valor_centavos, r.origem,
                h.inicio, s.nome as servico, p.receipt_url, p.capture_method
           from reservas r
           join horarios h on h.id = r.horario_id
           join servicos s on s.id = h.servico_id
           left join pagamentos p on p.reserva_id = r.id
          where r.pacote_id is null
          order by r.criado_em desc
          limit 200`
      ),
      db().query<LinhaPacote>(
        `select pk.id, pk.nome, pk.email, pk.whatsapp, pk.status, pk.turma, pk.meio,
                pk.valor_centavos, pk.observacao, pk.origem,
                p.receipt_url, p.capture_method,
                coalesce(json_agg(json_build_object('inicio', h.inicio, 'status', r.status)
                         order by h.inicio) filter (where r.id is not null), '[]') as aulas
           from pacotes pk
           left join pagamentos p on p.pacote_id = pk.id
           left join reservas r on r.pacote_id = pk.id
           left join horarios h on h.id = r.horario_id
          group by pk.id, p.receipt_url, p.capture_method
          order by pk.criado_em desc
          limit 100`
      ),
      // Quem chegou até o pagamento e não pagou, nos últimos 7 dias — e não
      // comprou nada depois. É o lead mais quente que existe: já escolheu dia
      // e já deu o contato.
      db().query<Abandono>(
        `with tentativas as (
           select 'avulsa' as tipo, r.nome, r.email, r.whatsapp, r.criado_em, h.inicio as quando
             from reservas r join horarios h on h.id = r.horario_id
            where r.pacote_id is null and r.status = 'expirada'
              and r.criado_em > now() - interval '7 days'
           union all
           select 'mensal', pk.nome, pk.email, pk.whatsapp, pk.criado_em,
                  (select min(h.inicio) from reservas r join horarios h on h.id = r.horario_id
                    where r.pacote_id = pk.id)
             from pacotes pk
            where pk.status = 'expirada' and pk.criado_em > now() - interval '7 days'
         )
         select distinct on (t.email) t.tipo, t.nome, t.whatsapp, t.criado_em, t.quando
           from tentativas t
          where not exists (
                  select 1 from reservas r
                   where r.email = t.email and r.pacote_id is null
                     and r.status = 'confirmada' and r.criado_em > t.criado_em)
            and not exists (
                  select 1 from pacotes pk
                   where pk.email = t.email and pk.status = 'confirmada'
                     and pk.criado_em > t.criado_em)
          order by t.email, t.criado_em desc`
      ),
      db().query<Inscricao>(
        `select created_at, nome, whatsapp, turma, experiencia, origem
           from inscricoes order by created_at desc limit 50`
      ),
    ]);

  const agora = new Date();
  const aulasDoPacote = (p: LinhaPacote) =>
    p.aulas.map((a) => ({ inicio: new Date(a.inicio), status: a.status }));

  const pacotesPagos = pacotes.filter(
    (p) => p.status === "confirmada" || p.status === "paga_sem_vaga"
  );
  const recebido =
    rows
      .filter((r) => r.status === "confirmada")
      .reduce((s, r) => s + Number(r.valor_centavos), 0) +
    pacotesPagos.reduce((s, p) => s + Number(p.valor_centavos), 0);
  const aVir =
    rows.filter((r) => r.status === "confirmada" && r.inicio > agora).length +
    pacotesPagos.reduce(
      (s, p) =>
        s + aulasDoPacote(p).filter((a) => a.status === "confirmada" && a.inicio > agora).length,
      0
    );
  const mensalistas = pacotesPagos.filter((p) =>
    aulasDoPacote(p).some((a) => a.inicio > agora)
  ).length;

  const semVaga =
    rows.filter((r) => r.status === "paga_sem_vaga").length +
    pacotes.filter((p) => p.status === "paga_sem_vaga").length;
  const divergentes = pacotes.filter((p) => p.observacao?.includes("escolheu Pix"));

  // Renovação: a última aula do pacote cai nos próximos 7 dias.
  const emSeteDias = new Date(agora.getTime() + 7 * 86_400_000);
  const renovar = pacotes.filter((p) => {
    if (p.status !== "confirmada") return false;
    const ultima = aulasDoPacote(p).at(-1)?.inicio;
    return ultima !== undefined && ultima > agora && ultima <= emSeteDias;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-px border border-linha bg-linha sm:grid-cols-4">
        {[
          ["Recebido", reais(recebido)],
          ["Aulas a dar", String(aVir)],
          ["Mensalistas ativos", String(mensalistas)],
          ["Vendas no total", String(rows.length + pacotes.length)],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-1 bg-branco p-5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">{rotulo}</span>
            <span className="font-display text-2xl text-preto">{valor}</span>
          </div>
        ))}
      </div>

      {/* Fila que não pode passar batida: é gente que pagou e ficou sem aula. */}
      {semVaga > 0 ? (
        <Aviso titulo={`${semVaga} paga${semVaga > 1 ? "s" : ""} sem vaga`}>
          O pagamento entrou depois de a vaga ter sido tomada. Chame estas
          pessoas para remarcar — o dinheiro já é da Isabela e a aula ainda
          não tem horário. No pacote, a aula marcada &ldquo;remarcar&rdquo; é a que falta.
        </Aviso>
      ) : null}

      {divergentes.length > 0 ? (
        <Aviso titulo={`${divergentes.length} pagamento${divergentes.length > 1 ? "s" : ""} no cartão pelo valor do Pix`}>
          A pessoa escolheu Pix no site e, na tela da InfinitePay, pagou no
          cartão. A vaga foi confirmada (nunca recusamos dinheiro que entrou);
          a diferença está anotada no pacote. Cobrar ou deixar passar é com você.
        </Aviso>
      ) : null}

      {renovar.length > 0 ? (
        <section className="border border-linha bg-branco p-5">
          <p className="versalete font-display text-lg text-vermelho">
            Renovação desta semana
          </p>
          <p className="mt-1 text-[0.85rem] text-grafite/75">
            O pacote destas pessoas termina nos próximos dias. Quem não renovar
            pode perder o lugar para uma aula avulsa.
          </p>
          <ul className="mt-3 divide-y divide-linha">
            {renovar.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="text-preto">
                  {p.nome} · turma da {periodo(p.turma)} · última aula{" "}
                  {diaCurto(aulasDoPacote(p).at(-1)!.inicio)}
                </span>
                <a
                  href={zapPara(
                    p.whatsapp,
                    `Oi, ${primeiroNome(p.nome)}! Seu pacote de cerâmica termina nesta semana. Quer garantir as próximas terças? É só renovar pelo site: belaceramica.prismax.tech/aulas`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_ACAO}
                >
                  Chamar no WhatsApp
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Turma mensal ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="versalete font-display text-xl text-vermelho">Turma mensal</h2>
        <div className="overflow-x-auto border border-linha bg-branco">
          <table className="w-full min-w-[58rem] text-left text-[0.9rem]">
            <thead>
              <tr className="border-b border-linha">
                {["Quem", "Turma e aulas", "Situação", "Valor", ""].map((c) => (
                  <th key={c} className={TH}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pacotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-grafite/70">
                    Nenhum pacote vendido ainda.
                  </td>
                </tr>
              ) : null}

              {pacotes.map((p) => (
                <tr key={p.id} className="border-b border-linha last:border-0">
                  <td className="px-4 py-3 align-top">
                    <Contato nome={p.nome} email={p.email} whatsapp={p.whatsapp} origem={p.origem} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-preto">Turma da {periodo(p.turma)}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {aulasDoPacote(p).map((a) => (
                        <span
                          key={a.inicio.toISOString()}
                          className={`px-1.5 py-0.5 text-[0.75rem] ${
                            a.status === "confirmada"
                              ? "bg-verde/15 text-preto"
                              : a.status === "paga_sem_vaga"
                                ? "bg-vermelho text-branco"
                                : "border border-linha text-preto/45"
                          }`}
                          title={ROTULO[a.status] ?? a.status}
                        >
                          {diaCurto(a.inicio)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Situacao status={p.status} />
                    <div className="mt-1 text-[0.75rem] text-grafite/60">
                      escolheu {p.meio === "pix" ? "Pix" : "cartão"}
                      {p.capture_method
                        ? ` · pagou ${p.capture_method === "pix" ? "Pix" : "cartão"}`
                        : ""}
                    </div>
                    {p.observacao ? (
                      <div className="mt-1 max-w-[16rem] text-[0.72rem] leading-snug text-vermelho">
                        {p.observacao}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Valor centavos={p.valor_centavos} recibo={p.receipt_url} />
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {p.status === "pendente" || p.status === "confirmada" || p.status === "paga_sem_vaga" ? (
                      <form action={cancelarPacote}>
                        <input type="hidden" name="pacoteId" value={p.id} />
                        <button type="submit" className={LINK_ACAO}>
                          Cancelar
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Aulas avulsas ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="versalete font-display text-xl text-vermelho">Aulas avulsas</h2>
        <div className="overflow-x-auto border border-linha bg-branco">
          <table className="w-full min-w-[54rem] text-left text-[0.9rem]">
            <thead>
              <tr className="border-b border-linha">
                {["Quem", "Quando", "Situação", "Valor", ""].map((c) => (
                  <th key={c} className={TH}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-grafite/70">
                    Nenhuma reserva ainda.
                  </td>
                </tr>
              ) : null}

              {rows.map((r) => (
                <tr key={r.id} className="border-b border-linha last:border-0">
                  <td className="px-4 py-3 align-top">
                    <Contato nome={r.nome} email={r.email} whatsapp={r.whatsapp} origem={r.origem} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-preto">{diaLongo(r.inicio)}</div>
                    <div className="text-[0.8rem] text-grafite/70">
                      às {hora(r.inicio)} · {r.servico}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Situacao status={r.status} />
                    {r.capture_method ? (
                      <div className="mt-1 text-[0.75rem] text-grafite/60">
                        {r.capture_method === "pix" ? "Pix" : "Cartão"}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Valor centavos={r.valor_centavos} recibo={r.receipt_url} />
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {r.status === "pendente" || r.status === "confirmada" ? (
                      <form action={cancelarReserva}>
                        <input type="hidden" name="reservaId" value={r.id} />
                        <button type="submit" className={LINK_ACAO}>
                          Cancelar
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[0.8rem] leading-relaxed text-grafite/65">
          Cancelar uma compra <strong>confirmada</strong> — avulsa ou pacote —
          devolve os lugares à agenda, mas não estorna nada: o dinheiro já está
          na conta da InfinitePay e o estorno é feito por lá.
        </p>
      </section>

      {/* ── Pagamentos abandonados ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="versalete font-display text-xl text-vermelho">
          Chegaram no pagamento e não pagaram
        </h2>
        <p className="text-[0.85rem] text-grafite/75">
          Últimos 7 dias, sem compra depois. Já escolheram a data e deixaram o
          contato — uma mensagem costuma bastar.
        </p>
        {abandonos.length === 0 ? (
          <p className="border border-linha bg-branco p-6 text-center text-grafite/70">
            Ninguém por aqui.
          </p>
        ) : (
          <ul className="divide-y divide-linha border border-linha bg-branco">
            {abandonos.map((a) => (
              <li key={`${a.whatsapp}-${a.criado_em.toISOString()}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="text-preto">
                  {a.nome}{" "}
                  <span className="text-[0.85rem] text-grafite/70">
                    · {a.tipo === "mensal" ? "turma mensal" : "aula avulsa"}
                    {a.quando ? ` de ${diaCurto(a.quando)}` : ""} · tentou em {diaCurto(a.criado_em)}
                  </span>
                </span>
                <a
                  href={zapPara(
                    a.whatsapp,
                    `Oi, ${primeiroNome(a.nome)}! Vi que você começou a reservar ${
                      a.tipo === "mensal" ? "a turma mensal" : "uma aula"
                    } de cerâmica e não terminou. Posso te ajudar com alguma coisa?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_ACAO}
                >
                  Chamar no WhatsApp
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Lista de espera ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="versalete font-display text-xl text-vermelho">
          Lista de espera e interesse
        </h2>
        <p className="text-[0.85rem] text-grafite/75">
          Quem deixou nome pelo formulário da turma — antes, isto só dava para
          ver pelo terminal.
        </p>
        {inscricoes.length === 0 ? (
          <p className="border border-linha bg-branco p-6 text-center text-grafite/70">
            Ninguém na lista.
          </p>
        ) : (
          <ul className="divide-y divide-linha border border-linha bg-branco">
            {inscricoes.map((i) => (
              <li key={`${i.whatsapp}-${new Date(i.created_at).toISOString()}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="text-preto">
                  {i.nome}{" "}
                  <span className="text-[0.85rem] text-grafite/70">
                    · {i.turma === "tanto_faz" ? "qualquer turma" : `turma da ${periodo(i.turma)}`} ·{" "}
                    {(EXPERIENCIA_OPCOES.find((e) => e.value === i.experiencia)?.label ?? i.experiencia).toLowerCase()} · {diaCurto(new Date(i.created_at))}
                  </span>
                </span>
                <a
                  href={zapPara(
                    i.whatsapp.replace(/\D/g, "").replace(/^55/, ""),
                    `Oi, ${primeiroNome(i.nome)}! Aqui é a Isabela, da cerâmica. Abri novas terças para a turma — quer garantir a sua?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_ACAO}
                >
                  Chamar no WhatsApp
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-vermelho bg-branco p-5">
      <p className="versalete font-display text-lg text-vermelho">{titulo}</p>
      <p className="mt-1 text-[0.9rem] leading-relaxed text-grafite">{children}</p>
    </div>
  );
}

function Contato(p: { nome: string; email: string; whatsapp: string; origem: string | null }) {
  return (
    <>
      <div className="font-medium text-preto">{p.nome}</div>
      <div className="text-[0.8rem] text-grafite/70">{p.email}</div>
      <a
        href={`https://wa.me/55${p.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.8rem] text-vermelho underline underline-offset-2"
      >
        {p.whatsapp}
      </a>
      {p.origem ? (
        <div className="mt-0.5 text-[0.7rem] text-grafite/50">veio de: {p.origem}</div>
      ) : null}
    </>
  );
}

function Situacao({ status }: { status: string }) {
  return (
    <span className={`versalete-larga inline-block px-2.5 py-1 text-[0.58rem] ${COR[status] ?? ""}`}>
      {ROTULO[status] ?? status}
    </span>
  );
}

function Valor({ centavos, recibo }: { centavos: number; recibo: string | null }) {
  return (
    <>
      <div className="text-preto">{reais(Number(centavos))}</div>
      {recibo ? (
        <a
          href={recibo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.78rem] text-vermelho underline underline-offset-2"
        >
          comprovante
        </a>
      ) : null}
    </>
  );
}
