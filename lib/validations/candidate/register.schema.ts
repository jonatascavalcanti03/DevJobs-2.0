import { z } from "zod";
import { EmailSchema } from "@/lib/validations/shared/email.schema";
import { PasswordSchema } from "@/lib/validations/shared/password.schema";

export const CandidateRegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type CandidateRegisterInput = z.infer<typeof CandidateRegisterSchema>;
