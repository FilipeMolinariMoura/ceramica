import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, MapPin, Shirt, Sparkles, TriangleAlert } from "lucide-react";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { diaCurto, diaLongo, diaSemanaCurto, hora, horaCurta, reais } from "@/lib/agenda";
import { confirmarPagamento, reservaPorToken, type ReservaPublica } from "@/lib/reservas";
import { SITE, TURMAS, WHATSAPP_DUVIDA, zap } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

const BOTAO =
  "inline-flex h-12 items-center justify-center gap-2 px-6 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px";

const MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.endereco)}`;

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
  const pago = confirmada || semVaga;
  const mensal = reserva.tipo === "mensal";
  const turma = TURMAS.find((t) => t.id === reserva.turma);

  // Enquanto o hold vale, quem fechou o checkout sem querer pode voltar a ele
  // sem perder a vaga nem refazer o formulário.
  const podeVoltarAoPagamento =
    reserva.status === "pendente" &&
    reserva.checkoutUrl !== null &&
    reserva.expiraEm.getTime() > Date.now();

  return (
    <div className="bg-papel pb-24 pt-[8.5rem] sm:pt-[10rem]">
      <Container className="max-w-2xl">
        <div className="border border-linha bg-branco p-8 sm:p-12">
          <Cabecalho estado={reserva.status} mensal={mensal} />

          {/* As aulas, uma por linha, com a situação de cada. É o que a
              pessoa vai querer conferir antes de qualquer outra coisa. */}
          <ol className="mt-8 grid gap-2">
            {reserva.aulas.map((a, i) => (
              <li
                key={a.inicio.toISOString()}
                className={cn(
                  "flex items-center gap-4 border px-4 py-3",
                  a.status === "confirmada"
                    ? "border-verde/40 bg-verde/5"
                    : a.status === "paga_sem_vaga"
                      ? "border-vermelho/50 bg-vermelho/5"
                      : "border-linha"
                )}
              >
                {mensal ? (
                  <span className="numeral w-6 text-[0.95rem] text-preto/40">{i + 1}</span>
                ) : null}
                <span className="numeral text-[1.35rem] leading-none text-preto">
                  {diaSemanaCurto(a.inicio)} {diaCurto(a.inicio)}
                </span>
                <span className="text-[0.95rem] text-grafite">{horaCurta(a.inicio)}</span>
                <span className="ml-auto">
                  {a.status === "confirmada" ? (
                    <Check aria-label="confirmada" className="h-5 w-5 text-verde" strokeWidth={2.5} />
                  ) : a.status === "paga_sem_vaga" ? (
                    <span className="versalete-larga text-[0.58rem] text-vermelho">remarcar</span>
                  ) : (
                    <Clock aria-label="aguardando" className="h-4 w-4 text-preto/35" />
                  )}
                </span>
              </li>
            ))}
          </ol>

          <dl className="mt-6 grid grid-cols-2 gap-px border border-linha bg-linha text-[0.9rem]">
            {[
              ["No nome de", reserva.nome],
              [mensal ? `Turma ${turma?.periodo.toLowerCase() ?? ""}` : "Duração", mensal ? turma?.horario ?? "" : `${reserva.duracaoMin} min`],
              ["Valor", reais(reserva.valorCentavos)],
              mensal
                ? ["Por aula", reais(Math.round(reserva.valorCentavos / Math.max(reserva.aulas.length, 1)))]
                : ["Quando", `${diaSemanaCurto(reserva.inicio)} ${diaCurto(reserva.inicio)}`],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="flex flex-col gap-0.5 bg-branco px-4 py-3">
                <dt className="versalete-larga text-[0.58rem] text-preto/45">{rotulo}</dt>
                <dd className="font-medium text-preto">{valor}</dd>
              </div>
            ))}
          </dl>

          {pago ? (
            <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[0.78rem] leading-snug text-grafite">
              <li className="flex flex-col items-center gap-2 border border-linha px-2 py-4">
                <Shirt aria-hidden className="h-5 w-5 text-vermelho" />
                Roupa que pode sujar
              </li>
              <li className="flex flex-col items-center gap-2 border border-linha px-2 py-4">
                <Sparkles aria-hidden className="h-5 w-5 text-vermelho" />
                Queima inclusa
              </li>
              <li className="flex">
                <a
                  href={MAPA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full flex-col items-center gap-2 border border-linha px-2 py-4 transition-colors hover:border-vermelho hover:text-vermelho"
                >
                  <MapPin aria-hidden className="h-5 w-5 text-vermelho" />
                  Como chegar
                </a>
              </li>
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {podeVoltarAoPagamento ? (
              <a href={reserva.checkoutUrl!} className={cn(BOTAO, "bg-vermelho text-branco hover:bg-vermelho-escuro")}>
                Voltar ao pagamento
              </a>
            ) : null}
            {confirmada ? (
              <a
                href={`/aulas/reserva/${token}/agenda.ics`}
                className={cn(BOTAO, "border border-vermelho text-vermelho hover:bg-vermelho hover:text-branco")}
              >
                Salvar {mensal ? "as aulas" : ""} no calendário
              </a>
            ) : null}
            {pago ? (
              <a
                href={mensagemDeChegada(reserva)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(BOTAO, "border border-linha text-preto hover:border-preto")}
              >
                Avisar a Isabela
              </a>
            ) : (
              <a
                href={WHATSAPP_DUVIDA}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(BOTAO, "border border-linha text-preto hover:border-preto")}
              >
                Falar com a Isabela
              </a>
            )}
            {reserva.receiptUrl ? (
              <a
                href={reserva.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(BOTAO, "border border-linha text-preto hover:border-preto")}
              >
                Comprovante
              </a>
            ) : null}
          </div>

          {semVaga ? (
            <p className="mt-6 border-l-2 border-vermelho bg-papel p-4 text-[0.9rem] leading-relaxed text-grafite">
              Seu pagamento entrou, mas {mensal ? "uma das terças" : "a vaga desse horário"} foi
              preenchida enquanto ele era processado. <strong>O valor não se perde:</strong>{" "}
              a Isabela vai te chamar para remarcar. Se preferir adiantar, chame
              no WhatsApp.
            </p>
          ) : null}

          {!pago ? (
            <p className="mt-6 text-[0.85rem] leading-relaxed text-grafite/70">
              {podeVoltarAoPagamento
                ? `Sua vaga fica guardada até as ${hora(reserva.expiraEm)}. `
                : ""}
              Se você acabou de pagar, a confirmação pode levar alguns instantes.
              Atualize a página. Guarde este link — ele é o seu comprovante de
              reserva.
            </p>
          ) : null}
        </div>

        {/* A renovação é a próxima venda, e ela começa aqui: quem acabou de
            fechar quatro terças é quem mais provavelmente quer as próximas. */}
        {mensal && confirmada && reserva.turma ? (
          <Link
            href={`/aulas?plano=mensal&turma=${reserva.turma}#agenda`}
            className="mt-4 flex items-center justify-between gap-4 border border-linha bg-branco px-6 py-4 text-[0.9rem] text-preto transition-colors hover:border-vermelho"
          >
            <span>
              Última aula em <strong>{diaCurto(reserva.aulas.at(-1)!.inicio)}</strong>. Já
              garanta as próximas quatro.
            </span>
            <span className="versalete-larga shrink-0 text-[0.6rem] text-vermelho">Renovar →</span>
          </Link>
        ) : null}

        <p className="mt-6 text-center text-[0.85rem] text-grafite/70">
          <Link href="/aulas" className="underline underline-offset-4 hover:text-vermelho">
            Voltar para as aulas
          </Link>
        </p>
      </Container>
    </div>
  );
}

