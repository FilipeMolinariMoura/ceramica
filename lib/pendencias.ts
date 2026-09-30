import { db } from "@/lib/db";

/**
 * Quantas compras ainda não pagas esta pessoa segura agora.
 *
 * Conta aulas avulsas e pacotes juntos, e o pacote conta UMA vez: as quatro
 * filhas dele têm `pacote_id` e ficam fora da primeira contagem. Sem isso, um
 * pacote em aberto valeria quatro pendências e bloquearia a pessoa de tentar
 * de novo depois de fechar o checkout sem pagar.
 */
export async function pendenciasDoEmail(email: string): Promise<number> {
  const { rows } = await db().query<{ n: string }>(
    `select (
       (select count(*) from reservas
         where email = $1 and pacote_id is null
           and status = 'pendente' and expira_em > now())
       +
       (select count(*) from pacotes
         where email = $1 and status = 'pendente' and expira_em > now())
     )::text as n`,
    [email]
  );
  return Number(rows[0]?.n ?? 0);
}

/**
 * De onde a pessoa veio, para a Isabela saber qual porta vende. É texto livre
 * vindo do navegador, então só passa o que tem forma de rótulo curto.
 */
export function origemDoLead(valor: unknown): string | null {
  return typeof valor === "string" && /^[a-z0-9-]{1,40}$/.test(valor) ? valor : null;
}
