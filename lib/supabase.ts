import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso EXCLUSIVO no servidor (route handlers).
 * Usa a service_role key — nunca deve ser importado em componentes client.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variáveis do Supabase ausentes: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
