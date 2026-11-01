"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminCompanyReviewSchema, AdminJobStatusSchema } from "@/lib/validations/admin.schema";

/**
 * Validação rigorosa de autorização de administrador.
 * Garante que a sessão exista e que o usuário possua role 'ADMIN' em public.users.
 */
export async function assertAdminAuthorized() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autenticação necessária.", user: null, supabase: null };
  }

  const { data: account, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !account || account.role !== "ADMIN") {
    return { error: "Acesso negado. Privilégios administrativos exigidos.", user: null, supabase: null };
  }

  return { error: null, user, supabase };
}

/**
 * RF16: Moderação Institucional de Empresas (Aprovação / Rejeição)
 * Executa atomicamente a atualização em company_profiles, a gravação em
 * company_verifications e a trilha em audit_logs via RPC PostgreSQL transacional.
 */
export async function reviewCompanyVerification(formData: FormData) {
  const auth = await assertAdminAuthorized();
  if (auth.error || !auth.user || !auth.supabase) {
    return { error: auth.error || "Acesso negado." };
  }

  const parsed = AdminCompanyReviewSchema.safeParse({
    companyId: formData.get("companyId"),
    action: formData.get("action"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de análise inválidos." };
  }

  const { companyId, action, notes } = parsed.data;

  // Invocar RPC atômica transacional no PostgreSQL
  const { data: rpcResult, error: rpcError } = await auth.supabase.rpc(
    "admin_review_company_verification",
    {
      _company_id: companyId,
      _action: action,
      _notes: notes || null,
    }
  );

  if (rpcError) {
    return { error: "Não foi possível processar a verificação institucional da empresa." };
  }

  if (rpcResult && typeof rpcResult === "object" && "success" in rpcResult && !rpcResult.success) {
    return { error: (rpcResult as { error_message?: string }).error_message || "Erro ao moderar empresa." };
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Moderação Administrativa de Vagas (RF18)
 * Executa atomicamente a alteração de status em jobs e a inserção em
 * audit_logs via RPC PostgreSQL transacional.
 */
export async function moderateJobStatus(formData: FormData) {
  const auth = await assertAdminAuthorized();
  if (auth.error || !auth.user || !auth.supabase) {
    return { error: auth.error || "Acesso negado." };
  }

  const parsed = AdminJobStatusSchema.safeParse({
    jobId: formData.get("jobId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Parâmetros inválidos." };
  }

  const { jobId, status } = parsed.data;

  // Invocar RPC atômica transacional no PostgreSQL
  const { data: rpcResult, error: rpcError } = await auth.supabase.rpc(
    "admin_moderate_job_status",
    {
      _job_id: jobId,
      _new_status: status,
    }
  );

  if (rpcError) {
    return { error: "Não foi possível processar a moderação da vaga." };
  }

  if (rpcResult && typeof rpcResult === "object" && "success" in rpcResult && !rpcResult.success) {
    return { error: (rpcResult as { error_message?: string }).error_message || "Erro ao moderar vaga." };
  }

  revalidatePath("/admin");
  revalidatePath("/vagas");
  return { success: true };
}
