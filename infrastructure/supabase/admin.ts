/**
 * Supabase Admin Client — Service Role
 *
 * ⚠️  ATENÇÃO — CREDENCIAIS PRIVILEGIADAS ⚠️
 *
 * Este cliente usa a SERVICE ROLE KEY que:
 * - IGNORA Row Level Security (RLS)
 * - TEM ACESSO TOTAL ao banco de dados
 * - NUNCA deve ser exposta ao browser
 * - NUNCA deve ser importada em Client Components ("use client")
 * - NUNCA deve ser importada em arquivos acessíveis ao browser
 * - NUNCA deve estar em variáveis NEXT_PUBLIC_*
 *
 * Use APENAS em:
 * - Route Handlers exclusivamente server-side
 * - Scripts de migração e seed
 * - Webhooks server-side (ex: Stripe webhook)
 * - Jobs e tarefas administrativas server-side
 *
 * Prefira sempre o cliente server-side (`./server.ts`) que respeita RLS.
 * Use este cliente admin SOMENTE quando RLS for intencionalmente bypassado
 * por necessidade arquitetural documentada.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cria e retorna um cliente Supabase administrativo (service role).
 *
 * ATENÇÃO: Este cliente bypassa RLS. Use com extrema cautela.
 * Documente o motivo ao usar em cada contexto.
 */
export function createAdminClient() {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Variáveis de ambiente para admin Supabase não configuradas. " +
        "Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local"
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
