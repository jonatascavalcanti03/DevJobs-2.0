import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

describe("ThemeToggle — Acessibilidade e Alternância de Tema Claro/Escuro", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renderiza o botão com atributo acessível aria-label", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /mudar para tema claro|alternar tema/i });
    expect(button).toBeInTheDocument();
  });

  it("inicia em tema escuro por padrão caso não haja preferência salva", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("alterna de escuro para claro ao clicar e atualiza o atributo data-theme e localStorage", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    
    // Primeiro clique: deve ir para light
    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("techlink-theme")).toBe("light");
    expect(button).toHaveAttribute("aria-label", "Mudar para tema escuro");

    // Segundo clique: deve voltar para dark
    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("techlink-theme")).toBe("dark");
    expect(button).toHaveAttribute("aria-label", "Mudar para tema claro");
  });

  it("recupera a preferência salva em localStorage ao montar", () => {
    localStorage.setItem("techlink-theme", "light");
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("respeita prefers-color-scheme caso não haja escolha no localStorage", () => {
    // Simula janela com preferência clara
    const matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: light)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal("matchMedia", matchMediaMock);

    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    vi.unstubAllGlobals();
  });
});

