import { z } from "zod";

export const JobCreateSchema = z
  .object({
    title: z.string({ required_error: "Título da vaga é obrigatório." }).trim().min(3, "Título deve ter no mínimo 3 caracteres."),
    description: z.string({ required_error: "Descrição é obrigatória." }).trim().min(10, "Descrição deve ter no mínimo 10 caracteres."),
    location: z.string().trim().nullish().transform((val) => (val && val.length > 0 ? val : null)),
    modality: z.enum(["REMOTE", "HYBRID", "ON_SITE"]).nullish().transform((val) => val || null),
    level: z.enum(["JUNIOR", "PLENO", "SENIOR", "LEAD"]).nullish().transform((val) => val || null),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).default("ACTIVE"),
  })
  .strict();

export const JobStatusUpdateSchema = z
  .object({
    jobId: z.string().uuid("Identificador de vaga inválido."),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]),
  })
  .strict();

export type JobCreateInput = z.infer<typeof JobCreateSchema>;
export type JobStatusUpdateInput = z.infer<typeof JobStatusUpdateSchema>;
