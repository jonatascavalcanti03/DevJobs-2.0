import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CandidateProfileForm } from "@/components/candidate/CandidateProfileForm";
import * as candidateProfileActions from "@/lib/actions/candidate-profile";

vi.mock("@/lib/actions/candidate-profile", () => ({
  updateCandidateProfile: vi.fn(),
}));

describe("CandidateProfileForm — Edição de Perfil do Candidato", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos com valores iniciais fornecidos", () => {
    render(
      <CandidateProfileForm
        initialProfile={{
          headline: "Engenheiro de Software",
          location: "Curitiba, PR",
          shortSummary: "Desenvolvedor experiente em React e Node.",
        }}
      />
    );

    expect(screen.getByDisplayValue("Engenheiro de Software")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Curitiba, PR")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Desenvolvedor experiente em React e Node.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar perfil/i })).toBeInTheDocument();
  });

  it("submete formulário e exibe feedback de sucesso quando ação retorna sucesso", async () => {
    vi.mocked(candidateProfileActions.updateCandidateProfile).mockResolvedValueOnce({
      success: true,
    });

    render(
      <CandidateProfileForm
        initialProfile={{
          headline: "Tech Lead",
          location: "Remoto",
          shortSummary: "Liderança técnica",
        }}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /salvar perfil/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument();
    });
  });

  it("exibe mensagem de erro quando a ação falha", async () => {
    vi.mocked(candidateProfileActions.updateCandidateProfile).mockResolvedValueOnce({
      error: "Não foi possível salvar o perfil.",
    });

    render(<CandidateProfileForm initialProfile={null} />);

    const submitBtn = screen.getByRole("button", { name: /salvar perfil/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/não foi possível salvar o perfil/i)).toBeInTheDocument();
    });
  });
});
