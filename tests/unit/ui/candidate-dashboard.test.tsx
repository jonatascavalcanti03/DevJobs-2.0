import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CandidateDashboard from "@/app/dashboard/candidato/page";

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

describe("CandidateDashboard — Redesign Premium (Etapa 4)", () => {
  const candidateUser = { id: "cand-user-1", email: "candidate@techlink.dev" };

  it("renderiza cabeçalho premium com indicadores StatCard e lista de candidaturas", async () => {
    mockGetUser.mockResolvedValue({ data: { user: candidateUser }, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: { role: "CANDIDATE" }, error: null }),
            }),
          }),
        };
      }
      if (table === "candidate_profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: "prof-1",
                  headline: "Engenheiro Frontend Sênior",
                  location: "Florianópolis, SC",
                  short_summary: "Especialista em React e Next.js",
                },
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
                    status: "INTERVIEW",
                    created_at: "2026-10-20T10:00:00Z",
                    jobs: {
                      id: "job-1",
                      title: "Desenvolvedor Next.js",
                      description: "Construção de aplicações modernas",
                      location: "Remoto",
                      modality: "REMOTE",
                      level: "SENIOR",
                      company_profiles: {
                        company_name: "FinTech SA",
                        trading_name: "FinSecure",
                      },
                      job_skills: [{ skills: { name: "React" } }, { skills: { name: "TypeScript" } }],
                    },
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "resumes" || table === "experiences" || table === "educations" || table === "certifications" || table === "languages" || table === "projects") {
        return {
          select: () => ({
            eq: () => ({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === "candidate_skills") {
        return {
          select: () => ({
            eq: vi.fn().mockResolvedValue({
              data: [
                { skill_id: "s1", skills: { id: "s1", name: "React" } },
                { skill_id: "s2", skills: { id: "s2", name: "TypeScript" } },
              ],
              error: null,
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

    const Component = await CandidateDashboard();
    render(Component);

    // 1. Saudação personalizada
    expect(screen.getByText(/olá, engenheiro frontend sênior/i)).toBeInTheDocument();
    expect(screen.getByText(/florianópolis, sc/i)).toBeInTheDocument();

    // 2. Indicadores reais
    expect(screen.getByText("Total de Candidaturas")).toBeInTheDocument();
    expect(screen.getByText("Candidaturas Ativas")).toBeInTheDocument();
    expect(screen.getByText("Contratações")).toBeInTheDocument();

    // 3. Vaga com matching integrado real
    expect(screen.getByText("Desenvolvedor Next.js")).toBeInTheDocument();
    expect(screen.getByText("FinSecure")).toBeInTheDocument();
    expect(screen.getByText(/match/i)).toBeInTheDocument();

    // 4. Status com Badge visual
    expect(screen.getAllByText("Em Entrevista").length).toBeGreaterThanOrEqual(1);
  });
});
