import { NextResponse } from "next/server";
import { criarPacote } from "@/lib/reservas";
import { ipDaRequisicao, permitido } from "@/lib/limite";
import { origemDoSite } from "@/lib/origem";
import { origemDoLead, pendenciasDoEmail } from "@/lib/pendencias";
import { onlyDigits } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Compra do pacote da turma mensal.
 *
 * Mesmas defesas de `/api/reservas`, com um motivo a mais: um pacote segura
 * QUATRO lugares de uma vez por 20 minutos. O freio por IP e o limite de
 * pendências por e-mail são o que impede alguém de travar a agenda do mês com
 * um laço.
 */
const LIMITE_POR_IP = 6;
const JANELA_MS = 10 * 60_000;
const PENDENCIAS_POR_EMAIL = 2;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json inválido" }, { status: 400 });
  }

  const body = (raw ?? {}) as Record<string, unknown>;

  // Honeypot: bots preenchem "empresa". Fingimos sucesso e não gravamos nada.
  if (typeof body.empresa === "string" && body.empresa.trim() !== "") {
    return NextResponse.json({ ok: true, urlPagamento: null });
  }

  const ip = ipDaRequisicao(req);
  if (!permitido(`pacote:${ip}`, LIMITE_POR_IP, JANELA_MS)) {
    return NextResponse.json(
      { ok: false, erro: "Muitas tentativas seguidas. Espere alguns minutos." },
      { status: 429 }
    );
  }

  const turma = body.turma;
  const meio = body.meio;
  const inicioId = Number(body.inicioId);
  const horarioIds = Array.isArray(body.horarioIds)
    ? body.horarioIds.map(Number)
    : [];
  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const digitos = onlyDigits(String(body.whatsapp ?? ""));

  if (
    (turma !== "manha" && turma !== "tarde") ||
    (meio !== "pix" && meio !== "cartao") ||
    !Number.isInteger(inicioId) ||
    inicioId <= 0 ||
    horarioIds.length < 1 ||
    horarioIds.length > 8 ||
    !horarioIds.every((id) => Number.isInteger(id) && id > 0) ||
    horarioIds[0] !== inicioId ||
    nome.length < 2 ||
    nome.length > 120 ||
    !EMAIL.test(email) ||
    email.length > 160 ||
    digitos.length < 10 ||
    digitos.length > 11
  ) {
    return NextResponse.json(
      { ok: false, erro: "Confira os dados: nome, e-mail e WhatsApp." },
      { status: 422 }
    );
  }

  if ((await pendenciasDoEmail(email)) >= PENDENCIAS_POR_EMAIL) {
    return NextResponse.json(
      {
        ok: false,
        erro: "Você já tem reservas aguardando pagamento. Conclua uma antes de abrir outra.",
      },
      { status: 429 }
    );
  }

  const resultado = await criarPacote({
    turma,
    inicioId,
    horarioIds,
    meio,
    nome,
    email,
    whatsapp: digitos,
    origem: origemDoSite(req),
    origemLead: origemDoLead(body.origem),
  });

  if (!resultado.ok) {
    // 409 quando a agenda na tela está velha (lotou ou mudou): o cliente
    // recarrega em vez de insistir nas mesmas datas.
    const status =
      resultado.motivo === "esgotado" || resultado.motivo === "agenda_mudou" ? 409 : 503;
    return NextResponse.json(
      { ok: false, erro: resultado.mensagem, motivo: resultado.motivo },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    token: resultado.token,
    urlPagamento: resultado.urlPagamento,
  });
}
