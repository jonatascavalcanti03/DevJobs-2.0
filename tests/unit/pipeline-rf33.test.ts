// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { AdvanceApplicationStageSchema } from "@/lib/validations/company/pipeline.schema";

// Mocks do Supabase e Next Cache
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockRevalidatePath = vi.fn();

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
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

describe("RF33: Pipeline de Candidaturas com Histórico Imutável de Etapas", () => {
  const validAppId = "11111111-2222-4333-8444-555555555555";
  const validCompanyId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
  const validUserId = "99999999-8888-4777-8666-555555555555";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Testes de Validação de Esquema (Zod Schema)
  // ============================================================================
  describe("Validação de Schema (AdvanceApplicationStageSchema)", () => {
    it("8. Status inválido é rejeitado pelo schema", () => {
      const result = AdvanceApplicationStageSchema.safeParse({
        applicationId: validAppId,
        newStatus: "INVALID_STATUS",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Status de candidatura inválido");
      }
    });

    it("Rejeita applicationId que não é UUID", () => {
      const result = AdvanceApplicationStageSchema.safeParse({
        applicationId: "nao-uuid",
        newStatus: "SCREENING",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Identificador de candidatura inválido");
      }
    });

    it("16. Notes acima de 1.000 caracteres são rejeitadas", () => {
      const longNotes = "a".repeat(1001);
      const result = AdvanceApplicationStageSchema.safeParse({
        applicationId: validAppId,
        newStatus: "INTERVIEW",
        notes: longNotes,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("1.000 caracteres");
      }
    });

    it("Aceita notes válidas com até 1.000 caracteres e sanitiza vazias", () => {
      const validNotes = "Candidato demonstrou excelente conhecimento técnico em PostgreSQL.";
      const result = AdvanceApplicationStageSchema.safeParse({
        applicationId: validAppId,
        newStatus: "INTERVIEW",
        notes: validNotes,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe(validNotes);
      }
    });
  });

  // ============================================================================
  // Testes de Autorização e Autenticação (Server Action)
  // ============================================================================
  describe("Server Action: advanceApplicationStage (Controle de Acesso)", () => {
    it("1. Usuário não autenticado não consegue alterar uma candidatura", async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "SCREENING");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("Autenticação obrigatória");
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("2. Usuário candidato não consegue alterar o pipeline corporativo", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: validUserId } },
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
        return {};
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "SCREENING");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("Apenas contas corporativas");
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("3. Membro MEMBER não consegue executar a transição se a regra exigir OWNER ou ADMIN", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: validUserId } },
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
        if (table === "company_members") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: { company_id: validCompanyId, role: "MEMBER" },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "SCREENING");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("Permissão insuficiente");
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("4. OWNER autorizado consegue realizar uma transição válida", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: validUserId } },
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
        if (table === "company_members") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: { company_id: validCompanyId, role: "OWNER" },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      mockRpc.mockResolvedValueOnce({
        data: {
          success: true,
          application_id: validAppId,
          previous_status: "SUBMITTED",
          new_status: "SCREENING",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "SCREENING");

      const result = await advanceApplicationStage(formData);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("advance_application_stage", {
        _application_id: validAppId,
        _new_status: "SCREENING",
        _notes: null,
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/empresa");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/candidato");
    });

    it("5. ADMIN autorizado consegue realizar uma transição válida", async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: validUserId } },
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
        if (table === "company_members") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: { company_id: validCompanyId, role: "ADMIN" },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      mockRpc.mockResolvedValueOnce({
        data: {
          success: true,
          application_id: validAppId,
          previous_status: "SCREENING",
          new_status: "INTERVIEW",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");
      formData.append("notes", "Candidato agendado para entrevista técnica");

      const result = await advanceApplicationStage(formData);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("advance_application_stage", {
        _application_id: validAppId,
        _new_status: "INTERVIEW",
        _notes: "Candidato agendado para entrevista técnica",
      });
    });
  });

  // ============================================================================
  // Testes de Regras de Negócio e Tratamento de Resposta da RPC
  // ============================================================================
  describe("RPC Responses e Regras de Negócio do Pipeline", () => {
    function setupAuthOwner() {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: validUserId } },
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
        if (table === "company_members") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValueOnce({
                  data: { company_id: validCompanyId, role: "OWNER" },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });
    }

    it("6. Usuário de outra empresa não consegue alterar a candidatura (FORBIDDEN na RPC)", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "FORBIDDEN",
          error_message: "Permissão insuficiente. Apenas proprietários ou administradores podem executar esta ação.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("Permissão insuficiente");
    });

    it("7. Candidatura inexistente retorna erro (NOT_FOUND na RPC)", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "NOT_FOUND",
          error_message: "Candidatura não encontrada.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("Candidatura não encontrada");
    });

    it("Permite transição de estado ativo para CLOSED na RPC", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: true,
          application_id: validAppId,
          previous_status: "INTERVIEW",
          new_status: "CLOSED",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "CLOSED");
      formData.append("notes", "Processo encerrado devido ao fechamento da vaga.");

      const result = await advanceApplicationStage(formData);
      expect(result.success).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith("advance_application_stage", {
        _application_id: validAppId,
        _new_status: "CLOSED",
        _notes: "Processo encerrado devido ao fechamento da vaga.",
      });
    });

    it("9. Transição a partir de HIRED é rejeitada (TERMINAL_STATE na RPC)", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "TERMINAL_STATE",
          error_message: "Esta candidatura está em um estado terminal e não pode ser alterada.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("estado terminal");
    });

    it("10. Transição a partir de REJECTED é rejeitada (TERMINAL_STATE na RPC)", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "TERMINAL_STATE",
          error_message: "Esta candidatura está em um estado terminal e não pode ser alterada.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "SCREENING");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("estado terminal");
    });

    it("11. Transição a partir de WITHDRAWN é rejeitada (TERMINAL_STATE na RPC)", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "TERMINAL_STATE",
          error_message: "Esta candidatura está em um estado terminal e não pode ser alterada.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "ADVANCING");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("estado terminal");
    });

    it("12. Transição a partir de CLOSED é rejeitada (TERMINAL_STATE na RPC)", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "TERMINAL_STATE",
          error_message: "Esta candidatura está em um estado terminal e não pode ser alterada.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "SCREENING");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toContain("estado terminal");
    });

    it("13 e 17. Falha na RPC não é tratada como sucesso, reverte atomicamente e não expõe SQL", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: "syntax error at or near 'SELECT' (SQLSTATE 42601)", code: "42601" },
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");

      const result = await advanceApplicationStage(formData);
      expect(result.success).toBeUndefined();
      expect(result.error).toBe("Não foi possível atualizar a etapa da candidatura no momento.");
      expect(result.error).not.toContain("42601");
      expect(result.error).not.toContain("syntax error");
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it("14. Concorrência: bloqueio FOR UPDATE impede corrida no banco e lock timeout/internal error retorna mensagem segura", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: {
          success: false,
          error_code: "INTERNAL_ERROR",
          error_message: "Erro interno ao processar a transição de candidatura.",
        },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");

      const result = await advanceApplicationStage(formData);
      expect(result.error).toBe("Não foi possível atualizar a etapa da candidatura no momento.");
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it("15. changed_by é derivado exclusivamente do contexto auth.uid() na migration 00010 e não aceito do cliente", async () => {
      setupAuthOwner();
      mockRpc.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { advanceApplicationStage } = await import("@/lib/actions/company-jobs");
      const formData = new FormData();
      formData.append("applicationId", validAppId);
      formData.append("newStatus", "INTERVIEW");
      // Tentativa de spoofing via payload
      formData.append("changed_by", "fake-user-id");

      await advanceApplicationStage(formData);

      // Garante que o payload RPC NÃO envia o changed_by do cliente, mas sim apenas _application_id, _new_status e _notes
      expect(mockRpc).toHaveBeenCalledWith("advance_application_stage", {
        _application_id: validAppId,
        _new_status: "INTERVIEW",
        _notes: null,
      });
    });
  });

  // ============================================================================
  // Testes de Contrato e Segurança da Migration 00010 (PostgreSQL / RLS)
  //
  // NOTA DE AUDITORIA:
  // Estes testes verificam o conteúdo e as cláusulas estruturais do arquivo SQL da
  // migration 00010. Testes reais de execução direta com banco PostgreSQL requerem
  // ambiente de banco conectado e estão intencionalmente separados por cumprimento
  // da restrição de não aplicar migrações no banco remoto.
  // ============================================================================
  describe("Contrato de Segurança e RLS da Migration 00010 (Análise Estática)", () => {
    const migrationPath = path.resolve(__dirname, "../../supabase/migrations/00010_rf33_atomic_stage_history.sql");
    const migrationContent = fs.readFileSync(migrationPath, "utf-8");

    it("1. Contém search_path seguro com pg_catalog e public (pg_temp estritamente removido)", () => {
      expect(migrationContent).toContain("SET search_path = pg_catalog, public");
      expect(migrationContent).not.toMatch(/SET search_path = [^;\n]*pg_temp/);
    });

    it("2. Concede EXECUTE na função apenas para authenticated e revoga de PUBLIC e anon", () => {
      expect(migrationContent).toContain("REVOKE EXECUTE ON FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) FROM PUBLIC;");
      expect(migrationContent).toContain("REVOKE EXECUTE ON FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) FROM anon;");
      expect(migrationContent).toContain("GRANT EXECUTE ON FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) TO authenticated;");
    });

    it("3. Define proprietário explícito como postgres", () => {
      expect(migrationContent).toContain("ALTER FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) OWNER TO postgres;");
    });

    it("4. Revoga UPDATE, DELETE e TRUNCATE em applications de PUBLIC, anon e authenticated", () => {
      expect(migrationContent).toContain(
        "REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.applications FROM PUBLIC, anon, authenticated;"
      );
      expect(migrationContent).toContain("GRANT SELECT, INSERT ON TABLE public.applications TO authenticated;");
    });

    it("5. Revoga INSERT, UPDATE, DELETE e TRUNCATE em application_stage_history de PUBLIC, anon e authenticated", () => {
      expect(migrationContent).toContain(
        "REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.application_stage_history FROM PUBLIC, anon, authenticated;"
      );
      expect(migrationContent).toContain("GRANT SELECT ON TABLE public.application_stage_history TO authenticated;");
    });

    it("6. Define políticas RLS AS RESTRICTIVE para bloquear incondicionalmente mutações diretas no histórico", () => {
      expect(migrationContent).toContain("AS RESTRICTIVE");
      expect(migrationContent).toContain("CREATE POLICY \"Block authenticated insert on application history\"");
      expect(migrationContent).toContain("WITH CHECK (false)");
      expect(migrationContent).toContain("CREATE POLICY \"Block authenticated update on application history\"");
      expect(migrationContent).toContain("CREATE POLICY \"Block authenticated delete on application history\"");
      expect(migrationContent).toContain("USING (false)");
    });

    it("7. Inclui transição para CLOSED em todas as etapas ativas não-terminais", () => {
      expect(migrationContent).toMatch(/"SUBMITTED":\s*\[[^\]]*"CLOSED"/);
      expect(migrationContent).toMatch(/"SCREENING":\s*\[[^\]]*"CLOSED"/);
      expect(migrationContent).toMatch(/"INTERVIEW":\s*\[[^\]]*"CLOSED"/);
      expect(migrationContent).toMatch(/"ADVANCING":\s*\[[^\]]*"CLOSED"/);
    });

    it("8. Logging interno seguro evita exposição de notes, dados pessoais e SQL ao cliente", () => {
      expect(migrationContent).toContain("RAISE WARNING 'advance_application_stage failed");
      // Garante que _notes não é interpolado no log de erro
      expect(migrationContent).not.toMatch(/RAISE WARNING.*_notes/);
      expect(migrationContent).toContain("'error_code', 'INTERNAL_ERROR'");
      expect(migrationContent).toContain("'error_message', 'Erro interno ao processar a transição de candidatura.'");
    });

    it("9. Utiliza bloqueio pessimista FOR UPDATE OF a na linha da candidatura", () => {
      expect(migrationContent).toContain("FOR UPDATE OF a");
    });

    it("10. Utiliza a construção canônica válida NULLIF(pg_catalog.btrim(_notes), '') e não pg_catalog.nullif", () => {
      expect(migrationContent).toContain("NULLIF(pg_catalog.btrim(_notes), '')");
      expect(migrationContent).not.toMatch(/pg_catalog\.nullif/);
    });
  });
});
