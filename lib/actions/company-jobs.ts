"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  JobCreateSchema,
  JobStatusUpdateSchema,
  JobUpdateSchema,
} from "@/lib/validations/company/job.schema";
import { CompanyProfileUpdateSchema } from "@/lib/validations/company/profile.schema";
import { AdvanceApplicationStageSchema } from "@/lib/validations/company/pipeline.schema";

/**
 * Auxiliar para obter a empresa associada ao usuário autenticado e verificar permissão de gestão.
 * Suporta explicitCompanyId para usuários vinculados a múltiplas empresas, validando o vínculo no servidor.
 */
async function getAuthorizedCompany(
  supabase: Awaited<ReturnType<typeof createClient>>,
  explicitCompanyId?: string | null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autenticação obrigatória.", user: null, companyId: null, role: null };
  }

  // Verificar papel do usuário em public.users
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "COMPANY") {
    return { error: "Apenas contas corporativas podem gerenciar vagas e dados da empresa.", user, companyId: null, role: null };
  }

  // Obter vínculo em company_members (suporta contexto explícito de company_id)
  let membershipQuery = supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id);

  if (explicitCompanyId) {
    membershipQuery = membershipQuery.eq("company_id", explicitCompanyId);
  }

  const { data: rawData, error: memberError } = await membershipQuery.maybeSingle?.() ?? await membershipQuery;

  if (memberError) {
    return { error: "Erro ao consultar vínculos empresariais.", user, companyId: null, role: null };
  }

  const memberships = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];

  if (memberships.length === 0) {
    return { error: "Você não possui vínculo ativo com esta empresa.", user, companyId: null, role: null };
  }

  const authorizedMembership = memberships.find((m: { role: string }) => ["OWNER", "ADMIN"].includes(m.role));

  if (!authorizedMembership) {
    return { error: "Permissão insuficiente. Apenas proprietários ou administradores podem executar esta ação.", user, companyId: null, role: null };
  }

  return { error: null, user, companyId: authorizedMembership.company_id, role: authorizedMembership.role };
}

/**
 * RF17: Publicação de Vagas pela Empresa.
 */
