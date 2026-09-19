import { randomBytes, randomUUID } from "node:crypto";
import { db, emTransacao } from "@/lib/db";
import {
  ErroInfinitePay,
  conferirPagamento,
  criarLinkPagamento,
} from "@/lib/infinitepay";

/**
 * Reserva de horário e confirmação de pagamento.
 *
 * A ORDEM DAS COISAS aqui é o que segura o sistema de pé:
 *
 *   1. transação CURTA — toma a vaga, grava a reserva pendente, commita;
 *   2. FORA da transação — chama a InfinitePay;
 *   3. deu certo, guarda a URL; deu errado, devolve a vaga na hora.
 *
 * O passo 2 nunca pode acontecer dentro do passo 1. Uma chamada HTTP com
 * transação aberta segura uma conexão do pool pelo tempo do round-trip;
 * algumas simultâneas esgotam o pool e o site INTEIRO para de responder — não
 * só o checkout.
 */

/** Tempo que a vaga fica presa enquanto a pessoa paga. */
export const MINUTOS_DE_HOLD = 20;

export type FalhaReserva =
  | "esgotado"
  | "horario_invalido"
  | "pagamento_indisponivel";

export type ResultadoReserva =
  | { ok: true; token: string; urlPagamento: string }
  | { ok: false; motivo: FalhaReserva; mensagem: string };

function novoToken(): string {
  // 32 bytes: o token é o único segredo que protege a rota do webhook, que a
  // InfinitePay não assina.
  return randomBytes(32).toString("hex");
}

export async function criarReserva(dados: {
  horarioId: number;
  nome: string;
  email: string;
  whatsapp: string;
  /** Origem absoluta do site, ex.: https://belaceramica.prismax.tech */
  origem: string;
}): Promise<ResultadoReserva> {
  const token = novoToken();
  const orderNsu = randomUUID();

  let reservaId: string;
  let valorCentavos: number;
  let descricao: string;

  try {
    const criado = await emTransacao(async (cx) => {
      // Tomar a vaga e ler o preço num statement só. `rowCount = 0` cobre
      // esgotado, despublicado e horário já passado sem precisar distinguir —
      // para quem reserva, os três significam "escolha outro".
      const vaga = await cx.query(
        `update horarios h set ocupadas = h.ocupadas + 1
           from servicos s
          where h.id = $1
            and s.id = h.servico_id
            and h.publicado
            and s.ativo
            and h.ocupadas < h.vagas
            and h.inicio > now()
        returning h.id, h.inicio, s.nome, s.preco_centavos`,
        [dados.horarioId]
      );

      if (vaga.rowCount === 0) return null;
      const h = vaga.rows[0];

      // O valor é congelado na reserva: se a Isabela mudar o preço pelo painel
      // enquanto alguém está pagando, vale o que foi mostrado a essa pessoa.
      const reserva = await cx.query(
        `insert into reservas
           (horario_id, nome, email, whatsapp, valor_centavos, token, expira_em)
         values ($1, $2, $3, $4, $5, $6, now() + make_interval(mins => $7::int))
         returning id`,
        [
          dados.horarioId,
          dados.nome,
          dados.email,
          dados.whatsapp,
          Number(h.preco_centavos),
          token,
          MINUTOS_DE_HOLD,
        ]
      );

      await cx.query(
        `insert into pagamentos (reserva_id, order_nsu, valor_centavos)
         values ($1, $2, $3)`,
        [reserva.rows[0].id, orderNsu, Number(h.preco_centavos)]
      );

      return {
        id: reserva.rows[0].id as string,
        valor: Number(h.preco_centavos),
        descricao: `${h.nome} — ${new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        }).format(h.inicio as Date)}`,
      };
    });

    if (!criado) {
      return {
        ok: false,
        motivo: "esgotado",
        mensagem: "Esse horário acabou de ser preenchido. Escolha outro.",
      };
    }

    reservaId = criado.id;
    valorCentavos = criado.valor;
    descricao = criado.descricao;
  } catch (err) {
    console.error("[reservas] falha ao gravar a reserva:", err);
    return {
      ok: false,
      motivo: "horario_invalido",
      mensagem: "Não consegui registrar a reserva. Tente de novo.",
    };
  }

  // ── Daqui para baixo a vaga JÁ está tomada. Qualquer saída sem sucesso
  //    precisa devolvê-la, senão ela fica presa até o hold vencer. ──────────
  try {
    const { url } = await criarLinkPagamento({
      orderNsu,
      itens: [{ descricao, quantidade: 1, valorCentavos }],
      urlRetorno: `${dados.origem}/aulas/reserva/${token}`,
      urlWebhook: `${dados.origem}/api/pagamento/${token}`,
      cliente: {
        nome: dados.nome,
        email: dados.email,
        telefone: `+55${dados.whatsapp.replace(/\D/g, "")}`,
      },
    });

    await db().query(
      `update pagamentos set checkout_url = $2, atualizado_em = now()
        where reserva_id = $1`,
      [reservaId, url]
    );

    return { ok: true, token, urlPagamento: url };
  } catch (err) {
    await liberarVaga(reservaId, "cancelada").catch((e) =>
      console.error("[reservas] vaga NÃO devolvida após falha de pagamento:", e)
    );

    const infinite = err instanceof ErroInfinitePay;
    console.error(
      "[reservas] link de pagamento não criado:",
      infinite ? `${err.codigo} — ${err.message}` : err
    );

    return {
      ok: false,
      motivo: "pagamento_indisponivel",
      mensagem:
        "O pagamento está indisponível neste momento. Sua vaga não foi cobrada — tente de novo em instantes.",
    };
  }
}

