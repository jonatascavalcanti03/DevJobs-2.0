import { z } from "zod";
import { EmailSchema } from "@/lib/validations/shared/email.schema";
import { PasswordSchema } from "@/lib/validations/shared/password.schema";

export const RequestPasswordResetSchema = z
  .object({
    email: EmailSchema,
  })
  .strict();

export const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
  })
  .strict();

export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
