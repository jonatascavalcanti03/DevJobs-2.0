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

export type CandidateProfileInput = z.infer<typeof CandidateProfileSchema>;
export type ExperienceInput = z.infer<typeof ExperienceSchema>;
export type EducationInput = z.infer<typeof EducationSchema>;
export type CertificationInput = z.infer<typeof CertificationSchema>;
export type LanguageInput = z.infer<typeof LanguageSchema>;
