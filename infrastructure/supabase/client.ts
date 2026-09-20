/**
 * Supabase Client — Client-Side
 *
 * Este cliente utiliza APENAS variáveis públicas (NEXT_PUBLIC_*).
 * Deve ser usado em Client Components ("use client") e no browser.
 *
 * NUNCA usar SUPABASE_SERVICE_ROLE_KEY aqui.
 * NUNCA importar este arquivo em código exclusivamente server-side
 * que necessite de privilégios administrativos.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cria e retorna um cliente Supabase para uso no browser (Client Components).
 *
 * Nota: Para Server Components, Route Handlers e Server Actions,
 * use o cliente server-side em `./server.ts`.
 */
export function createClient() {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variáveis de ambiente Supabase não configuradas. " +
        "Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
