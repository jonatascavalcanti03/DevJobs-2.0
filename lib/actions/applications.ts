"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ApplyToJobResult {
  success: boolean;
  error?: {
    code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "INACTIVE" | "ALREADY_APPLIED" | "INTERNAL_ERROR";
    message: string;
  };
  applicationId?: string;
}

/**
 * Server Action para candidatura real do candidato a uma vaga.
 *
 * RFs Atendidos:
 * - RF29: Candidatura
 * - RF31: Prevenção de Duplicidade
 *
 * Garantias de Segurança e Domínio:
 * 1. Autenticação obrigatória via Supabase Auth server client.
 * 2. Autorização estrita: somente usuários com role 'CANDIDATE' (da tabela public.users).
 * 3. Validação do identificador da vaga (UUID válido).
 * 4. Validação da existência e status da vaga (deve ser 'ACTIVE').
 * 5. Resolução/criação segura do candidate_profiles id do candidato.
 * 6. Verificação de candidatura duplicada antes do insert.
 * 7. Inserção protegida por RLS e pela constraint UNIQUE(job_id, candidate_id) no Supabase.
 * 8. Nunca utiliza Service Role Key / Admin client.
 */
export async function applyToJob(jobId: string): Promise<ApplyToJobResult> {
  try {
    // 1. Validar formato do jobId
    if (!jobId || typeof jobId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Vaga inválida ou não encontrada.",
        },
      };
    }

    const supabase = await createClient();

    // 2. Obter usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Você precisa estar conectado para se candidatar.",
        },
      };
    }

    // 3. Validar role a partir da fonte oficial do projeto (public.users)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Não foi possível verificar os dados do usuário.",
        },
      };
    }

    if (userData.role !== "CANDIDATE") {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Apenas candidatos podem se candidatar a vagas de emprego.",
        },
      };
    }

    // 4. Confirmar que a vaga existe e verificar status
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao consultar a vaga.",
        },
      };
    }

    if (!job) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Vaga não encontrada.",
        },
      };
    }

    if (job.status !== "ACTIVE") {
      return {
        success: false,
        error: {
          code: "INACTIVE",
          message: "Esta vaga não está ativa para receber candidaturas.",
        },
      };
    }

    // 5. Obter ou garantir candidate_profile para o usuário
    let candidateProfileId: string | null = null;
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileFetchError) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao consultar perfil do candidato.",
        },
      };
    }

    if (existingProfile) {
      candidateProfileId = existingProfile.id;
    } else {
      // Criação inicial do profile sob a policy "Candidates can insert own profile"
      const { data: newProfile, error: profileInsertError } = await supabase
        .from("candidate_profiles")
        .insert({ user_id: user.id })
        .select("id")
        .single();

      if (profileInsertError || !newProfile) {
        return {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Não foi possível inicializar o perfil do candidato.",
          },
        };
      }
      candidateProfileId = newProfile.id;
    }

    // 6. Verificar se já existe candidatura
    const { data: existingApp, error: existingAppError } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("candidate_id", candidateProfileId)
      .maybeSingle();

    if (existingAppError) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao verificar candidaturas anteriores.",
        },
      };
    }

    if (existingApp) {
      return {
        success: false,
        error: {
          code: "ALREADY_APPLIED",
          message: "Você já se candidatou a esta vaga.",
        },
      };
    }

    // 7. Inserir candidatura
    const { data: newApplication, error: insertError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        candidate_id: candidateProfileId,
        status: "SUBMITTED",
      })
      .select("id")
      .single();

    if (insertError) {
      // Se violar constraint UNIQUE (code 23505 no Postgres)
      if (insertError.code === "23505") {
        return {
          success: false,
          error: {
            code: "ALREADY_APPLIED",
            message: "Você já se candidatou a esta vaga.",
          },
        };
      }
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Falha ao registrar candidatura no sistema.",
        },
      };
    }

    // 8. Revalidar caminhos relevantes
    revalidatePath(`/vagas/${jobId}`);
    revalidatePath("/vagas");
    revalidatePath("/dashboard/candidato");

    return {
      success: true,
      applicationId: newApplication.id,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Erro inesperado ao processar candidatura.",
      },
    };
  }
}
