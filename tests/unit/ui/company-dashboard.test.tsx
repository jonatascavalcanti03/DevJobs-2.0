import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CompanyDashboard from "@/app/dashboard/empresa/page";

// Mocks do Supabase Server
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

describe("CompanyDashboard — Redesign Premium (Etapa 4)", () => {
  const companyUser = { id: "comp-user-1", email: "recruiter@cloudscale.tech" };

  it("renderiza indicadores do processo seletivo, vagas e pipeline preservando as 8 etapas", async () => {
    mockGetUser.mockResolvedValue({ data: { user: companyUser }, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: { role: "COMPANY" }, error: null }),
            }),
          }),
        };
      }
      if (table === "company_members") {
        return {
          select: () => ({
            eq: vi.fn().mockResolvedValue({
              data: [{ company_id: "comp-1", role: "OWNER" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "company_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: "comp-1",
                  company_name: "CloudScale Inovações",
                  trading_name: "CloudScale",
                  cnpj: "12.345.678/0001-90",
                  website: "https://cloudscale.tech",
                  description: "Soluções em nuvem escaláveis.",
                  verification_status: "APPROVED",
                },
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
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: "job-1",
                    title: "Engenheiro Backend Go",
                    description: "Desenvolvimento de microsserviços",
                    status: "ACTIVE",
                    modality: "REMOTE",
                    level: "SENIOR",
                    location: "Brasil",
                    created_at: "2026-10-15T12:00:00Z",
                  },
                ],
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
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: "app-1",
                    status: "SUBMITTED",
                    created_at: "2026-10-22T10:00:00Z",
                    candidate_profiles: {
                      headline: "Desenvolvedor Backend Go",
                      location: "São Paulo, SP",
                      short_summary: "Especialista em microsserviços",
                    },
                    jobs: {
                      id: "job-1",
                      title: "Engenheiro Backend Go",
                      company_id: "comp-1",
                    },
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "application_stage_history") {
        return {
          select: () => ({
            in: () => ({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: "hist-1",
                    application_id: "app-1",
                    previous_status: null,
                    new_status: "SUBMITTED",
                    changed_by: null,
                    created_at: "2026-10-22T10:00:00Z",
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "interviews") {
        return {
          select: () => ({
            in: () => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    });

    const Component = await CompanyDashboard();
    render(Component);

    // 1. Header com nome e badge de verificação
    expect(screen.getByText(/olá, cloudscale/i)).toBeInTheDocument();
    expect(screen.getByText("Empresa Verificada")).toBeInTheDocument();

    // 2. Métricas reais nos StatCards
    expect(screen.getByText("Vagas Ativas")).toBeInTheDocument();
    expect(screen.getByText("Total de Candidaturas")).toBeInTheDocument();
    expect(screen.getByText("Pipeline Ativo")).toBeInTheDocument();
    expect(screen.getByText("Entrevistas Técnicas")).toBeInTheDocument();

    // 3. Pipeline Kanban com candidaturas
    expect(screen.getByRole("heading", { name: /pipeline seletivo/i })).toBeInTheDocument();
    expect(screen.getAllByText("Inscritos").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Triagem").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Entrevistas").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Finalistas").length).toBeGreaterThanOrEqual(1);
  });
});