/** A mensagem que a PRÓPRIA pessoa manda, já com o que a Isabela precisa saber. */
function mensagemDeChegada(r: ReservaPublica): string {
  const primeiro = r.nome.trim().split(/\s+/)[0] ?? r.nome;
  const primeira = r.aulas[0]?.inicio ?? r.inicio;
  const quando = `${diaLongo(primeira)}, às ${horaCurta(primeira)}`;
  const turma = TURMAS.find((t) => t.id === r.turma);
  return zap(
    r.tipo === "mensal"
      ? `Oi, Isabela! Sou ${primeiro} e acabei de garantir a turma ${
          turma ? `da ${turma.periodo.toLowerCase()}` : "mensal"
        }, começando ${quando}.`
      : `Oi, Isabela! Sou ${primeiro} e acabei de reservar a aula avulsa de ${quando}.`
  );
}

function Cabecalho({ estado, mensal }: { estado: string; mensal: boolean }) {
  if (estado === "confirmada") {
    return (
      <div className="flex flex-col gap-4">
        <span className="grid h-14 w-14 place-items-center bg-verde text-branco">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <Eyebrow>Confirmada</Eyebrow>
        <h1 className="text-[clamp(1.8rem,7.4vw,3.2rem)] leading-[1.02] versalete font-display text-vermelho">
          {mensal ? "Suas terças estão garantidas" : "Sua vaga está garantida"}
        </h1>
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
        <h1 className="text-[clamp(1.8rem,7.4vw,3.2rem)] leading-[1.02] versalete font-display text-vermelho">
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
      <h1 className="text-[clamp(1.8rem,7.4vw,3.2rem)] leading-[1.02] versalete font-display text-preto">
        Reserva ainda não confirmada
      </h1>
    </div>
  );
}
