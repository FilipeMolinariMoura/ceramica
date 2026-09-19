// Dublê da InfinitePay, para desenvolvimento.
//
// Sobe um servidor que imita as duas rotas da API de Checkout e ainda serve
// uma tela de pagamento de mentira, com botão de Pix e de cartão. Assim dá
// para percorrer o fluxo inteiro — escolher horário, pagar, voltar confirmado
// — sem conta real e sem expor o site na internet.
//
// Ele NUNCA é usado em produção: `lib/infinitepay.ts` ignora INFINITEPAY_BASE
// quando NODE_ENV é production, de propósito.
//
// Uso:  npm run dev:pagamento

import { createServer } from "node:http";

const PORTA = Number(process.env.PORTA_DUBLE ?? 4599);

/** order_nsu -> o que o site pediu ao criar o link. */
const pedidos = new Map();

const json = (res, dados, status = 200) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(dados));
};

function telaDePagamento(pedido) {
  const total = pedido.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const reais = (total / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Checkout (dublê)</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;background:#0f1115;color:#e8e6e1;
       display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
  .caixa{max-width:26rem;width:100%;background:#171a20;border:1px solid #2a2f38;padding:28px}
  .aviso{background:#3a2a12;border:1px solid #6b4a1c;color:#f0d9a8;padding:10px 12px;
         font-size:.8rem;margin-bottom:20px}
  h1{font-size:1.1rem;margin:0 0 4px} p{margin:.3rem 0;color:#a8adb8;font-size:.9rem}
  .total{font-size:2rem;margin:18px 0 22px;color:#fff}
  button{width:100%;padding:14px;margin-bottom:10px;font:inherit;font-weight:600;
         border:0;cursor:pointer;background:#1db954;color:#06210f}
  .cartao{background:#2a2f38;color:#e8e6e1}
  .cancelar{background:none;color:#7a8190;text-decoration:underline;font-weight:400}
</style>
<div class="caixa">
  <div class="aviso">Dublê da InfinitePay — nenhum dinheiro é movimentado.</div>
  <h1>${pedido.items[0]?.description ?? "Pagamento"}</h1>
  <p>Pedido ${pedido.order_nsu.slice(0, 8)}…</p>
  <div class="total">${reais}</div>
  <form method="POST" action="/pagar">
    <input type="hidden" name="order_nsu" value="${pedido.order_nsu}">
    <button name="meio" value="pix">Pagar com Pix</button>
    <button name="meio" value="credit_card" class="cartao">Pagar no cartão</button>
    <button name="meio" value="abandonar" class="cancelar">Desistir do pagamento</button>
  </form>
</div></html>`;
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORTA}`);

  let corpo = "";
  for await (const parte of req) corpo += parte;

  // ── API ────────────────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/links") {
    const pedido = JSON.parse(corpo || "{}");
    pedidos.set(pedido.order_nsu, { ...pedido, pago: false });
    console.log(`[dublê] link criado · ${pedido.order_nsu.slice(0, 8)}…`);
    return json(res, { url: `http://localhost:${PORTA}/checkout/${pedido.order_nsu}` });
  }

  if (req.method === "POST" && url.pathname === "/payment_check") {
    const { order_nsu } = JSON.parse(corpo || "{}");
    const p = pedidos.get(order_nsu);
    if (!p?.pago) {
      console.log(`[dublê] payment_check · não pago`);
      return json(res, { success: true, paid: false });
    }
    const total = p.items.reduce((s, i) => s + i.price * i.quantity, 0);
    console.log(`[dublê] payment_check · PAGO ${total}`);
    return json(res, {
      success: true,
      paid: true,
      amount: total,
      // Líquido menor que o bruto, como na vida real (taxa). É exatamente o
      // caso que quebraria o site se o valor fosse conferido pelo líquido.
      paid_amount: Math.round(total * 0.97),
      installments: 1,
      capture_method: p.meio ?? "pix",
    });
  }

  // ── Tela de pagamento ──────────────────────────────────────────────────
  if (req.method === "GET" && url.pathname.startsWith("/checkout/")) {
    const pedido = pedidos.get(url.pathname.slice("/checkout/".length));
    if (!pedido) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("pedido não encontrado no dublê");
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(telaDePagamento(pedido));
  }

  if (req.method === "POST" && url.pathname === "/pagar") {
    const form = new URLSearchParams(corpo);
    const pedido = pedidos.get(form.get("order_nsu"));
    const meio = form.get("meio");

    if (!pedido) {
      res.writeHead(404);
      return res.end();
    }

    if (meio === "abandonar") {
      console.log("[dublê] pagamento abandonado — a vaga vence sozinha em 20 min");
      res.writeHead(302, { Location: pedido.redirect_url ?? "/" });
      return res.end();
    }

    pedido.pago = true;
    pedido.meio = meio;
    const transacao = `tx-${Math.random().toString(16).slice(2, 10)}`;
    const fatura = `f-${Math.random().toString(16).slice(2, 8)}`;

    // Dispara o webhook como a InfinitePay faria — inclusive sem assinatura.
    if (pedido.webhook_url) {
      try {
        await fetch(pedido.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_nsu: pedido.order_nsu,
            transaction_nsu: transacao,
            invoice_slug: fatura,
            receipt_url: `http://localhost:${PORTA}/comprovante/${fatura}`,
            capture_method: meio,
            installments: 1,
          }),
        });
        console.log("[dublê] webhook entregue");
      } catch (e) {
        console.log("[dublê] webhook falhou:", e.message);
      }
    }

    const destino = new URL(pedido.redirect_url ?? "/");
    destino.searchParams.set("order_nsu", pedido.order_nsu);
    destino.searchParams.set("transaction_nsu", transacao);
    destino.searchParams.set("slug", fatura);
    destino.searchParams.set("capture_method", meio);
    destino.searchParams.set("receipt_url", `http://localhost:${PORTA}/comprovante/${fatura}`);
    res.writeHead(302, { Location: destino.toString() });
    return res.end();
  }

  if (url.pathname.startsWith("/comprovante/")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(
      `<meta charset="utf-8"><body style="font:16px system-ui;padding:40px">
       <h1>Comprovante de mentira</h1><p>${url.pathname.split("/").pop()}</p>`
    );
  }

  res.writeHead(404);
  res.end();
});

servidor.listen(PORTA, () => {
  console.log(`[dublê] InfinitePay de mentira em http://localhost:${PORTA}`);
  console.log("[dublê] aponte INFINITEPAY_BASE para cá no .env.local");
});
