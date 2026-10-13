import { z } from "zod";
import { EmailSchema } from "../shared/email.schema";
import { PasswordSchema } from "../shared/password.schema";
import { CnpjSchema } from "../shared/cnpj.schema";

export const CompanyRegisterSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    cnpj: CnpjSchema,
    company_name: z
      .string({ required_error: "Razão social é obrigatória." })
      .trim()
      .min(1, "Razão social não pode ser vazia."),
    trading_name: z
      .string()
      .trim()
      .nullish()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export type CompanyRegisterInput = z.infer<typeof CompanyRegisterSchema>;
