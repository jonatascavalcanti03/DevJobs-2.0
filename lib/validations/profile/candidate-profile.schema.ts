import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null));

export const CandidateProfileSchema = z
  .object({
    headline: optionalText,
    shortSummary: optionalText,
    location: optionalText,
  })
  .strict();

export const ExperienceSchema = z
  .object({
    company_name: z.string({ required_error: "Nome da empresa é obrigatório." }).trim().min(1, "Empresa não pode ser vazia."),
    title: z.string({ required_error: "Cargo é obrigatório." }).trim().min(1, "Cargo não pode ser vazio."),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início deve estar no formato AAAA-MM-DD."),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de término deve estar no formato AAAA-MM-DD.")
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
    description: optionalText,
  })
  .strict()
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: "Data de término não pode ser anterior à data de início.",
      path: ["end_date"],
    }
  );

export const EducationSchema = z
  .object({
    institution: z.string({ required_error: "Instituição é obrigatória." }).trim().min(1, "Instituição não pode ser vazia."),
    degree: z.string({ required_error: "Grau de formação é obrigatório." }).trim().min(1, "Grau não pode ser vazio."),
    field_of_study: optionalText,
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início deve estar no formato AAAA-MM-DD."),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de término deve estar no formato AAAA-MM-DD.")
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict()
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: "Data de término não pode ser anterior à data de início.",
      path: ["end_date"],
    }
  );

export const CertificationSchema = z
  .object({
    name: z.string({ required_error: "Nome da certificação é obrigatório." }).trim().min(1, "Certificação não pode ser vazia."),
    issuing_organization: z.string({ required_error: "Emissor é obrigatório." }).trim().min(1, "Emissor não pode ser vazio."),
    issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de emissão deve estar no formato AAAA-MM-DD."),
    expiration_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de expiração deve estar no formato AAAA-MM-DD.")
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
    credential_id: optionalText,
    credential_url: optionalText,
  })
  .strict();

export const LanguageSchema = z
  .object({
    language_name: z.string({ required_error: "Idioma é obrigatório." }).trim().min(1, "Idioma não pode ser vazio."),
    proficiency_level: z.string({ required_error: "Nível de proficiência é obrigatório." }).trim().min(1, "Nível não pode ser vazio."),
  })
  .strict();

export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ResumeUploadSchema = z.object({
  fileName: z
    .string({ required_error: "Nome do arquivo é obrigatório." })
    .trim()
    .min(1, "Nome do arquivo não pode ser vazio.")
    .refine((name) => name.toLowerCase().endsWith(".pdf"), {
      message: "O currículo deve ter a extensão .pdf.",
    }),
  fileSize: z
    .number({ required_error: "Tamanho do arquivo é obrigatório." })
    .positive("O arquivo não pode ser vazio.")
    .max(MAX_RESUME_FILE_SIZE, "O currículo não pode ultrapassar o limite de 5MB."),
  mimeType: z
    .string({ required_error: "Tipo MIME é obrigatório." })
    .refine((type) => type === "application/pdf", {
      message: "Apenas arquivos no formato PDF são aceitos.",
    }),
});

export const SkillSchema = z
  .object({
    name: z
      .string({ required_error: "Nome da competência é obrigatório." })
      .trim()
      .min(1, "A competência não pode ser vazia.")
      .max(50, "A competência deve ter no máximo 50 caracteres."),
  })
  .strict();

export const ProjectSchema = z
  .object({
    name: z
      .string({ required_error: "Nome do projeto é obrigatório." })
      .trim()
      .min(1, "O nome do projeto não pode ser vazio.")
      .max(100, "O nome do projeto deve ter no máximo 100 caracteres."),
    description: z
      .string()
      .trim()
      .max(500, "A descrição deve ter no máximo 500 caracteres.")
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
    technologies: z
      .string()
      .trim()
      .max(200, "As tecnologias devem ter no máximo 200 caracteres.")
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
    repository_url: z
      .string()
      .trim()
      .url("A URL do repositório deve ser válida.")
      .max(255, "A URL do repositório deve ter no máximo 255 caracteres.")
      .nullish()
      .or(z.literal(""))
      .transform((val) => (val && val.length > 0 ? val : null)),
    demo_url: z
      .string()
      .trim()
      .url("A URL de demonstração deve ser válida.")
      .max(255, "A URL de demonstração deve ter no máximo 255 caracteres.")
      .nullish()
      .or(z.literal(""))
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export const WithdrawApplicationSchema = z
  .object({
    applicationId: z
      .string({ required_error: "Identificador da candidatura é obrigatório." })
      .uuid("Identificador de candidatura inválido."),
  })
  .strict();

export type CandidateProfileInput = z.infer<typeof CandidateProfileSchema>;
export type ExperienceInput = z.infer<typeof ExperienceSchema>;
export type EducationInput = z.infer<typeof EducationSchema>;
export type CertificationInput = z.infer<typeof CertificationSchema>;
export type LanguageInput = z.infer<typeof LanguageSchema>;
export type ResumeUploadInput = z.infer<typeof ResumeUploadSchema>;
export type SkillInput = z.infer<typeof SkillSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type WithdrawApplicationInput = z.infer<typeof WithdrawApplicationSchema>;
