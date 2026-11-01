import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPage from "@/app/admin/page";

// Mocks
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe("AdminPage — Interface Administrativa (Etapa 5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
  });

  it("redireciona para /login se não autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    await AdminPage();
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redireciona para /dashboard se usuário não for ADMIN", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-cand-1" } }, error: null });
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: { role: "CANDIDATE" }, error: null }),
        }),
      }),
    });

    await AdminPage();
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("renderiza o painel completo para usuário com papel ADMIN", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-admin-1" } }, error: null });
    mockFrom.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
        }),
      }),
    }));

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            order: vi.fn().mockResolvedValue({
              data: [
                { id: "u1", role: "CANDIDATE", email: "cand@tech.dev", created_at: "2026-10-01" },
                { id: "u2", role: "COMPANY", email: "comp@tech.dev", created_at: "2026-10-02" },
              ],
            }),
          }),
        };
      }
      if (table === "company_profiles") {
        return {
          select: () => ({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "c1",
                  cnpj: "12345678000199",
                  company_name: "Acme Corp",
                  trading_name: "Acme",
                  website: "https://acme.com",
                  verification_status: "PENDING",
                  created_at: "2026-10-01",
                },
              ],
            }),
          }),
        };
      }
      if (table === "jobs") {
        return {
          select: () => ({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "j1",
                  title: "Engenheiro Frontend",
                  status: "ACTIVE",
                  modality: "REMOTE",
                  level: "SENIOR",
                  location: "Brasil",
                  created_at: "2026-10-01",
                  company_profiles: { trading_name: "Acme", company_name: "Acme Corp" },
                },
              ],
            }),
          }),
        };
      }
      if (table === "audit_logs") {
        return {
          select: () => ({
            order: () => ({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: "log-1",
                    action: "COMPANY_VERIFICATION_APPROVED",
                    entity: "company_profiles",
                    entity_id: "c1",
                    actor_user_id: "user-admin-1",
                    metadata: {},
                    created_at: "2026-10-03T10:00:00Z",
                  },
                ],
              }),
            }),
          }),
        };
      }
      return {};
    });

    const Page = await AdminPage();
    render(Page);

    // 1. Cabeçalho e indicadores
    expect(screen.getByRole("heading", { name: "Painel Administrativo" })).toBeInTheDocument();
    expect(screen.getByText("Total de Usuários")).toBeInTheDocument();
    expect(screen.getByText("Verificações Pendentes")).toBeInTheDocument();
    expect(screen.getByText("Vagas Ativas")).toBeInTheDocument();
    expect(screen.getByText("Registros de Auditoria")).toBeInTheDocument();

    // 2. Seções
    expect(screen.getByTestId("admin-companies-section")).toBeInTheDocument();
    expect(screen.getByTestId("admin-jobs-section")).toBeInTheDocument();
    expect(screen.getAllByText("Acme").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Engenheiro Frontend ↗")).toBeInTheDocument();
    expect(screen.getByText("COMPANY_VERIFICATION_APPROVED")).toBeInTheDocument();
  });
});

