import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, TriangleAlert } from "lucide-react";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { diaLongo, hora, reais } from "@/lib/agenda";
import { confirmarPagamento, reservaPorToken } from "@/lib/reservas";
import { WHATSAPP_DUVIDA } from "@/lib/constants";

// Lê o banco e confere pagamento a cada visita: cachear esta página mostraria
// "aguardando pagamento" para quem acabou de pagar.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sua reserva",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Reserva({ params, searchParams }: Props) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();

  const busca = await searchParams;
  const texto = (v: string | string[] | undefined) =>
    typeof v === "string" && v ? v : null;

  let reserva = await reservaPorToken(token);
  if (!reserva) notFound();

  /**
   * A InfinitePay manda a pessoa de volta para cá com os dados da transação.
   * Conferimos aqui TAMBÉM, e não só no webhook, porque o webhook pode chegar
   * depois — ou não chegar, se o contêiner estava sendo recriado no momento.
   * Quem chegar primeiro confirma; o segundo encontra já confirmada.
   */
  if (reserva.status === "pendente" || reserva.status === "expirada") {
    try {
      await confirmarPagamento({
        token,
        transactionNsu: texto(busca.transaction_nsu),
        slugFatura: texto(busca.slug),
        receiptUrl: texto(busca.receipt_url),
        bruto: busca,
      });
      reserva = (await reservaPorToken(token)) ?? reserva;
    } catch (err) {
      // Falar com a InfinitePay pode falhar; a página não pode cair por isso.
      // O estado mostrado continua honesto: "ainda não confirmado".
      console.error("[retorno] conferência falhou:", err);
    }
  }

  const confirmada = reserva.status === "confirmada";
  const semVaga = reserva.status === "paga_sem_vaga";

  return (
    <div className="bg-papel pb-24 pt-[8.5rem] sm:pt-[10rem]">
      <Container className="max-w-2xl">
        <div className="border border-linha bg-branco p-8 sm:p-12">
          <Cabecalho estado={reserva.status} />

          <dl className="mt-8 divide-y divide-linha border-y border-linha">
            {[
              ["Aula", reserva.servico],
              ["Quando", `${diaLongo(reserva.inicio)}, às ${hora(reserva.inicio)}`],
              ["Duração", `${reserva.duracaoMin} minutos`],
              ["No nome de", reserva.nome],
              ["Valor", reais(reserva.valorCentavos)],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="versalete-larga text-[0.66rem] text-preto/50">{rotulo}</dt>
                <dd className="text-right text-[0.98rem] font-medium text-preto">{valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {confirmada ? (
              <a
                href={`/aulas/reserva/${token}/agenda.ics`}
                className="inline-flex h-12 items-center justify-center border border-vermelho px-6 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-vermelho transition-colors hover:bg-vermelho hover:text-branco"
              >
                Salvar no calendário
              </a>
            ) : null}
            {reserva.receiptUrl ? (
              <a
                href={reserva.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center border border-linha px-6 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-preto transition-colors hover:border-preto"
              >
                Ver o comprovante
              </a>
            ) : null}
            <a
              href={WHATSAPP_DUVIDA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center border border-linha px-6 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-preto transition-colors hover:border-preto"
            >
              Falar com a Isabela
            </a>
          </div>

          {semVaga ? (
            <p className="mt-6 border-l-2 border-vermelho bg-papel p-4 text-[0.9rem] leading-relaxed text-grafite">
              Seu pagamento entrou, mas a vaga desse horário foi preenchida
              enquanto ele era processado. <strong>O valor não se perde:</strong>{" "}
              a Isabela vai te chamar para remarcar. Se preferir adiantar, chame
              no WhatsApp.
            </p>
          ) : null}

          {!confirmada && !semVaga ? (
            <p className="mt-6 text-[0.85rem] leading-relaxed text-grafite/70">
              Se você acabou de pagar, a confirmação pode levar alguns instantes.
              Atualize a página. Guarde este link — ele é o seu comprovante de
              reserva.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-[0.85rem] text-grafite/70">
          <Link href="/aulas" className="underline underline-offset-4 hover:text-vermelho">
            Voltar para as aulas
          </Link>
        </p>
      </Container>
    </div>
  );
}

function Cabecalho({ estado }: { estado: string }) {
  if (estado === "confirmada") {
    return (
      <div className="flex flex-col gap-4">
        <span className="grid h-14 w-14 place-items-center bg-verde text-branco">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <Eyebrow>Confirmada</Eyebrow>
        <h1 className="versalete font-display text-[2rem] leading-[1.05] text-vermelho sm:text-[2.4rem]">
          Sua vaga está garantida
        </h1>
        <p className="text-[1rem] leading-relaxed text-grafite/85">
          Te esperamos no ateliê. Venha com roupa que possa sujar de barro.
        </p>
      </div>
    );
  }

  if (estado === "paga_sem_vaga") {
    return (
      <div className="flex flex-col gap-4">
        <span className="grid h-14 w-14 place-items-center bg-vermelho text-branco">
          <TriangleAlert className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <Eyebrow>Pago — precisa remarcar</Eyebrow>
        <h1 className="versalete font-display text-[2rem] leading-[1.05] text-vermelho sm:text-[2.4rem]">
          Vamos achar outro horário
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="grid h-14 w-14 place-items-center border border-linha text-preto/60">
        <Clock className="h-7 w-7" strokeWidth={2} />
      </span>
      <Eyebrow tone="escuro">Aguardando pagamento</Eyebrow>
      <h1 className="versalete font-display text-[2rem] leading-[1.05] text-preto sm:text-[2.4rem]">
        Reserva ainda não confirmada
      </h1>
    </div>
  );
}
