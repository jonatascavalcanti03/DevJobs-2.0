"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { CandidateRegisterSchema } from "@/lib/validations/candidate/register.schema";
import { CompanyRegisterSchema } from "@/lib/validations/company/register.schema";
import { RequestPasswordResetSchema, ResetPasswordSchema } from "@/lib/validations/auth/forgot-password.schema";
import { logger } from "@/lib/logger";

function getInternalRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function login(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Informe e-mail e senha válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Não foi possível entrar com estas credenciais." };
  }

  revalidatePath("/", "layout");
  redirect(getInternalRedirect(formData.get("redirectTo")));
}

export async function register(formData: FormData) {
  const parsed = CandidateRegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados de cadastro inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error || !data.user) {
    return { error: "Não foi possível criar sua conta. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect(data.session ? "/dashboard" : "/login?registered=1");
}

export async function registerCompany(formData: FormData) {
  const parsed = CompanyRegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    cnpj: formData.get("cnpj"),
    company_name: formData.get("company_name"),
    trading_name: formData.get("trading_name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados de cadastro de empresa inválidos." };
  }

  const supabase = await createClient();

  // 1. Verificar se CNPJ já existe
  const { data: existingCompany } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("cnpj", parsed.data.cnpj)
    .maybeSingle();

  if (existingCompany) {
    return { error: "Este CNPJ já está cadastrado no sistema." };
  }

  const admin = createAdminClient();

  // 2. Verificar se o e-mail já existe previamente no banco antes do signUp
  const { data: existingUserCheck } = await admin
    .from("users")
    .select("id")
    .eq("email", parsed.data.email.toLowerCase().trim())
    .maybeSingle();

  if (existingUserCheck) {
    return { error: "Este e-mail já está em uso no sistema." };
  }

  // 3. Criar credenciais de acesso no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Não foi possível criar as credenciais de acesso." };
  }

  const userId = authData.user.id;
  // Evidência confiável:
  // 1) O e-mail não existia previamente na tabela public.users
  // 2) authData.user.identities não está vazio (no Supabase, identities é [] quando a conta já existia)
  const isNewUser = !existingUserCheck && Array.isArray(authData.user.identities) && authData.user.identities.length > 0;

  let companyProfileId: string | null = null;
  let memberCreated = false;

  const compensateFailedRegistration = async (stepFailed: string, detailError: unknown): Promise<{ compensationFailed: boolean }> => {
    logger.error(`[RF02] Falha na etapa '${stepFailed}' durante cadastro de empresa. Iniciando compensação.`, detailError, {
      userId,
    });

    let compensationFailed = false;

    // 1. Limpar vínculo de company_members (tabela dependente com FK para company_profiles e users)
    if (memberCreated && companyProfileId) {
      try {
        const { error: deleteMemberError } = await admin
          .from("company_members")
          .delete()
          .match({ company_id: companyProfileId, user_id: userId });
        if (deleteMemberError) {
          compensationFailed = true;
          logger.error("[RF02] Falha ao limpar company_members na compensação.", deleteMemberError, { companyProfileId, userId });
        }
      } catch (cleanupMemberEx) {
        compensationFailed = true;
        logger.error("[RF02] Exceção ao limpar company_members na compensação.", cleanupMemberEx, { companyProfileId, userId });
      }
    }

    // 2. Limpar company_profiles se já inserido
    if (companyProfileId) {
      try {
        const { error: deleteProfileError } = await admin
          .from("company_profiles")
          .delete()
          .eq("id", companyProfileId);
        if (deleteProfileError) {
          compensationFailed = true;
          logger.error("[RF02] Falha ao limpar company_profile na compensação.", deleteProfileError, { companyProfileId });
        }
      } catch (cleanupProfileError) {
        compensationFailed = true;
        logger.error("[RF02] Exceção ao limpar company_profile na compensação.", cleanupProfileError, { companyProfileId });
      }
    }

    // 3. Limpar public.users e auth.users apenas quando comprovadamente criado por esta tentativa
    if (isNewUser) {
      try {
        const { error: deleteUserError } = await admin.from("users").delete().eq("id", userId);
        if (deleteUserError) {
          compensationFailed = true;
          logger.error("[RF02] Falha ao limpar public.users na compensação.", deleteUserError, { userId });
        }
      } catch (cleanupUserError) {
        compensationFailed = true;
        logger.error("[RF02] Exceção ao limpar public.users na compensação.", cleanupUserError, { userId });
      }

      try {
        const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);
        if (deleteAuthError) {
          compensationFailed = true;
          logger.error("[RF02] Falha ao deletar auth user na compensação.", deleteAuthError, { userId });
        }
      } catch (deleteAuthEx) {
        compensationFailed = true;
        logger.error("[RF02] Exceção ao deletar auth user na compensação.", deleteAuthEx, { userId });
      }
    }

    if (compensationFailed) {
      logger.error("[RF02] Compensação incompleta: alguns recursos não puderam ser limpos.", undefined, {
        userId,
        companyProfileId,
      });
    }

    return { compensationFailed };
  };

  try {
    // 4. Atribuir papel COMPANY em public.users
    const { error: roleUpdateError } = await admin
      .from("users")
      .update({ role: "COMPANY" })
      .eq("id", userId);

    if (roleUpdateError) {
      const { compensationFailed } = await compensateFailedRegistration("update_user_role", roleUpdateError);
      return {
        error: compensationFailed
          ? "Falha ao configurar permissões da conta empresarial e a restauração automática encontrou falhas. Contate o suporte."
          : "Erro ao configurar permissões da conta empresarial.",
      };
    }

    // 5. Inserir registro institucional em company_profiles
    const { data: companyProfile, error: profileError } = await admin
      .from("company_profiles")
      .insert({
        cnpj: parsed.data.cnpj,
        company_name: parsed.data.company_name,
        trading_name: parsed.data.trading_name,
        verification_status: "PENDING",
      })
      .select("id")
      .single();

    if (profileError || !companyProfile) {
      const { compensationFailed } = await compensateFailedRegistration("create_company_profile", profileError);
      return {
        error: compensationFailed
          ? "Falha ao registrar empresa e a restauração do cadastro encontrou pendências. Contate o suporte."
          : "Erro ao registrar perfil institucional da empresa.",
      };
    }

    companyProfileId = companyProfile.id;

    // 6. Vincular usuário como OWNER da empresa
    const { error: memberError } = await admin
      .from("company_members")
      .insert({
        company_id: companyProfile.id,
        user_id: userId,
        role: "OWNER",
      });

    if (memberError) {
      const { compensationFailed } = await compensateFailedRegistration("create_company_member", memberError);
      return {
        error: compensationFailed
          ? "Falha ao vincular gestor da empresa e a restauração do cadastro encontrou pendências. Contate o suporte."
          : "Erro ao vincular administrador da empresa.",
      };
    }

    memberCreated = true;
  } catch (unexpectedError) {
    const { compensationFailed } = await compensateFailedRegistration("unexpected_exception", unexpectedError);
    return {
      error: compensationFailed
        ? "Falha inesperada na inicialização da empresa e a restauração automática encontrou pendências. Contate o suporte."
        : "Falha na inicialização dos dados da empresa.",
    };
  }

  revalidatePath("/", "layout");
  redirect(authData.session ? "/dashboard/empresa" : "/login?registered=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * RF04: Solicitação de Redefinição de Senha
 */
export async function requestPasswordReset(formData: FormData) {
  const parsed = RequestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    return { error: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde." };
  }

  return { success: true };
}

/**
 * RF04: Redefinição de Senha com Nova Credencial
 */
export async function resetPassword(formData: FormData) {
  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Senha inválida." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Não foi possível redefinir sua senha. O link pode ter expirado." };
  }

  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

