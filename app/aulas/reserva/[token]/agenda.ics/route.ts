import { reservaPorToken } from "@/lib/reservas";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** `20260922T123000Z` — iCalendar quer UTC compacto, sem separadores. */
function emUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Vírgula, ponto-e-vírgula e barra invertida são separadores no formato. */
function escapar(s: string): string {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return new Response("não encontrado", { status: 404 });
  }

  const reserva = await reservaPorToken(token);
  // Só quem pagou leva o evento para o calendário — uma reserva pendente ainda
  // pode expirar, e um compromisso fantasma no celular é pior que nenhum.
  if (!reserva || reserva.status !== "confirmada") {
    return new Response("não encontrado", { status: 404 });
  }

  const fim = new Date(reserva.inicio.getTime() + reserva.duracaoMin * 60_000);

  // CRLF é exigido pelo RFC 5545; com \n sozinho alguns clientes recusam.
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bela Ceramica//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${token}@belaceramica`,
    `DTSTAMP:${emUtc(new Date())}`,
    `DTSTART:${emUtc(reserva.inicio)}`,
    `DTEND:${emUtc(fim)}`,
    `SUMMARY:${escapar(reserva.servico)}`,
    `LOCATION:${escapar(SITE.endereco)}`,
    `DESCRIPTION:${escapar(
      `Reserva no nome de ${reserva.nome}. Venha com roupa que possa sujar de barro.`
    )}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Aula de cerâmica em 2 horas",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aula-de-ceramica.ics"',
      "Cache-Control": "no-store",
    },
  });
}