/**
 * Devolve a vaga de UMA reserva, no máximo uma vez.
 *
 * O `with` é o que garante o "no máximo uma vez": o decremento só acontece se
 * a transição de status também aconteceu. Sem ele, duas varreduras
 * concorrentes decrementariam duas vezes e a vaga seria vendida em dobro.
 */
export async function liberarVaga(
  reservaId: string,
  novoStatus: "cancelada" | "expirada"
): Promise<boolean> {
  const { rowCount } = await db().query(
    `with liberada as (
       update reservas set status = $2
        where id = $1 and status = 'pendente'
      returning horario_id
     )
     update horarios h set ocupadas = h.ocupadas - 1
       from liberada l
      where h.id = l.horario_id and h.ocupadas > 0`,
    [reservaId, novoStatus]
  );
  return (rowCount ?? 0) > 0;
}

export type EstadoConfirmacao =
  | "confirmada"
  | "ja_confirmada"
  | "nao_paga"
  | "valor_divergente"
  | "paga_sem_vaga"
  | "transacao_reusada"
  | "desconhecida";

/**
 * Confirma uma reserva — a ÚNICA porta por onde um pagamento vira vaga.
 *
 * Chamada tanto pelo webhook quanto pela página de retorno, porque o webhook
 * pode chegar depois da pessoa voltar (ou não chegar). É idempotente.
 *
 * O corpo do webhook NÃO é usado como prova de nada: `transactionNsu` e
 * `slugFatura` vêm dele, mas servem só para perguntar à InfinitePay. Quem
 * responde "foi pago" é `conferirPagamento`, e o valor é conferido contra o
 * bruto (`amount`), nunca contra o líquido.
 */
