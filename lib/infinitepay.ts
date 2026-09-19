/**
 * Cliente do Checkout da InfinitePay.
 *
 * A API não usa chave: quem identifica a conta é o `handle` (o InfiniteTag,
 * sem o `$`). É o que permitiu montar o pagamento em dias — e também é a
 * origem do maior risco do projeto, porque o webhook que ela dispara TAMBÉM
 * não é assinado.
 *
 * Por isso a regra que vale para todo este arquivo: **o corpo do webhook nunca
 * é verdade**. Ele é um gatilho. Quem decide se a reserva foi paga é
 * `conferirPagamento`, que pergunta à InfinitePay e confere o valor.
 *
 * Pré-requisito na conta da Isabela: "Checkout externo" ligado em
 * app.infinitepay.io/external-checkout. Sem isso a API responde
 * `external_checkout_not_enabled` e nenhum link é criado.
 */

/**
 * Endereço da API.
 *
 * `INFINITEPAY_BASE` existe só para apontar os testes a um dublê local e é
 * IGNORADA em produção, de propósito: uma variável de ambiente capaz de
 * redirecionar para onde mandamos os dados do pagamento seria um belo alvo —
 * bastaria alterá-la para desviar cada cobrança do ateliê.
 */
const BASE =
  process.env.NODE_ENV !== "production" && process.env.INFINITEPAY_BASE
    ? process.env.INFINITEPAY_BASE.replace(/\/+$/, "")
    : "https://api.checkout.infinitepay.io";

// A InfinitePay está no caminho crítico de uma reserva: a pessoa espera com o
// botão girando. Melhor falhar em 12s e devolver a vaga do que pendurar.
const TIMEOUT_MS = 12_000;

export type ItemCobranca = {
  descricao: string;
  quantidade: number;
  /** Em centavos — a API não aceita reais. */
  valorCentavos: number;
};

export type DadosCliente = {
  nome: string;
  email: string;
  /** Formato +55DDNNNNNNNNN. */
  telefone: string;
};

export class ErroInfinitePay extends Error {
  readonly codigo: string;
  constructor(mensagem: string, codigo: string) {
    super(mensagem);
    this.name = "ErroInfinitePay";
    this.codigo = codigo;
  }
}

export function handleConfigurado(): string | null {
  const h = process.env.INFINITEPAY_HANDLE?.trim();
  return h ? h.replace(/^\$/, "") : null;
}

async function postar(caminho: string, corpo: unknown): Promise<unknown> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    const timeout = err instanceof Error && err.name === "TimeoutError";
    throw new ErroInfinitePay(
      timeout ? "A InfinitePay não respondeu a tempo." : "Falha de rede ao falar com a InfinitePay.",
      timeout ? "timeout" : "rede"
    );
  }

  const texto = await resposta.text();
  let dados: unknown = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    throw new ErroInfinitePay("A InfinitePay respondeu algo que não é JSON.", "resposta_invalida");
  }

  if (!resposta.ok) {
    const d = (dados ?? {}) as Record<string, unknown>;
    const codigo = typeof d.error === "string" ? d.error : `http_${resposta.status}`;
    const msg = typeof d.message === "string" ? d.message : `A InfinitePay recusou (HTTP ${resposta.status}).`;
    throw new ErroInfinitePay(msg, codigo);
  }

  return dados;
}

/**
 * Cria o link de checkout e devolve a URL para onde a pessoa é mandada.
 *
 * `orderNsu` é o nosso identificador do pedido e volta em tudo — no webhook,
 * na URL de retorno e na conferência. É um uuid, nunca sequencial: sequencial
 * deixaria qualquer um enumerar as reservas pendentes das outras pessoas.
 */
export async function criarLinkPagamento(params: {
  orderNsu: string;
  itens: ItemCobranca[];
  urlRetorno: string;
  urlWebhook: string;
  cliente?: DadosCliente;
}): Promise<{ url: string }> {
  const handle = handleConfigurado();
  if (!handle) {
    throw new ErroInfinitePay(
      "INFINITEPAY_HANDLE não configurado no servidor.",
      "handle_ausente"
    );
  }

  const dados = (await postar("/links", {
    handle,
    order_nsu: params.orderNsu,
    redirect_url: params.urlRetorno,
    webhook_url: params.urlWebhook,
    items: params.itens.map((i) => ({
      description: i.descricao,
      quantity: i.quantidade,
      price: i.valorCentavos,
    })),
    ...(params.cliente
      ? {
          customer: {
            name: params.cliente.nome,
            email: params.cliente.email,
            phone_number: params.cliente.telefone,
          },
        }
      : {}),
  })) as { url?: unknown };

  // Exigir `https` é o que impede uma resposta adulterada de mandar a pessoa
  // para um checkout em texto claro. Em desenvolvimento o dublê local roda em
  // http, então a exigência vale só onde ela protege alguém de verdade.
  const exigeHttps = process.env.NODE_ENV === "production";
  const url = typeof dados?.url === "string" ? dados.url : "";
  const aceita = exigeHttps
    ? url.startsWith("https://")
    : /^https?:\/\//.test(url);

  if (!aceita) {
    throw new ErroInfinitePay("A InfinitePay não devolveu a URL do checkout.", "sem_url");
  }

  return { url };
}

export type Conferencia = {
  pago: boolean;
  /** Valor BRUTO da cobrança, em centavos — é este que vale para conferir. */
  valorCentavos: number | null;
  /** Valor líquido informado pela InfinitePay; serve só para conciliação. */
  valorLiquidoCentavos: number | null;
  parcelas: number | null;
  meio: string | null;
};

/**
 * Pergunta à InfinitePay se o pedido foi pago de verdade.
 *
 * É a única fonte de verdade sobre pagamento no sistema. Um POST forjado no
 * webhook não passa daqui, porque quem responde é a InfinitePay, não o
 * atacante.
 *
 * ATENÇÃO ao campo conferido por quem chama: use `valorCentavos` (`amount`),
 * nunca `valorLiquidoCentavos` (`paid_amount`). O líquido parece vir descontado
 * da taxa, e comparar por ele reprovaria TODA venda no crédito — erro que só
 * apareceria em produção, derrubando 100% dos pagamentos no cartão.
 */
export async function conferirPagamento(params: {
  orderNsu: string;
  transactionNsu?: string | null;
  slugFatura?: string | null;
}): Promise<Conferencia> {
  const handle = handleConfigurado();
  if (!handle) {
    throw new ErroInfinitePay(
      "INFINITEPAY_HANDLE não configurado no servidor.",
      "handle_ausente"
    );
  }

  const bruto = (await postar("/payment_check", {
    handle,
    order_nsu: params.orderNsu,
    ...(params.transactionNsu ? { transaction_nsu: params.transactionNsu } : {}),
    ...(params.slugFatura ? { slug: params.slugFatura } : {}),
  })) as Record<string, unknown>;

  const numero = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  return {
    pago: bruto.success === true && bruto.paid === true,
    valorCentavos: numero(bruto.amount),
    valorLiquidoCentavos: numero(bruto.paid_amount),
    parcelas: numero(bruto.installments),
    meio: typeof bruto.capture_method === "string" ? bruto.capture_method : null,
  };
}
