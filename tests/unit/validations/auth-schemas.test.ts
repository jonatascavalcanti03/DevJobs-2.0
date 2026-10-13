import { describe, expect, it } from "vitest";
import { CandidateRegisterSchema } from "@/lib/validations/candidate/register.schema";
import { EmailSchema } from "@/lib/validations/shared/email.schema";

describe("validadores de autenticação", () => {
  it("normaliza e-mail antes de validá-lo", () => {
    expect(EmailSchema.parse("  ANA@EXAMPLE.COM ")).toBe("ana@example.com");
  });

  it("rejeita senha que não atende à política", () => {
    expect(CandidateRegisterSchema.safeParse({ email: "ana@example.com", password: "senha123" }).success).toBe(false);
  });

  it("aceita cadastro de candidato com senha forte", () => {
    const result = CandidateRegisterSchema.safeParse({
      email: " ANA@EXAMPLE.COM ",
      password: "Senha@123",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("ana@example.com");
  });
});
