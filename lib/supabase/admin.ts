import { createClient } from "@supabase/supabase-js";

/**
 * ==============================================================================
 * SUPABASE ADMIN CLIENT (ESTRITAMENTE SERVER-ONLY)
 * ==============================================================================
 *
 * REGRA ABSOLUTA DE SEGURANÇA:
 * - Este cliente utiliza a chave restrita SUPABASE_SERVICE_ROLE_KEY.
 * - Concede privilégios administrativos com BYPASS TOTAL de Row Level Security (RLS).
 * - NUNCA deve ser importado em Client Components ("use client").
 * - NUNCA deve ser exposto ao navegador, APIs públicas ou logs.
 * - NUNCA deve ser utilizado como mecanismo normal de autorização de usuários.
 *
 * USO EXCLUSIVO:
 * - Rotinas administrativas internas do sistema (ex.: compensação de Auth em cadastros
 *   órfãos, processamento de webhooks e rotinas em background).
 * ==============================================================================
 */

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "VIOLAÇÃO DE SEGURANÇA: createAdminClient foi chamado no ambiente do navegador. " +
        "A Service Role Key nunca pode ser executada ou exposta no client-side."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuração administrativa do Supabase ausente: " +
        "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
