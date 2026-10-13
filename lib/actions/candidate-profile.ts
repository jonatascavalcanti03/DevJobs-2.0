"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CandidateProfileSchema,
  ExperienceSchema,
  EducationSchema,
  CertificationSchema,
  LanguageSchema,
} from "@/lib/validations/profile/candidate-profile.schema";

/**
 * Auxiliar para obter o candidate_profile do usuário autenticado.
 */
async function getAuthorizedCandidate(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autenticação necessária.", user: null, profileId: null };
  }

  const { data: account } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (account?.role !== "CANDIDATE") {
    return { error: "Apenas candidatos podem editar este perfil.", user, profileId: null };
  }

  // Obter ou criar profile do candidato
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile) {
    return { error: null, user, profileId: profile.id };
  }

  const { data: newProfile, error: insertError } = await supabase
    .from("candidate_profiles")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (insertError || !newProfile) {
    return { error: "Não foi possível carregar o perfil do candidato.", user, profileId: null };
  }

  return { error: null, user, profileId: newProfile.id };
}

export async function updateCandidateProfile(formData: FormData) {
  const parsed = CandidateProfileSchema.safeParse({
    headline: formData.get("headline"),
    shortSummary: formData.get("shortSummary"),
    location: formData.get("location"),
  });
  if (!parsed.success) return { error: "Dados de perfil inválidos." };

  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.user) return { error: auth.error || "Acesso negado." };

  const { error } = await supabase.from("candidate_profiles").upsert(
    {
      user_id: auth.user.id,
      headline: parsed.data.headline,
      short_summary: parsed.data.shortSummary,
      location: parsed.data.location,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: "Não foi possível salvar o perfil." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function addExperience(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const parsed = ExperienceSchema.safeParse({
    company_name: formData.get("company_name"),
    title: formData.get("title"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de experiência inválidos." };
  }

  const { error } = await supabase.from("experiences").insert({
    candidate_id: auth.profileId,
    company_name: parsed.data.company_name,
    title: parsed.data.title,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    description: parsed.data.description,
  });

  if (error) return { error: "Não foi possível adicionar a experiência." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function removeExperience(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const id = formData.get("id") as string;
  const { error } = await supabase.from("experiences").delete().eq("id", id).eq("candidate_id", auth.profileId);
  if (error) return { error: "Não foi possível excluir a experiência." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function addEducation(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const parsed = EducationSchema.safeParse({
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    field_of_study: formData.get("field_of_study"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de formação inválidos." };
  }

  const { error } = await supabase.from("educations").insert({
    candidate_id: auth.profileId,
    institution: parsed.data.institution,
    degree: parsed.data.degree,
    field_of_study: parsed.data.field_of_study,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
  });

  if (error) return { error: "Não foi possível adicionar a formação." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function removeEducation(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const id = formData.get("id") as string;
  const { error } = await supabase.from("educations").delete().eq("id", id).eq("candidate_id", auth.profileId);
  if (error) return { error: "Não foi possível excluir a formação." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function addCertification(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const parsed = CertificationSchema.safeParse({
    name: formData.get("name"),
    issuing_organization: formData.get("issuing_organization"),
    issue_date: formData.get("issue_date"),
    expiration_date: formData.get("expiration_date"),
    credential_id: formData.get("credential_id"),
    credential_url: formData.get("credential_url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de certificação inválidos." };
  }

  const { error } = await supabase.from("certifications").insert({
    candidate_id: auth.profileId,
    name: parsed.data.name,
    issuing_organization: parsed.data.issuing_organization,
    issue_date: parsed.data.issue_date,
    expiration_date: parsed.data.expiration_date,
    credential_id: parsed.data.credential_id,
    credential_url: parsed.data.credential_url,
  });

  if (error) return { error: "Não foi possível adicionar a certificação." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function removeCertification(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const id = formData.get("id") as string;
  const { error } = await supabase.from("certifications").delete().eq("id", id).eq("candidate_id", auth.profileId);
  if (error) return { error: "Não foi possível excluir a certificação." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function addLanguage(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const parsed = LanguageSchema.safeParse({
    language_name: formData.get("language_name"),
    proficiency_level: formData.get("proficiency_level"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de idioma inválidos." };
  }

  const { error } = await supabase.from("languages").insert({
    candidate_id: auth.profileId,
    language_name: parsed.data.language_name,
    proficiency_level: parsed.data.proficiency_level,
  });

  if (error) return { error: "Não foi possível adicionar o idioma." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

export async function removeLanguage(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const id = formData.get("id") as string;
  const { error } = await supabase.from("languages").delete().eq("id", id).eq("candidate_id", auth.profileId);
  if (error) return { error: "Não foi possível excluir o idioma." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}
