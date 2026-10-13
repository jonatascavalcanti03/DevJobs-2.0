import { z } from "zod";

export const ScheduleInterviewSchema = z
  .object({
    applicationId: z.string().uuid("Identificador de candidatura inválido."),
    scheduledAt: z
      .string({ required_error: "Data e horário da entrevista são obrigatórios." })
      .refine((val) => !isNaN(Date.parse(val)), "Data e horário inválidos."),
    durationMinutes: z.coerce
      .number({ invalid_type_error: "Duração deve ser um número inteiro." })
      .int("Duração deve ser em minutos inteiros.")
      .min(15, "A entrevista deve durar no mínimo 15 minutos.")
      .max(480, "A duração máxima permitida é de 480 minutos (8 horas)."),
    meetingLink: z
      .string()
      .trim()
      .url("O link da reunião deve ser uma URL válida (ex: Google Meet, Zoom, Teams).")
      .or(z.literal(""))
      .nullable()
      .optional()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export const EvaluateInterviewSchema = z
  .object({
    interviewId: z.string().uuid("Identificador de entrevista inválido."),
    feedback: z
      .string({ required_error: "O feedback da entrevista é obrigatório." })
      .trim()
      .min(10, "O feedback deve ter no mínimo 10 caracteres."),
    score: z.coerce
      .number({ invalid_type_error: "A nota deve ser um valor numérico." })
      .min(0, "A nota mínima é 0.")
      .max(10, "A nota máxima é 10.")
      .nullable()
      .optional(),
  })
  .strict();

export const UpdateInterviewStatusSchema = z
  .object({
    interviewId: z.string().uuid("Identificador de entrevista inválido."),
    status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"]),
  })
  .strict();

export type ScheduleInterviewInput = z.infer<typeof ScheduleInterviewSchema>;
export type EvaluateInterviewInput = z.infer<typeof EvaluateInterviewSchema>;
export type UpdateInterviewStatusInput = z.infer<typeof UpdateInterviewStatusSchema>;
