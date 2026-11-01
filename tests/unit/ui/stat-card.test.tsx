import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/ui/StatCard";

describe("StatCard — Componente Visual de Métricas de Dashboard", () => {
  it("renderiza título, valor e subtítulo com acessibilidade", () => {
    render(
      <StatCard
        title="Candidaturas Ativas"
        value={14}
        subtitle="3 aguardando triagem"
      />
    );

    expect(screen.getByText("Candidaturas Ativas")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("3 aguardando triagem")).toBeInTheDocument();

    const card = screen.getByRole("article", {
      name: "Candidaturas Ativas: 14 - 3 aguardando triagem",
    });
    expect(card).toBeInTheDocument();
  });

  it("renderiza indicador de tendência positiva e negativa", () => {
    const { rerender } = render(
      <StatCard
        title="Visualizações"
        value={320}
        trend={{ value: "18%", isPositive: true }}
      />
    );
    expect(screen.getByText("↑ 18%")).toBeInTheDocument();

    rerender(
      <StatCard
        title="Visualizações"
        value={250}
        trend={{ value: "5%", isPositive: false }}
      />
    );
    expect(screen.getByText("↓ 5%")).toBeInTheDocument();
  });

  it("renderiza ícone quando fornecido", () => {
    render(
      <StatCard
        title="Entrevistas"
        value={2}
        icon={<span data-testid="test-icon">📅</span>}
      />
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renderiza estado de skeleton acessível durante carregamento", () => {
    render(
      <StatCard
        title="Vagas Abertas"
        value={5}
        isLoading={true}
      />
    );

    const skeletonCard = screen.getByRole("article", {
      name: "Carregando métrica Vagas Abertas",
    });
    expect(skeletonCard).toBeInTheDocument();
    expect(skeletonCard).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });
});
