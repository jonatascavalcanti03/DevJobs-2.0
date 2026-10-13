import { describe, it, expect } from "vitest";
import { CnpjSchema } from "@/lib/validations/shared/cnpj.schema";

describe("CnpjSchema — Validador Puro de CNPJ", () => {
  const validCnpjFormatted = "00.000.000/0001-91";
  const validCnpjClean = "00000000000191";

  it("J01: aceita CNPJ matematicamente válido formatado e retorna somente dígitos", () => {
    const result = CnpjSchema.safeParse(validCnpjFormatted);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(validCnpjClean);
    }
  });

  it("J02: aceita CNPJ válido sem pontuação", () => {
    const result = CnpjSchema.safeParse(validCnpjClean);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(validCnpjClean);
    }
  });

  it("J03: remove espaços nas extremidades e aceita", () => {
    const result = CnpjSchema.safeParse("  00.000.000/0001-91  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(validCnpjClean);
    }
  });

  it("J04: rejeita sequência repetida", () => {
    const result = CnpjSchema.safeParse("11.111.111/1111-11");
    expect(result.success).toBe(false);
  });

  it("J05: rejeita dígito verificador incorreto", () => {
    const result = CnpjSchema.safeParse("00.000.000/0001-92");
    expect(result.success).toBe(false);
  });

  it("J06: rejeita CNPJ com treze dígitos", () => {
    const result = CnpjSchema.safeParse("0000000000019");
    expect(result.success).toBe(false);
  });

  it("J07: rejeita CNPJ com quinze dígitos", () => {
    const result = CnpjSchema.safeParse("000000000001910");
    expect(result.success).toBe(false);
  });

  it("J08: rejeita letras no CNPJ", () => {
    const result = CnpjSchema.safeParse("00.000.000/0001-9A");
    expect(result.success).toBe(false);
  });

  it("J09: rejeita entrada vazia", () => {
    const result = CnpjSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});
