import { z } from "zod";

function isValidCnpjDigits(digits: string): boolean {
  if (digits.length !== 14) return false;
  // Rejeita sequências repetidas como 00000000000000, 11111111111111, etc.
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += parseInt(digits[i], 10) * weights1[i];
  }
  const rem1 = sum1 % 11;
  const dv1 = rem1 < 2 ? 0 : 11 - rem1;
  if (parseInt(digits[12], 10) !== dv1) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += parseInt(digits[i], 10) * weights2[i];
  }
  const rem2 = sum2 % 11;
  const dv2 = rem2 < 2 ? 0 : 11 - rem2;
  return parseInt(digits[13], 10) === dv2;
}

export const CnpjSchema = z
  .string({ required_error: "CNPJ é obrigatório." })
  .transform((val) => val.trim().replace(/[^\d]/g, ""))
  .refine((val) => val.length === 14, {
    message: "CNPJ deve conter exatamente 14 dígitos numéricos.",
  })
  .refine((val) => isValidCnpjDigits(val), {
    message: "CNPJ inválido.",
  });
