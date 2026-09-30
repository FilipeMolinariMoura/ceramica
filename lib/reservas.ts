import { randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { db, emTransacao } from "@/lib/db";
import {
  ErroInfinitePay,
  conferirPagamento,
  criarLinkPagamento,
} from "@/lib/infinitepay";
import {
  codigoPg,
  diaCurto,
  horaCurta,
  montarPacotes,
  reais,
  type Horario,
} from "@/lib/agenda";
import {
  SERVICO_AULA_AVULSA,
  SERVICO_TURMA_MENSAL,
  TURMAS,
  type TurmaId,
} from "@/lib/constants";

/**
 * Reserva de horário, compra de pacote e confirmação de pagamento.
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
 *
 * ── A ordem das travas ────────────────────────────────────────────────────
 * Quem trava mais de uma coisa trava sempre na mesma ordem, e é isso que
 * impede duas compras de se esperarem para sempre:
 *
 *   pacote → reservas (por id) → horários (por id)
 *
 * A compra do pacote trava os quatro horários ordenados por id; a
 * confirmação trava o pacote, depois as filhas, depois o horário que precisar
 * retomar. A varredura de expiração pula o que estiver travado.
 */

/** Tempo que a vaga fica presa enquanto a pessoa paga. */
export const MINUTOS_DE_HOLD = 20;

export type FalhaReserva =
  | "esgotado"
  | "agenda_mudou"
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

const QUANDO = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export async function criarReserva(dados: {
  horarioId: number;
  nome: string;
  email: string;
  whatsapp: string;
  /** Origem absoluta do site, ex.: https://belaceramica.prismax.tech */
  origem: string;
  /** De onde a pessoa veio (home, deep link, /aulas) — atribuição sem pixel. */
  origemLead?: string | null;
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
      //
      // O preço é SEMPRE o da aula avulsa, e não o do serviço dono do
      // horário: os horários de terça são da avulsa, mas é bom não depender
      // disso para cobrar certo.
      const vaga = await cx.query(
        `update horarios h set ocupadas = h.ocupadas + 1
           from servicos s
          where h.id = $1
            and s.id = h.servico_id
            and s.slug = $2
            and h.publicado
            and s.ativo
            and h.ocupadas < h.vagas
            and h.inicio > now()
        returning h.id, h.inicio, s.nome, s.preco_centavos`,
        [dados.horarioId, SERVICO_AULA_AVULSA]
      );

      if (vaga.rowCount === 0) return null;
      const h = vaga.rows[0];

      // O valor é congelado na reserva: se a Isabela mudar o preço pelo painel
      // enquanto alguém está pagando, vale o que foi mostrado a essa pessoa.
      const reserva = await cx.query(
        `insert into reservas
           (horario_id, nome, email, whatsapp, valor_centavos, token, expira_em, origem)
         values ($1, $2, $3, $4, $5, $6, now() + make_interval(mins => $7::int), $8)
         returning id`,
        [
          dados.horarioId,
          dados.nome,
          dados.email,
          dados.whatsapp,
          Number(h.preco_centavos),
          token,
          MINUTOS_DE_HOLD,
          dados.origemLead ?? null,
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
        descricao: `${h.nome} — ${QUANDO.format(h.inicio as Date)}`,
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
    registrarFalhaDeLink(err);
    return falhaDePagamento();
  }
}

function registrarFalhaDeLink(err: unknown) {
  const infinite = err instanceof ErroInfinitePay;
  console.error(
    "[reservas] link de pagamento não criado:",
    infinite ? `${err.codigo} — ${err.message}` : err
  );
}

function falhaDePagamento(): ResultadoReserva {
  return {
    ok: false,
    motivo: "pagamento_indisponivel",
    mensagem:
      "O pagamento está indisponível neste momento. Sua vaga não foi cobrada — tente de novo em instantes.",
  };
}

/* ── Pacote da turma mensal ────────────────────────────────────────────── */

/** Sinal interno para desfazer a transação da compra com o motivo certo. */
class RecusaPacote extends Error {
  constructor(readonly motivo: "esgotado" | "agenda_mudou") {
    super(motivo);
  }
}

/** Até onde a agenda é lida para montar pacotes — cobre com folga 4 terças. */
const DIAS_DE_PACOTE = 120;
/** A mesma margem da vitrine: não se vende aula que começa daqui a pouco. */
const MARGEM_MIN = 120;

/**
 * Compra de um pacote de terças seguidas.
 *
 * O cliente manda a turma, a terça de início e os ids das aulas que viu na
 * tela. O servidor NÃO confia nos ids: relê a agenda, monta o pacote de novo
 * com `montarPacotes` e só segue se o resultado for idêntico. Depois toma um
 * lugar em cada horário num único `update`; se não couber nos quatro, a
 * transação inteira volta. Nunca existe pacote pela metade.
 */
export async function criarPacote(dados: {
  turma: TurmaId;
  inicioId: number;
  horarioIds: number[];
  meio: "pix" | "cartao";
  nome: string;
  email: string;
  whatsapp: string;
  origem: string;
  origemLead?: string | null;
}): Promise<ResultadoReserva> {
  const token = novoToken();
  const orderNsu = randomUUID();

  let pacoteId: string;
  let valorCentavos: number;
  let descricao: string;

  const tentar = () =>
    emTransacao(async (cx) => {
      const { rows: servicos } = await cx.query(
        `select id, slug, nome, preco_centavos, preco_cartao_centavos, aulas
           from servicos where slug = any($1) and ativo`,
        [[SERVICO_AULA_AVULSA, SERVICO_TURMA_MENSAL]]
      );
      const avulsa = servicos.find((s) => s.slug === SERVICO_AULA_AVULSA);
      const mensal = servicos.find((s) => s.slug === SERVICO_TURMA_MENSAL);
      if (!avulsa || !mensal) throw new RecusaPacote("agenda_mudou");

      const aulas = Number(mensal.aulas);
      const valor =
        dados.meio === "cartao"
          ? Number(mensal.preco_cartao_centavos ?? mensal.preco_centavos)
          : Number(mensal.preco_centavos);

      // A agenda relida AGORA, e o pacote remontado com ela.
      const { rows } = await cx.query(
        `select id, inicio, vagas, ocupadas from horarios
          where servico_id = $1 and publicado
            and inicio > now() + make_interval(mins => $2::int)
            and inicio < now() + make_interval(days => $3::int)
          order by inicio`,
        [avulsa.id, MARGEM_MIN, DIAS_DE_PACOTE]
      );
      const agenda: Horario[] = rows.map((r) => ({
        id: Number(r.id),
        inicio: r.inicio as Date,
        vagas: Number(r.vagas),
        ocupadas: Number(r.ocupadas),
        restantes: Math.max(Number(r.vagas) - Number(r.ocupadas), 0),
      }));

      const opcao = montarPacotes(agenda, dados.turma, aulas).find(
        (o) => o.inicioId === dados.inicioId
      );
      const mesmasDatas =
        opcao !== undefined &&
        opcao.ids.length === dados.horarioIds.length &&
        opcao.ids.every((id, i) => id === dados.horarioIds[i]);

      if (!opcao || !mesmasDatas) throw new RecusaPacote("agenda_mudou");
      if (!opcao.disponivel) throw new RecusaPacote("esgotado");

      // Trava os horários em ordem de id — a mesma ordem em toda compra, para
      // dois pacotes com terças em comum não se esperarem em círculo.
      await cx.query(
        `select id from horarios where id = any($1) order by id for update`,
        [opcao.ids]
      );

      const tomada = await cx.query(
        `update horarios set ocupadas = ocupadas + 1
          where id = any($1)
            and publicado
            and ocupadas < vagas
            and inicio > now()`,
        [opcao.ids]
      );
      if (tomada.rowCount !== opcao.ids.length) throw new RecusaPacote("esgotado");

      const pacote = await cx.query(
        `insert into pacotes
           (servico_id, turma, nome, email, whatsapp, meio, valor_centavos,
            token, expira_em, origem)
         values ($1, $2, $3, $4, $5, $6, $7, $8,
                 now() + make_interval(mins => $9::int), $10)
         returning id, expira_em`,
        [
          mensal.id,
          dados.turma,
          dados.nome,
          dados.email,
          dados.whatsapp,
          dados.meio,
          valor,
          token,
          MINUTOS_DE_HOLD,
          dados.origemLead ?? null,
        ]
      );
      const id = pacote.rows[0].id as string;

      // As filhas: uma reserva comum por aula, valor zero (o dinheiro é do
      // pacote) e um token só para cumprir o `unique` — ele nunca sai daqui.
      for (const horarioId of opcao.ids) {
        await cx.query(
          `insert into reservas
             (horario_id, pacote_id, nome, email, whatsapp, valor_centavos,
              token, expira_em, origem)
           values ($1, $2, $3, $4, $5, 0, $6, $7, $8)`,
          [
            horarioId,
            id,
            dados.nome,
            dados.email,
            dados.whatsapp,
            novoToken(),
            pacote.rows[0].expira_em,
            dados.origemLead ?? null,
          ]
        );
      }

      await cx.query(
        `insert into pagamentos (pacote_id, order_nsu, valor_centavos)
         values ($1, $2, $3)`,
        [id, orderNsu, valor]
      );

      const turma = TURMAS.find((t) => t.id === dados.turma)!;
      return {
        id,
        valor,
        descricao: `${mensal.nome} · ${turma.periodo.toLowerCase()} ${horaCurta(
          opcao.inicios[0]!
        )} · ${opcao.inicios.map(diaCurto).join(", ")} · ${
          dados.meio === "pix" ? "valor Pix" : "valor cartão"
        }`,
      };
    });

  try {
    let criado;
    try {
      criado = await tentar();
    } catch (err) {
      // Deadlock com a varredura de expiração: o Postgres derrubou uma das
      // duas, e se foi esta, uma segunda tentativa resolve.
      if (codigoPg(err) !== "40P01") throw err;
      criado = await tentar();
    }
    pacoteId = criado.id;
    valorCentavos = criado.valor;
    descricao = criado.descricao;
  } catch (err) {
    if (err instanceof RecusaPacote) {
      return err.motivo === "esgotado"
        ? {
            ok: false,
            motivo: "esgotado",
            mensagem: "Uma das terças desse pacote acabou de lotar. Escolha outro início.",
          }
        : {
            ok: false,
            motivo: "agenda_mudou",
            mensagem: "A agenda mudou enquanto você escolhia. Veja as datas de novo.",
          };
    }
    console.error("[reservas] falha ao gravar o pacote:", err);
    return {
      ok: false,
      motivo: "horario_invalido",
      mensagem: "Não consegui registrar a reserva. Tente de novo.",
    };
  }

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
        where pacote_id = $1`,
      [pacoteId, url]
    );

    return { ok: true, token, urlPagamento: url };
  } catch (err) {
    await liberarPacote(pacoteId, "cancelada").catch((e) =>
      console.error("[reservas] vagas do pacote NÃO devolvidas após falha:", e)
    );
    registrarFalhaDeLink(err);
    return falhaDePagamento();
  }
}

/**
 * Devolve a vaga de UMA reserva avulsa, no máximo uma vez.
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

/**
 * Devolve os lugares de um pacote ainda não pago, no máximo uma vez.
 *
 * Só mexe em filhas `pendente`: as que a varredura já expirou já devolveram o
 * lugar delas, e devolver de novo venderia a mesma cadeira duas vezes.
 */
export async function liberarPacote(
  pacoteId: string,
  novoStatus: "cancelada" | "expirada"
): Promise<boolean> {
  return emTransacao(async (cx) => {
    const trava = await cx.query(
      `select id from pacotes where id = $1 and status = 'pendente' for update`,
      [pacoteId]
    );
    if (trava.rowCount === 0) return false;

    await cx.query(`update pacotes set status = $2 where id = $1`, [pacoteId, novoStatus]);
    await devolverFilhas(cx, pacoteId, novoStatus, "pendente");
    return true;
  });
}

/** Muda o status das filhas num estado e devolve o lugar de cada uma. */
async function devolverFilhas(
  cx: PoolClient,
  pacoteId: string,
  novoStatus: string,
  deStatus: "pendente" | "confirmada",
  observacao?: string
) {
  // Cada filha é de um horário diferente (índice único), então aqui não há o
  // problema de `update ... from` com linhas repetidas que a varredura tem.
  await cx.query(
    `with filhas as (
       select id from reservas
        where pacote_id = $1 and status = $3
        order by id
        for update
     ), mudadas as (
       update reservas r
          set status = $2,
              observacao = case when $4::text is null then r.observacao
                                else coalesce(r.observacao || ' | ', '') || $4 end
         from filhas f
        where r.id = f.id
       returning r.horario_id
     )
     update horarios h set ocupadas = h.ocupadas - 1
       from mudadas m
      where h.id = m.horario_id and h.ocupadas > 0`,
    [pacoteId, novoStatus, deStatus, observacao ?? null]
  );
}

/**
 * Cancela um pacote pelo painel. Pendente: devolve os lugares. Confirmado: a
 * pessoa PAGOU — cancela as aulas, devolve os lugares e deixa registrado que o
 * estorno é feito à mão, pela InfinitePay.
 */
export async function cancelarPacote(pacoteId: string): Promise<void> {
  await emTransacao(async (cx) => {
    const { rows } = await cx.query(
      `select status from pacotes where id = $1 for update`,
      [pacoteId]
    );
    const status = rows[0]?.status as string | undefined;
    if (status === "pendente") {
      await cx.query(`update pacotes set status = 'cancelada' where id = $1`, [pacoteId]);
      await devolverFilhas(cx, pacoteId, "cancelada", "pendente");
    } else if (status === "confirmada" || status === "paga_sem_vaga") {
      const nota = "cancelada no painel — estornar pela InfinitePay";
      await cx.query(
        `update pacotes
            set status = 'cancelada',
                observacao = coalesce(observacao || ' | ', '') || $2
          where id = $1`,
        [pacoteId, nota]
      );
      await devolverFilhas(cx, pacoteId, "cancelada", "confirmada", nota);
      // Aula paga sem vaga não ocupa lugar: só muda de estado.
      await cx.query(
        `update reservas set status = 'cancelada'
          where pacote_id = $1 and status = 'paga_sem_vaga'`,
        [pacoteId]
      );
    }
  });
}

export type EstadoConfirmacao =
  | "confirmada"
  | "ja_confirmada"
  | "nao_paga"
  | "valor_divergente"
  | "paga_sem_vaga"
  | "transacao_reusada"
  | "desconhecida";

type ParamsConfirmacao = {
  token: string;
  transactionNsu?: string | null;
  slugFatura?: string | null;
  receiptUrl?: string | null;
  bruto?: unknown;
};

/**
 * Confirma uma reserva ou um pacote — a ÚNICA porta por onde um pagamento
 * vira vaga.
 *
 * Chamada tanto pelo webhook quanto pela página de retorno, porque o webhook
 * pode chegar depois da pessoa voltar (ou não chegar). É idempotente.
 *
 * O token identifica uma reserva avulsa ou um pacote; as rotas não precisam
 * saber qual dos dois.
 *
 * O corpo do webhook NÃO é usado como prova de nada: `transactionNsu` e
 * `slugFatura` vêm dele, mas servem só para perguntar à InfinitePay. Quem
 * responde "foi pago" é `conferirPagamento`, e o valor é conferido contra o
 * bruto (`amount`), nunca contra o líquido.
 */
export async function confirmarPagamento(
  params: ParamsConfirmacao
): Promise<EstadoConfirmacao> {
  const { rows } = await db().query(
    `select r.id, r.status, r.horario_id, r.valor_centavos, p.order_nsu
       from reservas r join pagamentos p on p.reserva_id = r.id
      where r.token = $1 and r.pacote_id is null`,
    [params.token]
  );

  const reserva = rows[0];
  if (!reserva) return confirmarPacote(params);
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
        semVaga = !(await retomarLugar(cx, atual.rows[0].horario_id));
      }

      await cx.query(
        `update reservas
            set status = $2,
                confirmada_em = now()
          where id = $1`,
        [reserva.id, semVaga ? "paga_sem_vaga" : "confirmada"]
      );

      await gravarPagamento(cx, "reserva_id", reserva.id, params, conferido.meio);

      if (semVaga) {
        console.error(
          `[pagamento] reserva ${reserva.id} PAGA SEM VAGA — precisa de remarcação manual.`
        );
      }

      return semVaga ? ("paga_sem_vaga" as const) : ("confirmada" as const);
    });
  } catch (err) {
    if (codigoPg(err) === "23505") {
      console.error(
        `[pagamento] transaction_nsu reusado contra a reserva ${reserva.id} — recusado.`
      );
      return "transacao_reusada";
    }
    throw err;
  }
}

/**
 * Confirma o pacote e as aulas dele.
 *
 * A retomada é AULA POR AULA: se o pagamento chegou depois do hold e, nesse
 * meio-tempo, alguém ficou com o lugar de uma das terças, só aquela aula vira
 * `paga_sem_vaga`. As outras três seguem confirmadas, e o painel mostra qual
 * precisa ser remarcada.
 *
 * Divergência de meio — a pessoa escolheu Pix no site e pagou no cartão, na
 * tela da InfinitePay, que não deixa travar o meio — NÃO recusa nada: o
 * dinheiro entrou, e recusar deixaria alguém que pagou sem aula. Fica anotado
 * no pacote, e o painel mostra a diferença para a Isabela decidir.
 */
async function confirmarPacote(params: ParamsConfirmacao): Promise<EstadoConfirmacao> {
  const { rows } = await db().query(
    `select pk.id, pk.status, pk.valor_centavos, pk.meio,
            s.preco_centavos, s.preco_cartao_centavos, p.order_nsu
       from pacotes pk
       join servicos s on s.id = pk.servico_id
       join pagamentos p on p.pacote_id = pk.id
      where pk.token = $1`,
    [params.token]
  );

  const pacote = rows[0];
  if (!pacote) return "desconhecida";
  if (pacote.status === "confirmada") return "ja_confirmada";
  if (pacote.status === "paga_sem_vaga") return "paga_sem_vaga";

  const conferido = await conferirPagamento({
    orderNsu: pacote.order_nsu,
    transactionNsu: params.transactionNsu,
    slugFatura: params.slugFatura,
  });

  if (!conferido.pago) return "nao_paga";

  const esperado = Number(pacote.valor_centavos);
  if (conferido.valorCentavos === null || conferido.valorCentavos < esperado) {
    console.error(
      `[pagamento] valor divergente no pacote ${pacote.id}: esperado ${esperado}, cobrado ${conferido.valorCentavos}`
    );
    return "valor_divergente";
  }

  // Qualquer meio que não seja Pix conta como cartão (crédito, débito…).
  let nota: string | null = null;
  if (pacote.meio === "pix" && conferido.meio && conferido.meio !== "pix") {
    const cartao = Number(pacote.preco_cartao_centavos ?? pacote.preco_centavos);
    const diferenca = Math.max(cartao - esperado, 0);
    nota = `escolheu Pix e pagou no cartão (${conferido.meio}) — diferença de ${reais(diferenca)}`;
  }

  try {
    return await emTransacao(async (cx) => {
      const atual = await cx.query(
        `select status from pacotes where id = $1 for update`,
        [pacote.id]
      );
      const status = atual.rows[0]?.status as string | undefined;
      if (status === "confirmada") return "ja_confirmada" as const;
      if (status === "paga_sem_vaga") return "paga_sem_vaga" as const;

      const { rows: filhas } = await cx.query(
        `select id, status, horario_id from reservas
          where pacote_id = $1 order by id for update`,
        [pacote.id]
      );

      let faltouLugar = false;
      for (const f of filhas) {
        if (f.status === "confirmada" || f.status === "paga_sem_vaga") continue;

        let temLugar = true;
        if (f.status === "expirada" || f.status === "cancelada") {
          temLugar = await retomarLugar(cx, f.horario_id);
        }
        if (!temLugar) faltouLugar = true;

        await cx.query(
          `update reservas set status = $2, confirmada_em = now() where id = $1`,
          [f.id, temLugar ? "confirmada" : "paga_sem_vaga"]
        );
      }

      await cx.query(
        `update pacotes
            set status = $2,
                confirmada_em = now(),
                observacao = case when $3::text is null then observacao
                                  else coalesce(observacao || ' | ', '') || $3 end
          where id = $1`,
        [pacote.id, faltouLugar ? "paga_sem_vaga" : "confirmada", nota]
      );

      await gravarPagamento(cx, "pacote_id", pacote.id, params, conferido.meio);

      if (faltouLugar) {
        console.error(
          `[pagamento] pacote ${pacote.id} pago com aula SEM VAGA — remarcar à mão.`
        );
      }

      return faltouLugar ? ("paga_sem_vaga" as const) : ("confirmada" as const);
    });
  } catch (err) {
    if (codigoPg(err) === "23505") {
      console.error(
        `[pagamento] transaction_nsu reusado contra o pacote ${pacote.id} — recusado.`
      );
      return "transacao_reusada";
    }
    throw err;
  }
}

/** Tenta pegar de volta um lugar que já tinha sido devolvido. */
async function retomarLugar(cx: PoolClient, horarioId: unknown): Promise<boolean> {
  const retomada = await cx.query(
    `update horarios set ocupadas = ocupadas + 1
      where id = $1 and ocupadas < vagas returning id`,
    [horarioId]
  );
  return (retomada.rowCount ?? 0) > 0;
}

/**
 * `unique (transaction_nsu)` mora aqui: se esta transação da InfinitePay já
 * confirmou outra reserva ou outro pacote, o update falha com 23505 e TUDO
 * volta atrás. É o que impede alguém de reaproveitar o comprovante de uma
 * compra legítima para liberar a compra de outra pessoa.
 */
async function gravarPagamento(
  cx: PoolClient,
  dono: "reserva_id" | "pacote_id",
  id: string,
  params: ParamsConfirmacao,
  meio: string | null
) {
  await cx.query(
    `update pagamentos
        set status = 'pago',
            transaction_nsu = coalesce($2, transaction_nsu),
            slug_fatura = coalesce($3, slug_fatura),
            receipt_url = coalesce($4, receipt_url),
            capture_method = coalesce($5, capture_method),
            bruto = coalesce($6::jsonb, bruto),
            atualizado_em = now()
      where ${dono} = $1`,
    [
      id,
      params.transactionNsu ?? null,
      params.slugFatura ?? null,
      params.receiptUrl ?? null,
      meio,
      params.bruto ? JSON.stringify(params.bruto) : null,
    ]
  );
}

/* ── Leitura pública (página de retorno e .ics) ────────────────────────── */

export type AulaDaReserva = { inicio: Date; status: string };

export type ReservaPublica = {
  tipo: "avulsa" | "mensal";
  token: string;
  status: string;
  nome: string;
  valorCentavos: number;
  /** A primeira aula — a da avulsa, ou a que abre o pacote. */
  inicio: Date;
  aulas: AulaDaReserva[];
  duracaoMin: number;
  servico: string;
  turma: TurmaId | null;
  meio: "pix" | "cartao" | null;
  receiptUrl: string | null;
  checkoutUrl: string | null;
  expiraEm: Date;
};

export async function reservaPorToken(
  token: string
): Promise<ReservaPublica | null> {
  const { rows } = await db().query(
    `select r.token, r.status, r.nome, r.valor_centavos, r.expira_em,
            h.inicio, s.nome as servico, s.duracao_min, p.receipt_url, p.checkout_url
       from reservas r
       join horarios h on h.id = r.horario_id
       join servicos s on s.id = h.servico_id
       left join pagamentos p on p.reserva_id = r.id
      where r.token = $1 and r.pacote_id is null`,
    [token]
  );
  const r = rows[0];
  if (r) {
    return {
      tipo: "avulsa",
      token: r.token,
      status: r.status,
      nome: r.nome,
      valorCentavos: Number(r.valor_centavos),
      inicio: r.inicio as Date,
      aulas: [{ inicio: r.inicio as Date, status: r.status }],
      duracaoMin: Number(r.duracao_min),
      servico: r.servico,
      turma: null,
      meio: null,
      receiptUrl: r.receipt_url,
      checkoutUrl: r.checkout_url,
      expiraEm: r.expira_em as Date,
    };
  }

  const { rows: pk } = await db().query(
    `select pk.id, pk.token, pk.status, pk.nome, pk.valor_centavos, pk.expira_em,
            pk.turma, pk.meio, s.nome as servico, s.duracao_min,
            p.receipt_url, p.checkout_url
       from pacotes pk
       join servicos s on s.id = pk.servico_id
       left join pagamentos p on p.pacote_id = pk.id
      where pk.token = $1`,
    [token]
  );
  const pacote = pk[0];
  if (!pacote) return null;

  const { rows: aulas } = await db().query(
    `select h.inicio, r.status
       from reservas r join horarios h on h.id = r.horario_id
      where r.pacote_id = $1
      order by h.inicio`,
    [pacote.id]
  );

  return {
    tipo: "mensal",
    token: pacote.token,
    status: pacote.status,
    nome: pacote.nome,
    valorCentavos: Number(pacote.valor_centavos),
    inicio: (aulas[0]?.inicio as Date) ?? new Date(),
    aulas: aulas.map((a) => ({ inicio: a.inicio as Date, status: a.status })),
    duracaoMin: Number(pacote.duracao_min),
    servico: pacote.servico,
    turma: pacote.turma,
    meio: pacote.meio,
    receiptUrl: pacote.receipt_url,
    checkoutUrl: pacote.checkout_url,
    expiraEm: pacote.expira_em as Date,
  };
}
