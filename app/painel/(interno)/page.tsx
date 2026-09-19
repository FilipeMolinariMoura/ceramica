import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { expirarVencidas, diaLongo, hora, reais } from "@/lib/agenda";
import { cancelarReserva } from "@/app/painel/acoes";

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

export default async function Reservas() {
  await exigirSessao();

  // Devolve vagas de holds vencidos antes de contar qualquer coisa — senão o
  // painel mostraria dinheiro e lotação que não existem mais.
  await expirarVencidas();

  const { rows } = await db().query<Linha>(
    `select r.id, r.nome, r.email, r.whatsapp, r.status, r.valor_centavos,
            h.inicio, s.nome as servico, p.receipt_url, p.capture_method
       from reservas r
       join horarios h on h.id = r.horario_id
       join servicos s on s.id = h.servico_id
       left join pagamentos p on p.reserva_id = r.id
      order by r.criado_em desc
      limit 200`
  );

  const confirmadas = rows.filter((r) => r.status === "confirmada");
  const recebido = confirmadas.reduce((s, r) => s + Number(r.valor_centavos), 0);
  const aVir = confirmadas.filter((r) => r.inicio > new Date()).length;
  const semVaga = rows.filter((r) => r.status === "paga_sem_vaga");

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-px border border-linha bg-linha sm:grid-cols-3">
        {[
          ["Recebido", reais(recebido)],
          ["Aulas a dar", String(aVir)],
          ["Reservas no total", String(rows.length)],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-1 bg-branco p-5">
            <span className="versalete-larga text-[0.6rem] text-preto/50">{rotulo}</span>
            <span className="font-display text-2xl text-preto">{valor}</span>
          </div>
        ))}
      </div>

      {/* Fila que não pode passar batida: é gente que pagou e ficou sem aula. */}
      {semVaga.length > 0 ? (
        <div className="border-l-2 border-vermelho bg-branco p-5">
          <p className="versalete font-display text-lg text-vermelho">
            {semVaga.length} paga{semVaga.length > 1 ? "s" : ""} sem vaga
          </p>
          <p className="mt-1 text-[0.9rem] leading-relaxed text-grafite">
            O pagamento entrou depois de a vaga ter sido tomada. Chame estas
            pessoas para remarcar — o dinheiro já é da Isabela e a aula ainda
            não tem horário.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto border border-linha bg-branco">
        <table className="w-full min-w-[54rem] text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-linha">
              {["Quem", "Quando", "Situação", "Valor", ""].map((c) => (
                <th
                  key={c}
                  className="versalete-larga px-4 py-3 text-[0.6rem] font-semibold text-preto/50"
                >
                  {c}
                </th>
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
                  <div className="font-medium text-preto">{r.nome}</div>
                  <div className="text-[0.8rem] text-grafite/70">{r.email}</div>
                  <a
                    href={`https://wa.me/55${r.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.8rem] text-vermelho underline underline-offset-2"
                  >
                    {r.whatsapp}
                  </a>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="text-preto">{diaLongo(r.inicio)}</div>
                  <div className="text-[0.8rem] text-grafite/70">
                    às {hora(r.inicio)} · {r.servico}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`versalete-larga inline-block px-2.5 py-1 text-[0.58rem] ${COR[r.status] ?? ""}`}
                  >
                    {ROTULO[r.status] ?? r.status}
                  </span>
                  {r.capture_method ? (
                    <div className="mt-1 text-[0.75rem] text-grafite/60">
                      {r.capture_method === "pix" ? "Pix" : "Cartão"}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="text-preto">{reais(Number(r.valor_centavos))}</div>
                  {r.receipt_url ? (
                    <a
                      href={r.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.78rem] text-vermelho underline underline-offset-2"
                    >
                      comprovante
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right align-top">
                  {r.status === "pendente" || r.status === "confirmada" ? (
                    <form action={cancelarReserva}>
                      <input type="hidden" name="reservaId" value={r.id} />
                      <button
                        type="submit"
                        className="versalete-larga text-[0.6rem] text-preto/50 underline underline-offset-4 transition-colors hover:text-vermelho"
                      >
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
        Cancelar uma reserva <strong>confirmada</strong> devolve a vaga à agenda,
        mas não estorna nada: o dinheiro já está na conta da InfinitePay e o
        estorno é feito por lá.
      </p>
    </div>
  );
}
