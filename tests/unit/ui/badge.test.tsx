import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge — Componente Visual de Tags e Status", () => {
  it("renderiza o texto filho e a variante padrão (tech)", () => {
    render(<Badge>React</Badge>);
    const badge = screen.getByText("React");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("techlink-badge", "techlink-badge-tech", "techlink-badge-sm");
  });

  it("renderiza variantes específicas com classes semânticas", () => {
    const { rerender } = render(<Badge variant="modality">Remoto</Badge>);
    expect(screen.getByText("Remoto")).toHaveClass("techlink-badge-modality");

    rerender(<Badge variant="level">Sênior</Badge>);
    expect(screen.getByText("Sênior")).toHaveClass("techlink-badge-level");

    rerender(<Badge variant="success">Aprovado</Badge>);
    expect(screen.getByText("Aprovado")).toHaveClass("techlink-badge-success");
  });

  it("renderiza ponto indicador (dot) quando solicitado", () => {
    const { container } = render(<Badge dot={true}>Online</Badge>);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).toBeInTheDocument();
  });

  it("suporta tamanho médio (md)", () => {
    render(<Badge size="md">TypeScript</Badge>);
    expect(screen.getByText("TypeScript")).toHaveClass("techlink-badge-md");
  });
});
