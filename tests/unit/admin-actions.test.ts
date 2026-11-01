import { describe, it, expect, vi, beforeEach } from "vitest";
import { reviewCompanyVerification, moderateJobStatus, assertAdminAuthorized } from "@/lib/actions/admin";

// Mocks do Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Admin Server Actions — Segurança e Transações Atômicas (RF16 e RF18)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("assertAdminAuthorized", () => {
    it("bloqueia requisição quando não há usuário autenticado", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const result = await assertAdminAuthorized();
      expect(result.error).toContain("Autenticação necessária");
      expect(result.user).toBeNull();
      expect(result.supabase).toBeNull();
    });

    it("bloqueia candidato que tenta invocar a ação administrativa", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-cand-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "CANDIDATE" }, error: null }),
          }),
        }),
      }));

      const result = await assertAdminAuthorized();
      expect(result.error).toContain("Acesso negado");
      expect(result.user).toBeNull();
    });

    it("bloqueia empresa que tenta invocar a ação administrativa", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-comp-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "COMPANY" }, error: null }),
          }),
        }),
      }));

      const result = await assertAdminAuthorized();
      expect(result.error).toContain("Acesso negado");
      expect(result.user).toBeNull();
    });

    it("permite acesso quando o usuário é ADMIN", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-admin-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
          }),
        }),
      }));

      const result = await assertAdminAuthorized();
      expect(result.error).toBeNull();
      expect(result.user?.id).toBe("user-admin-1");
      expect(result.supabase).toBeDefined();
    });
  });

  describe("reviewCompanyVerification — RPC Atômica (RF16)", () => {
    it("invoca RPC atômica admin_review_company_verification com parâmetros validados", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-admin-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
          }),
        }),
      }));

      mockRpc.mockResolvedValueOnce({
        data: { success: true, company_id: "11111111-2222-4333-8444-555555555555", new_status: "APPROVED" },
        error: null,
      });

      const formData = new FormData();
      formData.append("companyId", "11111111-2222-4333-8444-555555555555");
      formData.append("action", "APPROVE");
      formData.append("notes", "CNPJ validado na Receita");

      const result = await reviewCompanyVerification(formData);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("admin_review_company_verification", {
        _company_id: "11111111-2222-4333-8444-555555555555",
        _action: "APPROVE",
        _notes: "CNPJ validado na Receita",
      });
    });

    it("rejeita e propaga erro caso a RPC falhe ou retorne erro de negócio", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-admin-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
          }),
        }),
      }));

      mockRpc.mockResolvedValueOnce({
        data: { success: false, error_code: "NOT_FOUND", error_message: "Empresa não encontrada." },
        error: null,
      });

      const formData = new FormData();
      formData.append("companyId", "11111111-2222-4333-8444-555555555555");
      formData.append("action", "APPROVE");

      const result = await reviewCompanyVerification(formData);
      expect(result.error).toBe("Empresa não encontrada.");
    });
  });

  describe("moderateJobStatus — RPC Atômica (RF18)", () => {
    it("invoca RPC atômica admin_moderate_job_status com parâmetros validados", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-admin-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
          }),
        }),
      }));

      mockRpc.mockResolvedValueOnce({
        data: { success: true, job_id: "22222222-3333-4444-8555-666666666666", new_status: "PAUSED" },
        error: null,
      });

      const formData = new FormData();
      formData.append("jobId", "22222222-3333-4444-8555-666666666666");
      formData.append("status", "PAUSED");

      const result = await moderateJobStatus(formData);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("admin_moderate_job_status", {
        _job_id: "22222222-3333-4444-8555-666666666666",
        _new_status: "PAUSED",
      });
    });

    it("rejeita status inválido no schema antes da RPC", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-admin-1" } }, error: null });
      mockFrom.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
          }),
        }),
      }));

      const formData = new FormData();
      formData.append("jobId", "22222222-3333-4444-8555-666666666666");
      formData.append("status", "INVALID_STATUS");

      const result = await moderateJobStatus(formData);
      expect(result.error).toBeDefined();
      expect(mockRpc).not.toHaveBeenCalled();
    });
  });
});
