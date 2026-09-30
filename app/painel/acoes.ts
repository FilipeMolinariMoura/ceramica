"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cancelarPacote as cancelarPacoteNoBanco, liberarVaga } from "@/lib/reservas";
import { TURMAS } from "@/lib/constants";
import {
  autenticar,
  criarSessao,
  encerrarSessao,
  exigirSessao,
  limparTentativas,
  podeTentarLogin,
  registrarTentativa,
} from "@/lib/auth";

/**
 * Ações do painel.
 *
 * TODA ação aqui começa com `exigirSessao()` — menos `entrar`, obviamente.
 * Não é paranoia: cada Server Action vira um endpoint POST próprio, que pode
 * ser chamado direto, sem passar pelo `middleware.ts` que protege as páginas.
 * Esquecer a linha numa única ação abre aquela ação para o mundo inteiro.
 */

async function ipAtual(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
}

export async function entrar(
  _anterior: { erro?: string } | null,
  form: FormData
): Promise<{ erro?: string }> {
  const ip = await ipAtual();

  if (!(await podeTentarLogin(ip))) {
    return { erro: "Muitas tentativas. Espere 15 minutos." };
  }

  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const de = String(form.get("de") ?? "/painel");

  const usuario = await autenticar(email, senha);
  if (!usuario) {
    await registrarTentativa(ip);
    // Mensagem única para e-mail errado e senha errada: dizer qual dos dois
    // falhou entrega quais endereços têm conta.
    return { erro: "E-mail ou senha incorretos." };
  }

  await limparTentativas(ip);
  await criarSessao(usuario.id);

  // Só aceita destino interno: `de` vem da query string, e um `//site.com`
  // ali transformaria o login numa rampa de phishing.
  redirect(de.startsWith("/painel") ? de : "/painel");
}

export async function sair(): Promise<void> {
  await exigirSessao();
  await encerrarSessao();
  redirect("/painel/entrar");
}

/* ── Agenda ────────────────────────────────────────────────────────────── */

export async function abrirHorario(form: FormData): Promise<void> {
  await exigirSessao();

  const servicoId = Number(form.get("servicoId"));
  const data = String(form.get("data") ?? "");
  const hora = String(form.get("hora") ?? "");
  const vagas = Number(form.get("vagas"));

  if (!Number.isInteger(servicoId) || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
  if (!/^\d{2}:\d{2}$/.test(hora) || !Number.isInteger(vagas) || vagas < 1) return;

  // A conversão para instante acontece no POSTGRES, com `at time zone`, a
  // partir da data e hora que a Isabela digitou. O contêiner roda em UTC: se
  // o JavaScript montasse a data, um horário de 10h viraria 10h UTC, ou
  // seja, 7h em Brasília.
  //
  // `greatest` nas vagas: reabrir um horário com MENOS vagas do que as já
  // vendidas estouraria o CHECK e a ação quebraria. Assim ela só não reduz
  // abaixo de quem já pagou.
  await db().query(
    `insert into horarios (servico_id, inicio, vagas)
     values ($1, ($2::date + $3::time) at time zone 'America/Sao_Paulo', $4)
     on conflict (servico_id, inicio) do update
       set vagas = greatest(excluded.vagas, horarios.ocupadas), publicado = true`,
    [servicoId, data, hora, vagas]
  );

  revalidatePath("/painel/agenda");
  revalidatePath("/aulas");
}

/**
 * Abre as terças de várias semanas de uma vez, nos horários das turmas.
 *
 * A mensal só vende quando há quatro terças seguidas abertas; abrir uma por
 * uma, pelo formulário de horário avulso, seria o jeito de ela nunca vender.
 *
 * `do nothing` no conflito, e não `do update`: uma terça que a Isabela tirou
 * do ar de propósito (feriado, viagem) não pode voltar sozinha porque ela
 * abriu as próximas semanas.
 */
export async function abrirTercasEmLote(form: FormData): Promise<void> {
  await exigirSessao();

  const servicoId = Number(form.get("servicoId"));
  const aPartir = String(form.get("aPartir") ?? "");
  const semanas = Number(form.get("semanas"));
  const vagas = Number(form.get("vagas"));
  const horas = TURMAS.filter((t) => form.get(`turma-${t.id}`) === "on").map((t) => t.inicio);

  if (!Number.isInteger(servicoId) || !/^\d{4}-\d{2}-\d{2}$/.test(aPartir)) return;
  if (!Number.isInteger(semanas) || semanas < 1 || semanas > 12) return;
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > 20 || horas.length === 0) return;

  await db().query(
    `insert into horarios (servico_id, inicio, vagas)
     select $1, (d::date + t::time) at time zone 'America/Sao_Paulo', $4
       from generate_series($2::date, $2::date + ($3::int * 7 - 1), interval '1 day') as d
      cross join unnest($5::text[]) as t
      where extract(isodow from d) = 2
        and (d::date + t::time) at time zone 'America/Sao_Paulo' > now()
     on conflict (servico_id, inicio) do nothing`,
    [servicoId, aPartir, semanas, vagas, horas]
  );

  revalidatePath("/painel/agenda");
  revalidatePath("/", "layout");
}

