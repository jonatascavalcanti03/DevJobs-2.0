import { describe, it, expect } from "vitest";
import {
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from "@/lib/validations/auth/forgot-password.schema";

describe("Password Reset Schemas (RF04)", () => {
  it("valida solicitação com e-mail corporativo ou pessoal válido", () => {
    const valid = { email: "dev@techlink.com" };
    const res = RequestPasswordResetSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejeita e-mail inválido na solicitação", () => {
    const invalid = { email: "not-an-email" };
    const res = RequestPasswordResetSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("valida nova senha atendendo a todos os requisitos de segurança", () => {
    const valid = { password: "DevJobs#2026Password" };
    const res = ResetPasswordSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejeita nova senha fraca (sem número ou símbolo)", () => {
    const weak = { password: "somenteletras" };
    const res = ResetPasswordSchema.safeParse(weak);
    expect(res.success).toBe(false);
  });
});
