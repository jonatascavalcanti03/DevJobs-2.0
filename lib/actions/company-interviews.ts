"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ScheduleInterviewSchema,
  EvaluateInterviewSchema,
  UpdateInterviewStatusSchema,
} from "@/lib/validations/company/interview.schema";

/**
 * Auxiliar para verificar se o usuário autenticado pertence à empresa da vaga associada à candidatura.
 */
async function getAuthorizedCompany(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autenticação obrigatória.", user: null, companyId: null, role: null };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "COMPANY") {
    return {
      error: "Apenas contas corporativas podem gerenciar entrevistas.",
      user,
      companyId: null,
      role: null,
    };
  }

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return {
      error: "Permissão insuficiente. Apenas administradores ou proprietários podem gerenciar entrevistas.",
      user,
      companyId: null,
      role: null,
    };
  }

  return { error: null, user, companyId: membership.company_id, role: membership.role };
}

/**
 * RF36: Agendar Entrevista
 */
export async function scheduleInterview(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

  if (authCheck.error || !authCheck.companyId || !authCheck.user) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = ScheduleInterviewSchema.safeParse({
    applicationId: formData.get("applicationId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    meetingLink: formData.get("meetingLink"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos para agendamento." };
  }

  const { applicationId, scheduledAt, durationMinutes, meetingLink } = parsed.data;

  // Confirmar que a candidatura pertence a uma vaga da empresa autenticada
  const { data: application } = await supabase
    .from("applications")
    .select(`
      id,
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

  // Inserir registro na tabela interviews
  const { data: interview, error: insertError } = await supabase
    .from("interviews")
    .insert({
      application_id: applicationId,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
      meeting_link: meetingLink,
      status: "SCHEDULED",
    })
    .select("id")
    .single();

  if (insertError || !interview) {
    return { error: "Não foi possível agendar a entrevista." };
  }

  // Adicionar o recrutador como participante da entrevista
  await supabase.from("interview_participants").insert({
    interview_id: interview.id,
    user_id: authCheck.user.id,
  });

  revalidatePath("/dashboard/empresa");
  revalidatePath("/dashboard/candidato");
  return { success: true, interviewId: interview.id };
}

/**
 * RF36: Atualizar Status da Entrevista (CONFIRMED, COMPLETED, CANCELED, NO_SHOW)
 */
export async function updateInterviewStatus(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

  if (authCheck.error || !authCheck.companyId) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = UpdateInterviewStatusSchema.safeParse({
    interviewId: formData.get("interviewId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Status inválido." };
  }

  const { interviewId, status } = parsed.data;

  // Atualizar entrevista
  const { error: updateError } = await supabase
    .from("interviews")
    .update({ status })
    .eq("id", interviewId);

  if (updateError) {
    return { error: "Não foi possível atualizar o status da entrevista." };
  }

  revalidatePath("/dashboard/empresa");
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

/**
 * RF36: Registrar Avaliação / Feedback da Entrevista
 */
export async function evaluateInterview(formData: FormData) {
  const supabase = await createClient();
  const authCheck = await getAuthorizedCompany(supabase);

  if (authCheck.error || !authCheck.user) {
    return { error: authCheck.error || "Acesso negado." };
  }

  const parsed = EvaluateInterviewSchema.safeParse({
    interviewId: formData.get("interviewId"),
    feedback: formData.get("feedback"),
    score: formData.get("score"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados de avaliação inválidos." };
  }

  const { interviewId, feedback, score } = parsed.data;

  const { error: evalError } = await supabase
    .from("interview_evaluations")
    .insert({
      interview_id: interviewId,
      evaluator_id: authCheck.user.id,
      feedback,
      score: score ?? null,
    });

  if (evalError) {
    return { error: "Não foi possível registrar a avaliação da entrevista." };
  }

  revalidatePath("/dashboard/empresa");
  return { success: true };
}