export async function fecharHorario(form: FormData): Promise<void> {
  await exigirSessao();
  const id = Number(form.get("horarioId"));
  if (!Number.isInteger(id)) return;

  // Despublicar, e não apagar: apagar um horário com reserva paga em cima
  // apagaria a aula de alguém que pagou. `publicado = false` tira da vitrine
  // e deixa quem já reservou com a reserva de pé.
  await db().query(`update horarios set publicado = false where id = $1`, [id]);

  revalidatePath("/painel/agenda");
  revalidatePath("/aulas");
}

export async function reabrirHorario(form: FormData): Promise<void> {
  await exigirSessao();
  const id = Number(form.get("horarioId"));
  if (!Number.isInteger(id)) return;
  await db().query(`update horarios set publicado = true where id = $1`, [id]);
  revalidatePath("/painel/agenda");
  revalidatePath("/aulas");
}

/* ── Serviços ──────────────────────────────────────────────────────────── */

export async function salvarServico(form: FormData): Promise<void> {
  await exigirSessao();

  const id = Number(form.get("servicoId"));
  if (!Number.isInteger(id) || id <= 0) return;

  // O valor chega em REAIS, porque é assim que ela pensa, e é convertido para
  // centavos aqui. Guardar em centavos é o que impede a aritmética de ponto
  // flutuante de transformar R$ 250,00 em R$ 249,99 no caminho até o cobrador.
  const emReais = (campo: string) =>
    Number(String(form.get(campo) ?? "").trim().replace(",", "."));
  const reais = emReais("preco");
  const duracao = Number(form.get("duracao"));
  const vagas = Number(form.get("vagas"));
  // Preço no cartão: só existe no formulário da mensal. Vazio = um preço só.
  const temCartao = form.has("precoCartao") && String(form.get("precoCartao")).trim() !== "";
  const cartao = temCartao ? emReais("precoCartao") : null;

  if (!Number.isFinite(reais) || reais < 0 || reais > 100_000) return;
  if (!Number.isInteger(duracao) || duracao < 15 || duracao > 600) return;
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > 50) return;
  if (cartao !== null && (!Number.isFinite(cartao) || cartao < reais || cartao > 100_000)) return;

  await db().query(
    `update servicos
        set preco_centavos = $2, duracao_min = $3, vagas_padrao = $4,
            preco_cartao_centavos = case when $5::boolean then $6::int else preco_cartao_centavos end
      where id = $1`,
    [
      id,
      Math.round(reais * 100),
      duracao,
      vagas,
      form.has("precoCartao"),
      cartao === null ? null : Math.round(cartao * 100),
    ]
  );

  // O preço aparece na home, na página de aulas e nas portas.
  revalidatePath("/", "layout");
  revalidatePath("/painel/agenda");
}

/* ── Reservas ──────────────────────────────────────────────────────────── */

export async function cancelarReserva(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("reservaId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  const { rows } = await db().query(
    `select status, pacote_id from reservas where id = $1`,
    [id]
  );
  const status = rows[0]?.status;

  // Aula de pacote AINDA NÃO PAGO não se cancela sozinha: o pagamento do
  // pacote, se chegar, tentaria retomá-la. Cancela-se o pacote inteiro.
  if (rows[0]?.pacote_id && status === "pendente") return;

  if (status === "pendente") {
    // Devolve a vaga junto, num statement só.
    await liberarVaga(id, "cancelada");
  } else if (status === "confirmada") {
    // Confirmada é reserva PAGA. Cancelar aqui só muda o estado no painel —
    // o dinheiro tem de voltar pela InfinitePay, à mão. Por isso a vaga é
    // devolvida explicitamente e o motivo fica registrado.
    await db().query(
      `with cancelada as (
         update reservas
            set status = 'cancelada',
                observacao = coalesce(observacao || ' | ', '') || 'cancelada no painel — estornar pela InfinitePay'
          where id = $1 and status = 'confirmada'
        returning horario_id
       )
       update horarios h set ocupadas = h.ocupadas - 1
         from cancelada c where h.id = c.horario_id and h.ocupadas > 0`,
      [id]
    );
  }

  revalidatePath("/painel");
  revalidatePath("/aulas");
}

export async function cancelarPacote(form: FormData): Promise<void> {
  await exigirSessao();
  const id = String(form.get("pacoteId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  await cancelarPacoteNoBanco(id);

  revalidatePath("/painel");
  revalidatePath("/painel/agenda");
  revalidatePath("/", "layout");
}
