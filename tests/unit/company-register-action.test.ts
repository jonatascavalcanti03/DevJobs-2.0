// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mocks
const mockSignUp = vi.fn();
const mockFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockDeleteUser = vi.fn();
const mockRevalidatePath = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
    },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
    auth: {
      admin: {
        deleteUser: mockDeleteUser,
      },
    },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

describe("registerCompany — Compensação atômica e integridade (RF02)", () => {
  const validFormData = () => {
    const fd = new FormData();
    fd.append("email", "contato@startup.com");
    fd.append("password", "StrongPass123!");
    fd.append("cnpj", "00.000.000/0001-91");
    fd.append("company_name", "Tech Startup Ltda");
    fd.append("trading_name", "Tech Startup");
    return fd;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Cadastro concluído com sucesso e redirecionamento correto", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "new-user-123",
          identities: [{ id: "id-1" }],
          created_at: new Date().toISOString(),
        },
        session: { access_token: "mock-token" },
      },
      error: null,
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          update: () => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      if (table === "company_profiles") {
        return {
          insert: () => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: "profile-corp-999" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "company_members") {
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {};
    });

    const { registerCompany } = await import("@/lib/actions/auth");
    await expect(registerCompany(validFormData())).rejects.toThrow("NEXT_REDIRECT:/dashboard/empresa");

    expect(mockDeleteUser).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard/empresa");
  });

  it("2. Falha na criação do perfil empresarial: executa compensação e deleta usuário criado", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "new-user-fail-profile",
          identities: [{ id: "ident-1" }],
          created_at: new Date().toISOString(),
        },
        session: null,
      },
      error: null,
    });

    const mockAdminDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          update: () => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          delete: mockAdminDelete,
        };
      }
      if (table === "company_profiles") {
        return {
          insert: () => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Database timeout or constraint violation" },
              }),
            }),
          }),
        };
      }
      return {};
    });

    mockDeleteUser.mockResolvedValue({ data: null, error: null });

    const { registerCompany } = await import("@/lib/actions/auth");
    const result = await registerCompany(validFormData());

    expect(result).toEqual({ error: "Erro ao registrar perfil institucional da empresa." });
    expect(mockAdminDelete).toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith("new-user-fail-profile");
  });

  it("3. Falha na criação do vínculo em company_members: limpa profile e executa compensação do usuário", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "new-user-fail-member",
          identities: [{ id: "ident-2" }],
          created_at: new Date().toISOString(),
        },
        session: null,
      },
      error: null,
    });

    const mockDeleteProfile = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
    const mockDeleteUserDb = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          update: () => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          delete: mockDeleteUserDb,
        };
      }
      if (table === "company_profiles") {
        return {
          insert: () => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: "profile-to-cleanup" },
                error: null,
              }),
            }),
          }),
          delete: mockDeleteProfile,
        };
      }
      if (table === "company_members") {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Foreign key violation or deadlock" },
          }),
        };
      }
      return {};
    });

    mockDeleteUser.mockResolvedValue({ data: null, error: null });

    const { registerCompany } = await import("@/lib/actions/auth");
    const result = await registerCompany(validFormData());

    expect(result).toEqual({ error: "Erro ao vincular administrador da empresa." });
    expect(mockDeleteProfile).toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith("new-user-fail-member");
  });

  it("4. Falha na compensação: erro não vaza para o cliente e retorna mensagem amigável", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "new-user-comp-fail",
          identities: [{ id: "ident-3" }],
          created_at: new Date().toISOString(),
        },
        session: null,
      },
      error: null,
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          update: () => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          delete: vi.fn().mockImplementation(() => {
            throw new Error("Erro de infraestrutura ao deletar do banco");
          }),
        };
      }
      if (table === "company_profiles") {
        return {
          insert: () => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Erro qualquer" },
              }),
            }),
          }),
        };
      }
      return {};
    });

    mockDeleteUser.mockRejectedValue(new Error("Supabase auth admin connection failure"));

    const { registerCompany } = await import("@/lib/actions/auth");
    const result = await registerCompany(validFormData());

    expect(result).toEqual({
      error: "Falha ao registrar empresa e a restauração do cadastro encontrou pendências. Contate o suporte.",
    });
  });

  it("5. Garantia de que usuário preexistente nunca é excluído na compensação", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    // 1ª checagem: e-mail já existe previamente no banco
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "preexisting-user-123" },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const { registerCompany } = await import("@/lib/actions/auth");
    const result = await registerCompany(validFormData());

    expect(result).toEqual({ error: "Este e-mail já está em uso no sistema." });
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});
