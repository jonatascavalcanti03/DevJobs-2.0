"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JobCreateSchema, JobStatusUpdateSchema } from "@/lib/validations/company/job.schema";
import { CompanyProfileUpdateSchema } from "@/lib/validations/company/profile.schema";

/**
 * Auxiliar para obter a empresa associada ao usuário autenticado e verificar permissão de gestão.
 */
async function getAuthorizedCompany(supabase: Awaited<ReturnType<typeof createClient>>) {
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

  // Obter vínculo em company_members
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return { error: "Permissão insuficiente. Apenas proprietários ou administradores podem executar esta ação.", user, companyId: null, role: null };
  }

  return { error: null, user, companyId: membership.company_id, role: membership.role };
}

/**
 * RF17: Publicação de Vagas pela Empresa.
 */
export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

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
 */
export async function updateJobStatus(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

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
    .select("id, company_id")
    .eq("id", parsed.data.jobId)
    .eq("company_id", authCheck.companyId)
    .maybeSingle();

  if (!job) {
    return { error: "Vaga não encontrada ou não pertence a esta empresa." };
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.jobId);

  if (updateError) {
    return { error: "Erro ao atualizar status da oportunidade." };
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
  const authCheck = await getAuthorizedCompany(supabase);

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
 * RF33: Transição de Candidatura no Pipeline Seletivo com Histórico.
 */
export async function advanceApplicationStage(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

  if (authCheck.error || !authCheck.companyId || !authCheck.user) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const applicationId = formData.get("applicationId") as string;
  const newStatus = formData.get("newStatus") as string;
  const notes = (formData.get("notes") as string) || null;

  const validStatuses = ["SUBMITTED", "SCREENING", "INTERVIEW", "ADVANCING", "HIRED", "REJECTED", "WITHDRAWN", "CLOSED"];
  if (!applicationId || !validStatuses.includes(newStatus)) {
    return { error: "Status de candidatura inválido." };
  }

  // Buscar candidatura e confirmar posse pela empresa da vaga
  const { data: application } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      job_id,
      jobs!inner (
        company_id
      )
    `)
    .eq("id", applicationId)
    .eq("jobs.company_id", authCheck.companyId)
    .maybeSingle();

  if (!application) {
    return { error: "Candidatura não encontrada ou não pertence a esta empresa." };
  }

  type ApplicationStatus =
    | "SUBMITTED"
    | "SCREENING"
    | "INTERVIEW"
    | "ADVANCING"
    | "HIRED"
    | "REJECTED"
    | "WITHDRAWN"
    | "CLOSED";

  const previousStatus = application.status;
  const typedNewStatus = newStatus as ApplicationStatus;
  const typedPreviousStatus = previousStatus as ApplicationStatus;

  // Atualizar status da candidatura
  const { error: updateAppError } = await supabase
    .from("applications")
    .update({ status: typedNewStatus })
    .eq("id", applicationId);

  if (updateAppError) {
    return { error: "Não foi possível atualizar o status da candidatura." };
  }

  // Gravar histórico de transição imutável (RN06)
  await supabase.from("application_stage_history").insert({
    application_id: applicationId,
    previous_status: typedPreviousStatus,
    new_status: typedNewStatus,
    changed_by: authCheck.user.id,
    notes: notes,
  });

  revalidatePath("/dashboard/empresa");
  revalidatePath("/dashboard/candidato");
  return { success: true };
}
