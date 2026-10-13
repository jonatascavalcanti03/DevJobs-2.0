import { z } from "zod";

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido.");

export type Email = z.infer<typeof EmailSchema>;
