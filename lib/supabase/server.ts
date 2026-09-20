import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para execução no Servidor (Server Components, Server Actions e Route Handlers).
 *
 * Utiliza EXCLUSIVAMENTE a chave anônima pública (NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * combinada com os cookies de sessão HTTP-Only da requisição.
 *
 * NUNCA utiliza a Service Role Key para operações normais de usuário.
 * Preserva integralmente o contexto do Supabase Auth e as regras de RLS do PostgreSQL.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Configuração do Supabase ausente no cliente server: " +
        "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // O método `setAll` pode ser acionado a partir de um Server Component,
          // onde a mutação direta de cookies não é permitida durante a renderização.
          // Isto é esperado no modelo do Next.js App Router; as mutações reais
          // ocorrem em Server Actions, Route Handlers ou no proxy.
        }
      },
    },
  });
}
