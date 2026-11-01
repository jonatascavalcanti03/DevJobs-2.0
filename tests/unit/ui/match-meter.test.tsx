import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchMeter } from "@/components/ui/MatchMeter";

describe("MatchMeter — Componente Visual de Afinidade e Acessibilidade", () => {
  it("renderiza corretamente com score alto (>= 80%) e atributos de acessibilidade", () => {
    render(<MatchMeter score={85} showLabel={true} />);

    const meter = screen.getByRole("meter");
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-valuenow", "85");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-label", "85% de afinidade - Alta afinidade");

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("Alta afinidade")).toBeInTheDocument();
  });

  it("renderiza corretamente com score médio (50% a 79%)", () => {
    render(<MatchMeter score={65} showLabel={true} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "65");
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("Média afinidade")).toBeInTheDocument();
  });

  it("renderiza corretamente com score baixo (< 50%)", () => {
    render(<MatchMeter score={35} showLabel={true} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "35");
    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("Afinidade inicial")).toBeInTheDocument();
  });

  it("limita scores fora do intervalo [0, 100] de forma segura", () => {
    const { rerender } = render(<MatchMeter score={120} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("100")).toBeInTheDocument();

    rerender(<MatchMeter score={-15} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("trata valores nulos ou indefinidos como estado neutro sem quebrar", () => {
    render(<MatchMeter score={null} showLabel={true} />);

    const meter = screen.getByRole("meter");
    expect(meter).not.toHaveAttribute("aria-valuenow");
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("Não calculado")).toBeInTheDocument();
  });

  it("permite rótulo customizado via prop label", () => {
    render(<MatchMeter score={90} showLabel={true} label="Match Técnico" />);
    expect(screen.getByText("Match Técnico")).toBeInTheDocument();
  });

  it("aplica classes de tamanho corretamente (sm, md, lg)", () => {
    const { container: cSm } = render(<MatchMeter score={80} size="sm" />);
    expect(cSm.querySelector(".match-meter-sm")).toBeInTheDocument();

    const { container: cLg } = render(<MatchMeter score={80} size="lg" />);
    expect(cLg.querySelector(".match-meter-lg")).toBeInTheDocument();
  });
});
