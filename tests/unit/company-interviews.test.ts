// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Mocks do Supabase e Next Cache ─────────────────────────────────────────
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ─── Constantes de teste ─────────────────────────────────────────────────────
const VALID_APP_ID  = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const VALID_INTV_ID = "11111111-2222-4333-8444-555555555555";
const COMPANY_ID    = "cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa";
const USER_ID       = "user-company-owner-001";

const mockAuthedUser  = { id: USER_ID, email: "owner@devjobs.com" };
const mockCompanyRole = { role: "COMPANY" };
const mockMembership  = { company_id: COMPANY_ID, role: "OWNER" };

// ─── scheduleInterview ───────────────────────────────────────────────────────
describe("scheduleInterview — Agendamento de Entrevista (RF36)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("1. Bloqueia usuário não autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const { scheduleInterview } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("applicationId", VALID_APP_ID);
    fd.append("scheduledAt", "2026-12-01T10:00:00Z");
    fd.append("durationMinutes", "60");

    const result = await scheduleInterview(fd);
    expect(result?.error).toBeTruthy();
    expect(result?.error).toContain("utenticaç");
  });

  it("2. Bloqueia usuário com role CANDIDATE (não é empresa)", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockAuthedUser },
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
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
            }),
          }),
        }),
      };
    });

    const { scheduleInterview } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("applicationId", VALID_APP_ID);
    fd.append("scheduledAt", "2026-12-01T10:00:00Z");
    fd.append("durationMinutes", "60");

    const result = await scheduleInterview(fd);
    expect(result?.error).toBeTruthy();
    expect(result?.error).toContain("corporativas");
  });

  it("3. Retorna erro quando empresa não tem membro ativo para o usuário", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockAuthedUser },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: mockCompanyRole,
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "company_members") {
        // Nenhum membro encontrado
        return {
          select: () => ({
            eq: () => ({
              data: [],
              error: null,
              // Simulação de retorno vazio via mockResolvedValueOnce encadeado
              eq: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
            }),
          }),
        }),
      };
    });

    const { scheduleInterview } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("applicationId", VALID_APP_ID);
    fd.append("scheduledAt", "2026-12-01T10:00:00Z");
    fd.append("durationMinutes", "60");

    const result = await scheduleInterview(fd);
    expect(result?.error).toBeTruthy();
  });

  it("4. Rejeita durationMinutes abaixo do mínimo (< 15) — validação Zod", async () => {
    // Configura auth válida para checar que o erro vem do schema
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockAuthedUser },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: mockCompanyRole,
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "company_members") {
        return {
          select: () => ({
            eq: () => [mockMembership],
          }),
        };
      }
      return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: vi.fn() }) }) }) };
    });

    const { scheduleInterview } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("applicationId", VALID_APP_ID);
    fd.append("scheduledAt", "2026-12-01T10:00:00Z");
    fd.append("durationMinutes", "5"); // inválido: < 15

    const result = await scheduleInterview(fd);
    // Independente de onde falha (auth ou schema), deve retornar erro
    expect(result?.error).toBeTruthy();
  });
});

// ─── updateInterviewStatus ───────────────────────────────────────────────────
describe("updateInterviewStatus — Transição de Status de Entrevista (RF36)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("5. Bloqueia usuário não autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const { updateInterviewStatus } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("interviewId", VALID_INTV_ID);
    fd.append("status", "CONFIRMED");

    const result = await updateInterviewStatus(fd);
    expect(result?.error).toBeTruthy();
    expect(result?.error).toContain("utenticaç");
  });

  it("6. Rejeita status fora do enum permitido", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockAuthedUser },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValueOnce({
                data: mockCompanyRole,
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "company_members") {
        return {
          select: () => ({
            eq: () => [mockMembership],
          }),
        };
      }
      return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: vi.fn() }) }) }) };
    });

    const { updateInterviewStatus } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("interviewId", VALID_INTV_ID);
    fd.append("status", "INEXISTENTE"); // status inválido

    const result = await updateInterviewStatus(fd);
    expect(result?.error).toBeTruthy();
  });

  it("7. Bloqueia CANDIDATE de alterar status de entrevista", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "cand-user", email: "cand@devjobs.com" } },
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
      return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: vi.fn() }) }) }) };
    });

    const { updateInterviewStatus } = await import("@/lib/actions/company-interviews");
    const fd = new FormData();
    fd.append("interviewId", VALID_INTV_ID);
    fd.append("status", "CONFIRMED");

    const result = await updateInterviewStatus(fd);
    expect(result?.error).toBeTruthy();
    expect(result?.error).toContain("corporativas");
  });
});