export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const explicitCompanyId = formData.get("companyId") as string | null;
  const authCheck = await getAuthorizedCompany(supabase, explicitCompanyId);

  if (authCheck.error || !authCheck.companyId) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = JobCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    modality: formData.get("modality"),
    level: formData.get("level"),
    status: formData.get("status") || "ACTIVE",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de vaga inválidos." };
  }

  const { data: job, error: insertError } = await supabase
    .from("jobs")
    .insert({
      company_id: authCheck.companyId,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      modality: parsed.data.modality,
      level: parsed.data.level,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (insertError || !job) {
    return { error: insertError?.message || "Não foi possível criar a oportunidade." };
  }

  revalidatePath("/dashboard/empresa");
  revalidatePath("/vagas");
  return { success: true, jobId: job.id };
}

/**
 * RF18: Edição de Vagas — Alternar Status (ACTIVE, PAUSED, CLOSED).
 * Transições permitidas:
 * - ACTIVE -> PAUSED, CLOSED
 * - PAUSED -> ACTIVE, CLOSED
 * - CLOSED -> Não pode ser reaberta sem autorização explícita (bloqueada para preservar histórico).
 */
export async function updateJobStatus(formData: FormData) {
  const supabase = await createClient();
  const explicitCompanyId = formData.get("companyId") as string | null;
  const authCheck = await getAuthorizedCompany(supabase, explicitCompanyId);

  if (authCheck.error || !authCheck.companyId) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = JobStatusUpdateSchema.safeParse({
    jobId: formData.get("jobId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Parâmetros inválidos." };
  }

  // Confirmar que a vaga pertence à empresa do usuário
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, company_id")
    .eq("id", parsed.data.jobId)
    .eq("company_id", authCheck.companyId)
    .maybeSingle();

  if (!job) {
    return { error: "Vaga não encontrada ou não pertence a esta empresa." };
  }

  // Regra de integridade RF18: Vaga já CLOSED não pode ser alternada arbitrariamente
  if (job.status === "CLOSED" && parsed.data.status !== "CLOSED") {
    return { error: "Oportunidades encerradas não podem ser reabertas diretamente." };
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.jobId)
    .eq("company_id", authCheck.companyId);

  if (updateError) {
    return { error: "Erro ao atualizar status da oportunidade." };
  }

  revalidatePath("/dashboard/empresa");
  revalidatePath(`/vagas/${parsed.data.jobId}`);
  revalidatePath("/vagas");
  return { success: true };
}

/**
 * RF18: Edição de Conteúdo da Vaga (Título, Descrição, Modalidade, Nível, Localização).
 */
export async function updateJobContent(formData: FormData) {
  const supabase = await createClient();
  const explicitCompanyId = formData.get("companyId") as string | null;
  const authCheck = await getAuthorizedCompany(supabase, explicitCompanyId);

  if (authCheck.error || !authCheck.companyId) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = JobUpdateSchema.safeParse({
    jobId: formData.get("jobId"),
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    modality: formData.get("modality"),
    level: formData.get("level"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de vaga inválidos." };
  }

  // Confirmar propriedade
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, company_id")
    .eq("id", parsed.data.jobId)
    .eq("company_id", authCheck.companyId)
    .maybeSingle();

  if (!job) {
    return { error: "Vaga não encontrada ou você não tem permissão para editá-la." };
  }

  if (job.status === "CLOSED") {
    return { error: "Não é permitido alterar o conteúdo de uma oportunidade encerrada." };
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      modality: parsed.data.modality,
      level: parsed.data.level,
    })
    .eq("id", parsed.data.jobId)
    .eq("company_id", authCheck.companyId);

  if (updateError) {
    return { error: "Erro ao atualizar dados da oportunidade." };
  }

  revalidatePath("/dashboard/empresa");
  revalidatePath(`/vagas/${parsed.data.jobId}`);
  revalidatePath("/vagas");
  return { success: true };
}

/**
 * RF15: Perfil da Empresa — Edição de dados institucionais.
 */
export async function updateCompanyProfile(formData: FormData) {
  const supabase = await createClient();
  const explicitCompanyId = formData.get("companyId") as string | null;
  const authCheck = await getAuthorizedCompany(supabase, explicitCompanyId);

  if (authCheck.error || !authCheck.companyId) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = CompanyProfileUpdateSchema.safeParse({
    trading_name: formData.get("trading_name"),
    website: formData.get("website"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados corporativos inválidos." };
  }

  const { error: updateError } = await supabase
    .from("company_profiles")
    .update({
      trading_name: parsed.data.trading_name,
      website: parsed.data.website,
      description: parsed.data.description,
    })
    .eq("id", authCheck.companyId);

  if (updateError) {
    return { error: "Não foi possível atualizar o perfil da empresa." };
  }

  revalidatePath("/dashboard/empresa");
  return { success: true };
}

/**
 * RF33: Transição de Candidatura no Pipeline Seletivo com Histórico Imutável.
 * Execução 100% atômica via RPC PostgreSQL (Migration 00010).
 */
export async function advanceApplicationStage(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

  if (authCheck.error || !authCheck.companyId || !authCheck.user) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = AdvanceApplicationStageSchema.safeParse({
    applicationId: formData.get("applicationId"),
    newStatus: formData.get("newStatus"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Parâmetros inválidos para transição de etapa." };
  }

  // Chamada atômica à função PostgreSQL (SECURITY DEFINER com verificação de auth.uid() e papéis)
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "advance_application_stage",
    {
      _application_id: parsed.data.applicationId,
      _new_status: parsed.data.newStatus,
      _notes: parsed.data.notes,
    }
  );

  if (rpcError) {
    console.error("[RF33] Falha de comunicação ou infraestrutura na RPC advance_application_stage:", {
      code: rpcError.code,
      message: rpcError.message,
    });
    return { error: "Não foi possível atualizar a etapa da candidatura no momento." };
  }

  const response = rpcResult as {
    success?: boolean;
    error_code?: string;
    error_message?: string;
  } | null;

  if (!response || !response.success) {
    if (response?.error_code === "INTERNAL_ERROR") {
      console.error("[RF33] Transação revertida com erro interno no banco de dados.", {
        applicationId: parsed.data.applicationId,
        newStatus: parsed.data.newStatus,
      });
      return { error: "Não foi possível atualizar a etapa da candidatura no momento." };
    }

    return {
      error: response?.error_message || "Não foi possível atualizar a etapa da candidatura.",
    };
  }

  revalidatePath("/dashboard/empresa");
  revalidatePath("/dashboard/candidato");
  return { success: true };
}
