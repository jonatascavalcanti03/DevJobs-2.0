import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobFilters } from "@/components/jobs/JobFilters";

const pushMock = vi.fn();
let searchParamsMock = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => searchParamsMock,
}));

describe("JobFilters — Componente de Busca e Filtros (RF20 e RF21)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsMock = new URLSearchParams();
  });

  it("renderiza a barra de busca e selects de modalidade e senioridade", () => {
    render(<JobFilters totalCount={5} />);

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar por cargo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por modalidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por senioridade/i)).toBeInTheDocument();
    expect(screen.getByText(/5/i)).toBeInTheDocument();
    expect(screen.getByText(/vagas disponíveis/i)).toBeInTheDocument();
  });

  it("exibe mensagem singular quando totalCount é 1", () => {
    render(<JobFilters totalCount={1} />);

    expect(screen.getByText(/1/i)).toBeInTheDocument();
    expect(screen.getByText(/vaga disponível/i)).toBeInTheDocument();
  });

  it("exibe mensagem de nenhuma vaga encontrada quando totalCount é 0", () => {
    render(<JobFilters totalCount={0} />);

    expect(screen.getByText(/nenhuma vaga encontrada/i)).toBeInTheDocument();
  });

  it("dispara busca textual ao submeter o formulário", () => {
    render(<JobFilters totalCount={3} />);

    const searchInput = screen.getByPlaceholderText(/buscar por cargo/i);
    const submitBtn = screen.getByRole("button", { name: /buscar/i });

    fireEvent.change(searchInput, { target: { value: "Full Stack" } });
    fireEvent.click(submitBtn);

    expect(pushMock).toHaveBeenCalledWith("/vagas?q=Full+Stack", { scroll: false });
  });

  it("dispara alteração de filtro ao selecionar modalidade", () => {
    render(<JobFilters totalCount={3} />);

    const modalitySelect = screen.getByLabelText(/filtrar por modalidade/i);
    fireEvent.change(modalitySelect, { target: { value: "REMOTE" } });

    expect(pushMock).toHaveBeenCalledWith("/vagas?modality=REMOTE", { scroll: false });
  });

  it("exibe botão de limpar filtros e reseta URL ao clicar quando há filtro ativo", () => {
    searchParamsMock = new URLSearchParams("modality=REMOTE&q=Dev");
    render(<JobFilters totalCount={2} />);

    const resetBtn = screen.getByRole("button", { name: /limpar todos os filtros/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(pushMock).toHaveBeenCalledWith("/vagas", { scroll: false });
  });
});
