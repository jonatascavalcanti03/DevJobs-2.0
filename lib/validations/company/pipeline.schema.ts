import { z } from "zod";

export const APPLICATION_STATUSES = [
  "SUBMITTED",
  "SCREENING",
  "INTERVIEW",
  "ADVANCING",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
  "CLOSED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const AdvanceApplicationStageSchema = z
  .object({
    applicationId: z.string().uuid("Identificador de candidatura inválido."),
    newStatus: z.enum(APPLICATION_STATUSES, {
      errorMap: () => ({ message: "Status de candidatura inválido." }),
    }),
    notes: z
      .string()
      .trim()
      .max(1000, "O campo de observações não pode ultrapassar 1.000 caracteres.")
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export type AdvanceApplicationStageInput = z.infer<typeof AdvanceApplicationStageSchema>;
