import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { onlyDigits } from "@/lib/utils";

export const runtime = "nodejs";

const EXPERIENCIAS = new Set(["nenhuma", "pouca", "pratico"]);
const TURMAS = new Set(["manha", "tarde", "tanto_faz"]);

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "json inválido" }, { status: 400 });
  }

  const body = (raw ?? {}) as Record<string, unknown>;

  // Honeypot: bots preenchem "empresa". Fingimos sucesso e ignoramos.
  if (typeof body.empresa === "string" && body.empresa.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const nome = String(body.nome ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const turma = String(body.turma ?? "");
  const experiencia = String(body.experiencia ?? "");
  const origem = String(body.origem ?? "landing").slice(0, 60);

  const digits = onlyDigits(whatsapp);
  if (
    !nome ||
    digits.length < 10 ||
    digits.length > 11 ||
    !TURMAS.has(turma) ||
    !EXPERIENCIAS.has(experiencia)
  ) {
    return NextResponse.json(
      { ok: false, error: "dados inválidos" },
      { status: 422 }
    );
  }

  // O lead nunca se perde: qualquer falha aqui é logada, mas o cliente
  // redireciona a pessoa para o WhatsApp de qualquer forma.
  try {
    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from("inscricoes")
      .insert({ nome, whatsapp, turma, experiencia, origem });

    if (error) {
      console.error("[inscricao] falha ao gravar no Supabase:", error.message);
      return NextResponse.json({ ok: false, saved: false }, { status: 200 });
    }
  } catch (err) {
    console.error("[inscricao] erro inesperado:", err);
    return NextResponse.json({ ok: false, saved: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true, saved: true });
}
