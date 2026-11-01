"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import {
  CandidateProfileSchema,
  ExperienceSchema,
  EducationSchema,
  CertificationSchema,
  LanguageSchema,
  ResumeUploadSchema,
  SkillSchema,
  ProjectSchema,
  MAX_RESUME_FILE_SIZE,
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

/**
 * RF06: Adicionar competência ao perfil do candidato.
 * Garante existência da skill em public.skills e associa em public.candidate_skills.
 */
export async function addSkill(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const parsed = SkillSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de competência inválidos." };
  }

  const normalizedName = parsed.data.name.trim();

  // 1. Obter ou registrar a competência global
  let skillId: string | null = null;
  const { data: existingSkill } = await supabase
    .from("skills")
    .select("id")
    .ilike("name", normalizedName)
    .maybeSingle();

  if (existingSkill) {
    skillId = existingSkill.id;
  } else {
    const { data: newSkill, error: insertSkillError } = await supabase
      .from("skills")
      .insert({ name: normalizedName })
      .select("id")
      .single();

    if (insertSkillError || !newSkill) {
      // Se houver conflito de duplicidade concorrente
      const { data: retrySkill } = await supabase
        .from("skills")
        .select("id")
        .ilike("name", normalizedName)
        .maybeSingle();

      if (!retrySkill) {
        return { error: "Não foi possível cadastrar a competência no catálogo." };
      }
      skillId = retrySkill.id;
    } else {
      skillId = newSkill.id;
    }
  }

  // 2. Vincular competência ao perfil do candidato
  const { error: linkError } = await supabase.from("candidate_skills").insert({
    candidate_id: auth.profileId,
    skill_id: skillId,
  });

  if (linkError) {
    if (linkError.code === "23505") {
      return { error: "Esta competência já foi adicionada ao seu perfil." };
    }
    return { error: "Não foi possível associar a competência ao perfil." };
  }

  revalidatePath("/dashboard/candidato");
  return { success: true };
}

/**
 * RF06: Remover competência do perfil do candidato.
 */
export async function removeSkill(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const skillId = formData.get("skillId") as string;
  if (!skillId) return { error: "Identificador da competência ausente." };

  const { error } = await supabase
    .from("candidate_skills")
    .delete()
    .eq("candidate_id", auth.profileId)
    .eq("skill_id", skillId);

  if (error) return { error: "Não foi possível remover a competência." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

/**
 * RF06: Adicionar projeto ao portfólio do candidato.
 */
export async function addProject(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const parsed = ProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    technologies: formData.get("technologies"),
    repository_url: formData.get("repository_url"),
    demo_url: formData.get("demo_url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dados de projeto inválidos." };
  }

  // Montar url ou armazenar url primária (demo ou repositório) compatível com o schema public.projects
  // Se houver demo_url ou repository_url, ou concatenar informações se apropriado
  const primaryUrl = parsed.data.demo_url || parsed.data.repository_url || null;
  let fullDescription = parsed.data.description || "";
  if (parsed.data.technologies) {
    fullDescription = fullDescription
      ? `${fullDescription}\nTecnologias: ${parsed.data.technologies}`
      : `Tecnologias: ${parsed.data.technologies}`;
  }
  if (parsed.data.repository_url && parsed.data.demo_url) {
    fullDescription = `${fullDescription}\nRepositório: ${parsed.data.repository_url}`;
  }

  const { error } = await supabase.from("projects").insert({
    candidate_id: auth.profileId,
    name: parsed.data.name,
    description: fullDescription || null,
    url: primaryUrl,
  });

  if (error) return { error: "Não foi possível adicionar o projeto." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

/**
 * RF06: Remover projeto do perfil do candidato.
 */
export async function removeProject(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) return { error: auth.error || "Acesso negado." };

  const id = formData.get("id") as string;
  if (!id) return { error: "Identificador de projeto ausente." };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("candidate_id", auth.profileId);

  if (error) return { error: "Não foi possível excluir o projeto." };
  revalidatePath("/dashboard/candidato");
  return { success: true };
}

/**
 * RF06: Upload Seguro de Currículo em PDF.
 * Valida tipo MIME, extensão, tamanho máximo e magic bytes (%PDF-).
 * Armazena no bucket privado 'resumes' e registra na tabela public.resumes.
 */
export async function uploadResume(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) {
    return { error: auth.error || "Acesso negado." };
  }

  const file = formData.get("resume") as File | null;
  if (!file || !(file instanceof File)) {
    return { error: "Nenhum arquivo enviado ou formato inválido." };
  }

  const parsed = ResumeUploadSchema.safeParse({
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Arquivo de currículo inválido." };
  }

  // Validação em profundidade: conferir os magic bytes (%PDF-) nos primeiros 4 bytes
  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_RESUME_FILE_SIZE) {
    return { error: "O currículo não pode ultrapassar o limite de 5MB." };
  }

  const header = new Uint8Array(arrayBuffer.slice(0, 5));
  const isPdfHeader =
    header[0] === 0x25 && // %
    header[1] === 0x50 && // P
    header[2] === 0x44 && // D
    header[3] === 0x46 && // F
    header[4] === 0x2d;   // -

  if (!isPdfHeader) {
    return { error: "O arquivo enviado não é um PDF autêntico." };
  }

  const fileId = randomUUID();
  const storagePath = `candidate_${auth.profileId}/${fileId}.pdf`;

  // 1. Upload para o bucket privado 'resumes' do Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(storagePath, arrayBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    logger.error("[RF06] Falha no upload para o Supabase Storage.", uploadError, {
      candidateId: auth.profileId,
    });
    return { error: "Não foi possível armazenar o currículo no momento. Tente novamente." };
  }

  // 2. Registrar na tabela public.resumes
  // Se for o primeiro, marcar como primary; desmarcar primary anterior se substituir
  const { data: existingPrimary } = await supabase
    .from("resumes")
    .select("id, file_path")
    .eq("candidate_id", auth.profileId)
    .eq("is_primary", true)
    .maybeSingle();

  const { error: insertDbError } = await supabase.from("resumes").insert({
    candidate_id: auth.profileId,
    file_path: storagePath,
    file_name: file.name,
    is_primary: true,
  });

  if (insertDbError) {
    logger.error("[RF06] Falha ao registrar currículo na base relacional. Removendo arquivo do Storage.", insertDbError, {
      candidateId: auth.profileId,
    });
    // Compensação: remover o arquivo enviado ao Storage para não deixar arquivo órfão
    try {
      await supabase.storage.from("resumes").remove([storagePath]);
    } catch (cleanupEx) {
      logger.error("[RF06] Erro ao limpar arquivo órfão do Storage.", cleanupEx);
    }
    return { error: "Não foi possível vincular o currículo ao perfil. Tente novamente." };
  }

  // Se já havia um primário anterior, desmarcar para manter o índice único
  if (existingPrimary) {
    await supabase
      .from("resumes")
      .update({ is_primary: false })
      .eq("id", existingPrimary.id);
  }

  revalidatePath("/dashboard/candidato");
  return { success: true };
}

