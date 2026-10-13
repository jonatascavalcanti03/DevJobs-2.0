import { describe, it, expect } from "vitest";
import { CompanyRegisterSchema } from "@/lib/validations/company/register.schema";

describe("CompanyRegisterSchema — Validação de Cadastro de Empresa (RF02)", () => {
  const validPayload = {
    email: "contato@empresa.com",
    password: "Password123!",
    cnpj: "00.000.000/0001-91",
    company_name: "Empresa de Tecnologia Ltda",
    trading_name: "Tech Corp",
  };

  it("C01: aceita credenciais, CNPJ e dados corporativos válidos", () => {
    const result = CompanyRegisterSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cnpj).toBe("00000000000191");
      expect(result.data.email).toBe("contato@empresa.com");
      expect(result.data.company_name).toBe("Empresa de Tecnologia Ltda");
    }
  });

  it("C02: falha com CNPJ inválido", () => {
    const result = CompanyRegisterSchema.safeParse({
      ...validPayload,
      cnpj: "11.111.111/1111-11",
    });
    expect(result.success).toBe(false);
  });

  it("C03: falha com e-mail inválido", () => {
    const result = CompanyRegisterSchema.safeParse({
      ...validPayload,
      email: "invalido",
    });
    expect(result.success).toBe(false);
  });

  it("C04: falha com senha sem símbolo ou curta", () => {
    const result = CompanyRegisterSchema.safeParse({
      ...validPayload,
      password: "simples",
    });
    expect(result.success).toBe(false);
  });

  it("C05: falha com company_name ausente", () => {
    const { company_name: _unused, ...withoutName } = validPayload;
    const result = CompanyRegisterSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it("C06: aceita trading_name null ou omitido", () => {
    const result = CompanyRegisterSchema.safeParse({
      ...validPayload,
      trading_name: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trading_name).toBeNull();
    }
  });

  it("C07: rejeita expressamente campo role injetado pelo cliente", () => {
    const result = CompanyRegisterSchema.safeParse({
      ...validPayload,
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("C08: rejeita expressamente campo verification_status injetado pelo cliente", () => {
    const result = CompanyRegisterSchema.safeParse({
      ...validPayload,
      verification_status: "APPROVED",
    });
    expect(result.success).toBe(false);
  });
});
