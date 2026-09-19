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

  try {
    const estado = await confirmarPagamento({
      token,
      transactionNsu: texto(corpo.transaction_nsu),
      slugFatura: texto(corpo.invoice_slug) ?? texto(corpo.slug),
      receiptUrl: texto(corpo.receipt_url),
      bruto: corpo,
    });

    if (estado === "desconhecida") {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    return NextResponse.json({ ok: true, estado });
  } catch (err) {
    console.error("[webhook] falha ao confirmar:", err);
    // Aqui sim vale 500: foi problema NOSSO, e queremos a retentativa dela.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
