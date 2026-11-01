import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompanyPipelineKanban } from "@/components/company/CompanyPipelineKanban";

const mockAdvanceApplicationStage = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/actions/company-jobs", () => ({
  advanceApplicationStage: (...args: unknown[]) => mockAdvanceApplicationStage(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const applications = [
  {
    id: "application-1",
    status: "SUBMITTED",
    created_at: "2026-10-23T12:00:00.000Z",
    candidate_profiles: { headline: "Pessoa candidata", location: "São Paulo", short_summary: null },
    jobs: { id: "job-1", title: "Desenvolvedor" },
  },
  {
    id: "application-2",
    status: "CLOSED",
    created_at: "2026-10-23T12:00:00.000Z",
    candidate_profiles: { headline: "Processo encerrado", location: null, short_summary: null },
    jobs: { id: "job-1", title: "Desenvolvedor" },
  },
];

describe("CompanyPipelineKanban — RF33", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("oferece apenas as transições permitidas para o status atual", () => {
    render(<CompanyPipelineKanban applications={applications} history={[]} />);

    const select = screen.getByLabelText("Mover para:");
    expect(Array.from((select as HTMLSelectElement).options).map((option) => option.value)).toEqual([
      "",
      "SCREENING",
      "REJECTED",
      "ADVANCING",
      "CLOSED",
    ]);
    expect(screen.queryByRole("option", { name: "Contratados" })).not.toBeInTheDocument();
  });

  it("mostra os processos encerrados e impede nova transição", () => {
    render(<CompanyPipelineKanban applications={applications} history={[]} />);

    expect(screen.getByRole("heading", { name: "Candidaturas encerradas" })).toBeInTheDocument();
    expect(screen.getAllByText("Processo encerrado")).toHaveLength(2);
    expect(screen.getByText("Processo encerrado", { selector: "p" })).toBeInTheDocument();
  });

  it("exibe sucesso e atualiza a rota após a RPC aprovada", async () => {
    mockAdvanceApplicationStage.mockResolvedValue({ success: true });
    render(<CompanyPipelineKanban applications={[applications[0]]} history={[]} />);

    fireEvent.change(screen.getByLabelText("Mover para:"), { target: { value: "SCREENING" } });

    await waitFor(() => {
      expect(mockAdvanceApplicationStage).toHaveBeenCalledOnce();
      expect(screen.getByRole("status")).toHaveTextContent("Etapa atualizada com sucesso.");
    });
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it("exibe erro seguro retornado pela Server Action", async () => {
    mockAdvanceApplicationStage.mockResolvedValue({ error: "Transição não permitida." });
    render(<CompanyPipelineKanban applications={[applications[0]]} history={[]} />);

    fireEvent.change(screen.getByLabelText("Mover para:"), { target: { value: "SCREENING" } });

    expect(await screen.findByRole("alert")).toHaveTextContent("Transição não permitida.");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("apresenta o histórico retornado pela consulta autorizada", () => {
    render(
      <CompanyPipelineKanban
        applications={[applications[0]]}
        history={[{
          id: "history-1",
          application_id: "application-1",
          previous_status: "SUBMITTED",
          new_status: "SCREENING",
          changed_by: "recruiter-1",
          created_at: "2026-10-23T12:00:00.000Z",
        }]}
      />
    );

    expect(screen.getByText("Histórico de etapas (1)")).toBeInTheDocument();
    expect(screen.getByText(/Inscritos.*Triagem.*Equipe recrutadora/)).toBeInTheDocument();
  });
});
