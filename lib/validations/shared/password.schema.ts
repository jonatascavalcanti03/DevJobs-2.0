import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve incluir uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve incluir uma letra minúscula.")
  .regex(/[0-9]/, "A senha deve incluir um número.")
  .regex(/[^A-Za-z0-9\s]/, "A senha deve incluir um símbolo.");

export type Password = z.infer<typeof PasswordSchema>;
