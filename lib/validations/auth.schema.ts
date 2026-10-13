import { z } from "zod";
import { EmailSchema } from "@/lib/validations/shared/email.schema";

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginInput = z.infer<typeof LoginSchema>;
