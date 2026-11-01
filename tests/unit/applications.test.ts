// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks do Supabase Server Client e Next Cache
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("applyToJob — Fluxo de Candidatura e Regras de Segurança (RF29/RF31)", () => {
  const validJobId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Bloqueia candidatura de usuário NÃO autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHENTICATED");
    expect(result.error?.message).toContain("conectado");
  });

  it("2. Permite fluxo de candidatura para usuário CANDIDATE válido", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "cand@devjobs.com" } },
      error: null,
    });

    // Mock das consultas encadeadas do Supabase
    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "CANDIDATE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: validJobId, status: "ACTIVE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: "profile-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "applications") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { id: "app-new-123" },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(true);
    expect(result.applicationId).toBe("app-new-123");
  });

  it("3. Bloqueia candidatura de usuário COMPANY", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-comp-1", email: "comp@devjobs.com" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "COMPANY" },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
    expect(result.error?.message).toContain("Apenas candidatos");
  });

  it("4. Candidatura bem-sucedida cria profile inicial se o candidato ainda não possuía", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-new", email: "new@devjobs.com" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "CANDIDATE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: validJobId, status: "ACTIVE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: null, // sem profile
                error: null,
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { id: "created-profile-uuid" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "applications") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { id: "app-created-999" },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(true);
    expect(result.applicationId).toBe("app-created-999");
  });

  it("5. Bloqueia candidatura duplicada na aplicação e retorna ALREADY_APPLIED", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "cand@devjobs.com" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "CANDIDATE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: validJobId, status: "ACTIVE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: "profile-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "applications") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: { id: "existing-app-id" }, // Já existe candidatura!
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("ALREADY_APPLIED");
    expect(result.error?.message).toContain("Você já se candidatou");
  });

  it("6. Retorna NOT_FOUND para vaga inexistente", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "cand@devjobs.com" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "CANDIDATE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: null, // Vaga não encontrada
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
    expect(result.error?.message).toContain("não encontrada");
  });

  it("7. Retorna INACTIVE para vaga que não está ativa", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "cand@devjobs.com" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "CANDIDATE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: validJobId, status: "CLOSED" }, // Vaga inativa
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INACTIVE");
    expect(result.error?.message).toContain("não está ativa");
  });

  it("8. Rejeita formato de ID de vaga inválido (não UUID)", async () => {
    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob("invalid-not-uuid");

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  it("9. Trata conflito no banco (candidatura concorrente com code 23505) como ALREADY_APPLIED", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "cand@devjobs.com" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: { role: "CANDIDATE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: validJobId, status: "ACTIVE" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: "profile-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "applications") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: null,
                error: { code: "23505", message: "unique constraint violation" },
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { applyToJob } = await import("@/lib/actions/applications");
    const result = await applyToJob(validJobId);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("ALREADY_APPLIED");
  });
});

describe("withdrawApplication — Retirada de Candidatura pelo Candidato (RF29) via RPC", () => {
  const validAppId = "22222222-2222-4222-8222-222222222222";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("1. Rejeita retirada se applicationId for inválido ou ausente", async () => {
    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", "invalido");

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("inválido");
  });

  it("2. Bloqueia retirada se usuário não estiver autenticado (camada TS)", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", validAppId);

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("conectado");
  });

  it("3. Retorna erro quando a RPC falha com erro de infraestrutura", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "c@test.com" } },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { code: "08006", message: "connection failure" },
    });

    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", validAppId);

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Tente novamente");
  });

  it("4. Mapeia error_code FORBIDDEN da RPC corretamente", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "c@test.com" } },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({
      data: { success: false, error_code: "FORBIDDEN", error_message: "Forbidden by RPC" },
      error: null,
    });

    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", validAppId);

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("permissão");
  });

  it("5. Mapeia error_code ALREADY_WITHDRAWN da RPC corretamente", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "c@test.com" } },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({
      data: { success: false, error_code: "ALREADY_WITHDRAWN", error_message: "Already withdrawn" },
      error: null,
    });

    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", validAppId);

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("já foi retirada");
  });

  it("6. Mapeia error_code TERMINAL_STATE da RPC corretamente", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "c@test.com" } },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({
      data: { success: false, error_code: "TERMINAL_STATE", error_message: "Terminal" },
      error: null,
    });

    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", validAppId);

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("processo já encerrado ou finalizado");
  });

  it("7. Retorna sucesso quando RPC confirma retirada atômica", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-cand-1", email: "c@test.com" } },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({
      data: {
        success: true,
        application_id: validAppId,
        previous_status: "INTERVIEW",
        new_status: "WITHDRAWN",
      },
      error: null,
    });

    const { withdrawApplication } = await import("@/lib/actions/applications");
    const formData = new FormData();
    formData.append("applicationId", validAppId);

    const result = await withdrawApplication(formData);
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("withdraw_application", {
      _application_id: validAppId,
    });
  });
});