/**
 * RF06: Geração de URL assinada de curta duração para download do currículo.
 * Candidato pode baixar seu próprio currículo.
 * Empresas só podem baixar se o candidato possui candidatura ativa para vaga da empresa.
 */
export async function getResumeDownloadUrl(resumeId: string) {
  if (!resumeId || typeof resumeId !== "string") {
    return { error: "Identificador de currículo inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autenticação obrigatória." };
  }

  // Obter o registro do currículo (protegido pela política de RLS de public.resumes)
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("id, file_path, file_name, candidate_id")
    .eq("id", resumeId)
    .single();

  if (resumeError || !resume) {
    return { error: "Currículo não encontrado ou permissão insuficiente para visualização." };
  }

  // Gerar URL assinada válida por 60 segundos (curta duração)
  const { data: signedData, error: signError } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.file_path, 60);

  if (signError || !signedData?.signedUrl) {
    logger.error("[RF06] Falha ao gerar URL assinada para o currículo.", signError, {
      resumeId,
    });
    return { error: "Não foi possível gerar link para download." };
  }

  return { signedUrl: signedData.signedUrl, fileName: resume.file_name };
}

/**
 * RF06: Exclusão de currículo pelo próprio candidato.
 */
export async function deleteResume(formData: FormData) {
  const supabase = await createClient();
  const auth = await getAuthorizedCandidate(supabase);
  if (auth.error || !auth.profileId) {
    return { error: auth.error || "Acesso negado." };
  }

  const resumeId = formData.get("resumeId") as string;
  if (!resumeId) return { error: "Identificador do currículo ausente." };

  // Buscar dados do currículo do candidato autenticado
  const { data: resume } = await supabase
    .from("resumes")
    .select("id, file_path")
    .eq("id", resumeId)
    .eq("candidate_id", auth.profileId)
    .single();

  if (!resume) {
    return { error: "Currículo não encontrado ou acesso não permitido." };
  }

  // 1. Deletar do banco
  const { error: deleteDbError } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resume.id)
    .eq("candidate_id", auth.profileId);

  if (deleteDbError) {
    return { error: "Não foi possível remover o currículo do perfil." };
  }

  // 2. Deletar do Storage
  try {
    await supabase.storage.from("resumes").remove([resume.file_path]);
  } catch (storageEx) {
    logger.error("[RF06] Falha ao remover arquivo do Storage após deleção relacional.", storageEx);
  }

  revalidatePath("/dashboard/candidato");
  return { success: true };
}
