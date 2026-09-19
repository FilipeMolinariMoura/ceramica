import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ipDaRequisicao, permitido } from "@/lib/limite";
import { onlyDigits } from "@/lib/utils";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIPOS = new Set(["oficina", "encomenda"]);

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json inválido" }, { status: 400 });
  }
  const body = (raw ?? {}) as Record<string, unknown>;

  // Honeypot: bots preenchem "empresa". Fingimos sucesso e ignoramos.
  if (typeof body.empresa === "string" && body.empresa.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!permitido(`pedido:${ipDaRequisicao(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, erro: "Muitas tentativas seguidas. Espere alguns minutos." },
      { status: 429 }
    );
  }

  const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

  const tipo = TIPOS.has(String(body.tipo)) ? String(body.tipo) : "oficina";
  const nome = texto(body.nome, 120);
  const email = texto(body.email, 160).toLowerCase();
  const whatsapp = onlyDigits(texto(body.whatsapp, 40));
  const pessoasBruto = Number(body.pessoas);
  const pessoas =
    Number.isInteger(pessoasBruto) && pessoasBruto > 0 && pessoasBruto < 1000
      ? pessoasBruto
      : null;

  if (nome.length < 2 || !EMAIL.test(email) || whatsapp.length < 10 || whatsapp.length > 11) {
    return NextResponse.json(
      { ok: false, erro: "Confira nome, e-mail e WhatsApp." },
      { status: 422 }
    );
  }

  try {
    await db().query(
      `insert into pedidos (tipo, nome, email, whatsapp, ocasiao, pessoas, quando, local, mensagem, origem)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        tipo,
        nome,
        email,
        whatsapp,
        texto(body.ocasiao, 120) || null,
        pessoas,
        texto(body.quando, 120) || null,
        texto(body.local, 200) || null,
        texto(body.mensagem, 2000) || null,
        texto(body.origem, 60) || null,
      ]
    );
  } catch (err) {
    console.error("[pedidos] falha ao gravar:", err);
    // Mesma política da inscrição: o pedido nunca vira erro na cara de quem
    // escreveu. O cliente segue para o WhatsApp, que é onde a conversa fecha.
    return NextResponse.json({ ok: true, salvo: false });
  }

  return NextResponse.json({ ok: true, salvo: true });
}