export async function confirmarPagamento(params: {
  token: string;
  transactionNsu?: string | null;
  slugFatura?: string | null;
  receiptUrl?: string | null;
  bruto?: unknown;
}): Promise<EstadoConfirmacao> {
  const { rows } = await db().query(
    `select r.id, r.status, r.horario_id, r.valor_centavos, p.order_nsu
       from reservas r join pagamentos p on p.reserva_id = r.id
      where r.token = $1`,
    [params.token]
  );

  const reserva = rows[0];
  if (!reserva) return "desconhecida";
  if (reserva.status === "confirmada") return "ja_confirmada";
  if (reserva.status === "paga_sem_vaga") return "paga_sem_vaga";

  // Pergunta à InfinitePay ANTES de abrir transação: é I/O externo.
  const conferido = await conferirPagamento({
    orderNsu: reserva.order_nsu,
    transactionNsu: params.transactionNsu,
    slugFatura: params.slugFatura,
  });

  if (!conferido.pago) return "nao_paga";

  const esperado = Number(reserva.valor_centavos);
  if (conferido.valorCentavos === null || conferido.valorCentavos < esperado) {
    console.error(
      `[pagamento] valor divergente na reserva ${reserva.id}: esperado ${esperado}, cobrado ${conferido.valorCentavos}`
    );
    return "valor_divergente";
  }

  try {
    return await emTransacao(async (cx) => {
      // `for update` resolve a corrida entre webhook e página de retorno sem
      // lock nenhum por fora: quem chegar segundo espera e vê o estado final.
      const atual = await cx.query(
        `select status, horario_id from reservas where id = $1 for update`,
        [reserva.id]
      );
      const status = atual.rows[0]?.status as string | undefined;
      if (status === "confirmada") return "ja_confirmada" as const;
      if (status === "paga_sem_vaga") return "paga_sem_vaga" as const;

      // Pagou depois do hold vencer: a vaga foi devolvida e pode ter sido
      // vendida. Tenta retomá-la.
      let semVaga = false;
      if (status === "expirada" || status === "cancelada") {
        const retomada = await cx.query(
          `update horarios set ocupadas = ocupadas + 1
            where id = $1 and ocupadas < vagas returning id`,
          [atual.rows[0].horario_id]
        );
        semVaga = retomada.rowCount === 0;
      }

      await cx.query(
        `update reservas
            set status = $2,
                confirmada_em = now()
          where id = $1`,
        [reserva.id, semVaga ? "paga_sem_vaga" : "confirmada"]
      );

      // `unique (transaction_nsu)` mora aqui: se esta transação da InfinitePay
      // já confirmou outra reserva, o insert falha com 23505 e TUDO volta
      // atrás. É o que impede alguém de reaproveitar o comprovante de uma
      // compra legítima para liberar a reserva de outra pessoa.
      await cx.query(
        `update pagamentos
            set status = 'pago',
                transaction_nsu = coalesce($2, transaction_nsu),
                slug_fatura = coalesce($3, slug_fatura),
                receipt_url = coalesce($4, receipt_url),
                capture_method = coalesce($5, capture_method),
                bruto = coalesce($6::jsonb, bruto),
                atualizado_em = now()
          where reserva_id = $1`,
        [
          reserva.id,
          params.transactionNsu ?? null,
          params.slugFatura ?? null,
          params.receiptUrl ?? null,
          conferido.meio,
          params.bruto ? JSON.stringify(params.bruto) : null,
        ]
      );

      if (semVaga) {
        console.error(
          `[pagamento] reserva ${reserva.id} PAGA SEM VAGA — precisa de remarcação manual.`
        );
      }

      return semVaga ? ("paga_sem_vaga" as const) : ("confirmada" as const);
    });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "23505") {
      console.error(
        `[pagamento] transaction_nsu reusado contra a reserva ${reserva.id} — recusado.`
      );
      return "transacao_reusada";
    }
    throw err;
  }
}

export type ReservaPublica = {
  token: string;
  status: string;
  nome: string;
  valorCentavos: number;
  inicio: Date;
  duracaoMin: number;
  servico: string;
  receiptUrl: string | null;
  expiraEm: Date;
};

export async function reservaPorToken(
  token: string
): Promise<ReservaPublica | null> {
  const { rows } = await db().query(
    `select r.token, r.status, r.nome, r.valor_centavos, r.expira_em,
            h.inicio, s.nome as servico, s.duracao_min, p.receipt_url
       from reservas r
       join horarios h on h.id = r.horario_id
       join servicos s on s.id = h.servico_id
       left join pagamentos p on p.reserva_id = r.id
      where r.token = $1`,
    [token]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    token: r.token,
    status: r.status,
    nome: r.nome,
    valorCentavos: Number(r.valor_centavos),
    inicio: r.inicio as Date,
    duracaoMin: Number(r.duracao_min),
    servico: r.servico,
    receiptUrl: r.receipt_url,
    expiraEm: r.expira_em as Date,
  };
}
