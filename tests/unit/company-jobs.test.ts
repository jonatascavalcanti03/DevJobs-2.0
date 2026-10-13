import { describe, it, expect } from "vitest";
import { JobCreateSchema, JobStatusUpdateSchema } from "@/lib/validations/company/job.schema";
import { CompanyProfileUpdateSchema } from "@/lib/validations/company/profile.schema";

describe("Job & Company Profile Schemas — Regras de Domínio (RF15, RF17, RF18)", () => {
  it("valida criação de vaga com campos válidos", () => {
    const payload = {
      title: "Desenvolvedor Backend Node.js",
      description: "Construção de APIs escaláveis com PostgreSQL e TypeScript.",
      modality: "REMOTE" as const,
      level: "SENIOR" as const,
      location: "Brasil",
      status: "ACTIVE" as const,
    };

    const result = JobCreateSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Desenvolvedor Backend Node.js");
      expect(result.data.status).toBe("ACTIVE");
    }
  });

  it("rejeita vaga com título curto ou descrição insuficiente", () => {
    const payload = {
      title: "AB",
      description: "Curta",
    };

    const result = JobCreateSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("valida transição de status de vaga", () => {
    const validUpdate = {
      jobId: "11111111-2222-4333-8444-555555555555",
      status: "PAUSED" as const,
    };

    const result = JobStatusUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("rejeita atualização de status com UUID inválido", () => {
    const invalidUpdate = {
      jobId: "nao-eh-uuid",
      status: "CLOSED",
    };

    const result = JobStatusUpdateSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it("valida atualização de perfil institucional da empresa", () => {
    const validProfile = {
      trading_name: "Tech Inovações",
      website: "https://techinovacoes.com.br",
      description: "Empresa líder em soluções de computação em nuvem.",
    };

    const result = CompanyProfileUpdateSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trading_name).toBe("Tech Inovações");
      expect(result.data.website).toBe("https://techinovacoes.com.br");
    }
  });
});
