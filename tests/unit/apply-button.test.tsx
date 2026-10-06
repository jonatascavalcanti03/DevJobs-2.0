import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import * as applicationActions from "@/lib/actions/applications";

describe("ApplyButton — Estados de Interface e Acessibilidade", () => {
  const jobId = "11111111-1111-4111-8111-111111111111";

  it("renderiza link para login quando usuário não está autenticado", () => {
    render(
      <ApplyButton
        jobId={jobId}
        isJobActive={true}
        userRole={null}
        hasApplied={false}
      />
    );

    const link = screen.getByRole("link", { name: /candidatar-se à vaga/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", `/login?redirect=${encodeURIComponent(`/vagas/${jobId}`)}`);
    expect(screen.getByText(/faça login ou crie sua conta/i)).toBeInTheDocument();
  });

  it("renderiza aviso informativo quando o usuário é uma COMPANY", () => {
    render(
      <ApplyButton
        jobId={jobId}
        isJobActive={true}
        userRole="COMPANY"
        hasApplied={false}
      />
    );

    expect(screen.getByText(/conta corporativa/i)).toBeInTheDocument();
    expect(screen.getByText(/perfis de empresa não podem se candidatar/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /candidatar-se/i })).not.toBeInTheDocument();
  });

  it("renderiza estado inativo quando a vaga não está ACTIVE", () => {
    render(
      <ApplyButton
        jobId={jobId}
        isJobActive={false}
        userRole="CANDIDATE"
        hasApplied={false}
      />
    );

    const button = screen.getByRole("button", { name: /vaga indisponível/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/não está recebendo novas candidaturas/i)).toBeInTheDocument();
  });

  it("renderiza estado 'Você já se candidatou' com link para dashboard quando hasApplied é true", () => {
    render(
      <ApplyButton
        jobId={jobId}
        isJobActive={true}
        userRole="CANDIDATE"
        hasApplied={true}
      />
    );

    expect(screen.getByText(/você já se candidatou a esta vaga/i)).toBeInTheDocument();
    const dashboardLink = screen.getByRole("link", { name: /ver minhas candidaturas/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/candidato");
  });

  it("executa a candidatura real e atualiza para estado de sucesso ao clicar", async () => {
    vi.spyOn(applicationActions, "applyToJob").mockResolvedValueOnce({
      success: true,
      applicationId: "app-test-123",
    });

    render(
      <ApplyButton
        jobId={jobId}
        isJobActive={true}
        userRole="CANDIDATE"
        hasApplied={false}
      />
    );

    const button = screen.getByRole("button", { name: /candidatar-se à vaga/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/candidatura realizada com sucesso/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /ver minhas candidaturas/i })).toBeInTheDocument();
    });
  });
});
