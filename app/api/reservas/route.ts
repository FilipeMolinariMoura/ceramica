import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { criarReserva } from "@/lib/reservas";
import { ipDaRequisicao, permitido } from "@/lib/limite";
import { origemDoSite } from "@/lib/origem";
import { onlyDigits } from "@/lib/utils";

export const runtime = "nodejs";

/** Reservar não custa nada até pagar; ver `lib/limite.ts`. */
const LIMITE_POR_IP = 6;
const JANELA_MS = 10 * 60_000;
/** Holds simultâneos por pessoa — impede segurar a agenda com um e-mail só. */
const HOLDS_POR_EMAIL = 2;

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
  if (!permitido(`reserva:${ip}`, LIMITE_POR_IP, JANELA_MS)) {
    return NextResponse.json(
      { ok: false, erro: "Muitas tentativas seguidas. Espere alguns minutos." },
      { status: 429 }
    );
  }

  const horarioId = Number(body.horarioId);
  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const digitos = onlyDigits(whatsapp);

  if (
    !Number.isInteger(horarioId) ||
    horarioId <= 0 ||
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

  const { rows } = await db().query<{ n: string }>(
    `select count(*)::text as n from reservas
      where email = $1 and status = 'pendente' and expira_em > now()`,
    [email]
  );
  if (Number(rows[0]?.n ?? 0) >= HOLDS_POR_EMAIL) {
    return NextResponse.json(
      {
        ok: false,
        erro: "Você já tem reservas aguardando pagamento. Conclua uma antes de abrir outra.",
      },
      { status: 429 }
    );
  }

  const resultado = await criarReserva({
    horarioId,
    nome,
    email,
    whatsapp: digitos,
    origem: origemDoSite(req),
  });

  if (!resultado.ok) {
    // 409 no caso de esgotado: o cliente usa isso para recarregar a agenda em
    // vez de repetir o mesmo horário.
    const status = resultado.motivo === "esgotado" ? 409 : 503;
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
