import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para execução no Navegador (Client-side).
 *
 * Utiliza EXCLUSIVAMENTE a chave anônima pública (NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * NUNCA deve importar ou receber a SUPABASE_SERVICE_ROLE_KEY.
 *
 * Todas as operações realizadas por este cliente respeitam integralmente as
 * políticas de Row Level Security (RLS) do PostgreSQL.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Configuração do Supabase ausente no cliente browser: " +
        "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
