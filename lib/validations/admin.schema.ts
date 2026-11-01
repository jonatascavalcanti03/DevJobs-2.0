import { z } from "zod";

export const AdminCompanyReviewSchema = z.object({
  companyId: z.string().uuid("Identificador de empresa inválido."),
  action: z.enum(["APPROVE", "REJECT"], {
    message: "Ação de verificação inválida.",
  }),
  notes: z
    .string()
    .max(500, "As observações não podem exceder 500 caracteres.")
    .optional()
    .nullable(),
});

export const AdminJobStatusSchema = z.object({
  jobId: z.string().uuid("Identificador de vaga inválido."),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED"], {
    message: "Status de moderação inválido.",
  }),
});

