"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { CandidateRegisterSchema } from "@/lib/validations/candidate/register.schema";
import { CompanyRegisterSchema } from "@/lib/validations/company/register.schema";
import { RequestPasswordResetSchema, ResetPasswordSchema } from "@/lib/validations/auth/forgot-password.schema";

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

  // 2. Criar credenciais de acesso no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Não foi possível criar as credenciais de acesso." };
  }

  const userId = authData.user.id;

  try {
    // 3. Garantir consistência atômica no backend (Service Role isolada)
    const admin = createAdminClient();

    // Atribuir papel COMPANY em public.users
    await admin
      .from("users")
      .update({ role: "COMPANY" })
      .eq("id", userId);

    // Inserir registro institucional em company_profiles
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
      return { error: "Erro ao registrar perfil institucional da empresa." };
    }

    // Vincular usuário como OWNER da empresa
    const { error: memberError } = await admin
      .from("company_members")
      .insert({
        company_id: companyProfile.id,
        user_id: userId,
        role: "OWNER",
      });

    if (memberError) {
      return { error: "Erro ao vincular administrador da empresa." };
    }
  } catch {
    return { error: "Falha na inicialização dos dados da empresa." };
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

