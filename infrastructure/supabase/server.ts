/**
 * Supabase Client — Server-Side
 *
 * Este cliente deve ser usado em:
 * - Server Components
 * - Route Handlers (app/api/)
 * - Server Actions
 * - Middleware
 *
 * Utiliza cookies do Next.js para manter a sessão do usuário no servidor.
 * Utiliza a chave anônima (ANON KEY) — para operações com RLS aplicado.
 *
 * Para operações administrativas que ignoram RLS, use `./admin.ts` APENAS
 * em contextos exclusivamente server-side e com extrema cautela.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria e retorna um cliente Supabase para uso server-side com cookies.
 * Deve ser chamado dentro de Server Components ou Route Handlers.
 *
 * @returns Cliente Supabase com acesso ao cookie store do request
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variáveis de ambiente Supabase não configuradas. " +
        "Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll pode falhar em Server Components (que são read-only).
          // Isso é esperado — o middleware garante o refresh da sessão.
        }
      },
    },
  });
}
