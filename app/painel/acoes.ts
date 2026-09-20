"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { liberarVaga } from "@/lib/reservas";
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
  // o JavaScript montasse a data, um horário de 9h30 viraria 9h30 UTC, ou
  // seja, 6h30 em Brasília.
  await db().query(
    `insert into horarios (servico_id, inicio, vagas)
     values ($1, ($2::date + $3::time) at time zone 'America/Sao_Paulo', $4)
     on conflict (servico_id, inicio) do update set vagas = excluded.vagas, publicado = true`,
    [servicoId, data, hora, vagas]
  );

  revalidatePath("/painel/agenda");
  revalidatePath("/aulas");
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
  const reais = Number(String(form.get("preco") ?? "").replace(",", "."));
  const duracao = Number(form.get("duracao"));
  const vagas = Number(form.get("vagas"));

  if (!Number.isFinite(reais) || reais < 0 || reais > 100_000) return;
  if (!Number.isInteger(duracao) || duracao < 15 || duracao > 600) return;
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > 50) return;

  await db().query(
    `update servicos
        set preco_centavos = $2, duracao_min = $3, vagas_padrao = $4
      where id = $1`,
    [id, Math.round(reais * 100), duracao, vagas]
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

  const { rows } = await db().query(`select status from reservas where id = $1`, [id]);
  const status = rows[0]?.status;

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
