import { NextResponse } from "next/server";
import { confirmarPagamento } from "@/lib/reservas";

export const runtime = "nodejs";

/**
 * Webhook da InfinitePay.
 *
 * A InfinitePay NÃO assina este chamado. Então nada do corpo é tratado como
 * prova: `transaction_nsu` e `slug` são usados apenas como argumento da
 * pergunta que NÓS fazemos de volta a ela em `payment_check`. Quem responde
 * "foi pago, neste valor" é a InfinitePay, não quem postou aqui.
 *
 * O `token` na URL é a primeira camada: ele nasce de 32 bytes aleatórios por
 * reserva e só a InfinitePay o recebeu, ao criar o link. Não é assinatura, mas
 * impede que alguém varra reservas e transforma "qualquer um posta" em "quem
 * já conhece o segredo posta".
 *
 * Responde 200 em quase tudo, de propósito: a InfinitePay reenfileira o que
 * recebe 4xx/5xx, e não há motivo para ela insistir num pagamento que
 * simplesmente não foi feito.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let corpo: Record<string, unknown> = {};
  try {
    corpo = ((await req.json()) ?? {}) as Record<string, unknown>;
  } catch {
    // Corpo ilegível não impede a conferência: o token já identifica a reserva
    // e o payment_check aceita só o order_nsu.
  }

  const texto = (v: unknown) => (typeof v === "string" && v ? v : null);
  const transactionNsu = texto(corpo.transaction_nsu);

  try {
    const estado = await confirmarPagamento({
      token,
      transactionNsu,
      slugFatura: texto(corpo.invoice_slug) ?? texto(corpo.slug),
      receiptUrl: texto(corpo.receipt_url),
      bruto: corpo,
    });

    if (estado === "desconhecida") {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // O aviso diz que houve transação, mas a InfinitePay ainda responde "não
    // pago" à nossa pergunta: o aviso chegou antes de o pagamento assentar do
    // lado dela. Pedimos para ela tentar de novo, em vez de aceitar o "não
    // pago" e perder a confirmação. Sem `transaction_nsu` no corpo não há o
    // que esperar — aí o "não pago" é a resposta certa.
    if (estado === "nao_paga" && transactionNsu) {
      return NextResponse.json({ ok: false, estado }, { status: 400 });
    }

    return NextResponse.json({ ok: true, estado });
  } catch (err) {
    console.error("[webhook] falha ao confirmar:", err);
    // Problema NOSSO (banco fora, InfinitePay sem responder à conferência), e
    // queremos a retentativa dela. É 400, e não 500, porque é o código que a
    // documentação da InfinitePay diz que dispara o reenvio.
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
