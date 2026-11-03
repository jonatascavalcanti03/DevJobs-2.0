// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchExternalJobs, stripHtml } from "@/lib/jobs/external-adzuna";

describe("Integração com API Externa de Vagas — Adzuna (FASE 5)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("1. Retorna lista vazia e available=false quando credenciais não estão configuradas (sem simular dados falsos)", async () => {
    delete process.env.ADZUNA_APP_ID;
    delete process.env.ADZUNA_APP_KEY;

    const result = await fetchExternalJobs({ query: "frontend" });
    expect(result.available).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.reason).toBe("CREDENTIALS_MISSING");
  });

  it("2. Remove tags HTML de títulos e descrições com stripHtml", () => {
    const raw = "Desenvolvedor <strong>Frontend</strong> Sênior &amp; <span>React</span>";
    const cleaned = stripHtml(raw);
    expect(cleaned).toBe("Desenvolvedor Frontend Sênior &amp; React");
  });

  it("3. Normaliza respostas da Adzuna como vagas externas identificadas com link de destino", async () => {
    process.env.ADZUNA_APP_ID = "mock-app-id";
    process.env.ADZUNA_APP_KEY = "mock-app-key";

    const mockAdzunaResponse = {
      count: 1,
      results: [
        {
          id: "998877",
          title: "Engenheiro <strong>Node.js</strong>",
          description: "Oportunidade para atuar com microserviços em nuvem.",
          redirect_url: "https://www.adzuna.com.br/land/ad/998877",
          created: "2026-10-20T10:00:00Z",
          company: { display_name: "Fintech Global" },
          location: { display_name: "São Paulo, SP" },
          contract_time: "permanent",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAdzunaResponse,
    });

    const result = await fetchExternalJobs({ query: "Node.js" });

    expect(result.available).toBe(true);
    expect(result.source).toBe("Adzuna");
    expect(result.jobs).toHaveLength(1);

    const job = result.jobs[0];
    expect(job.id).toBe("ext-adzuna-998877");
    expect(job.title).toBe("Engenheiro Node.js"); // HTML removido
    expect(job.companyName).toBe("Fintech Global");
    expect(job.isExternal).toBe(true);
    expect(job.externalUrl).toBe("https://www.adzuna.com.br/land/ad/998877");
    expect(job.source).toBe("Adzuna");
  });

  it("4. Trata erros HTTP da API com resiliência sem derrubar a aplicação", async () => {
    process.env.ADZUNA_APP_ID = "mock-app-id";
    process.env.ADZUNA_APP_KEY = "mock-app-key";

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await fetchExternalJobs({ query: "python" });
    expect(result.available).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.reason).toBe("API_ERROR");
  });

  it("5. Trata falhas de rede / timeout sem estourar exceções não tratadas", async () => {
    process.env.ADZUNA_APP_ID = "mock-app-id";
    process.env.ADZUNA_APP_KEY = "mock-app-key";

    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection reset"));

    const result = await fetchExternalJobs({ query: "java" });
    expect(result.available).toBe(false);
    expect(result.jobs).toEqual([]);
    expect(result.reason).toBe("API_ERROR");
  });
});

