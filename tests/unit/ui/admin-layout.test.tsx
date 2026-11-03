import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminLayout from "@/app/admin/layout";

// Mocks
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

vi.mock("@/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe("AdminLayout — Shell Seguro de Governança", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Redireciona para /login quando não há usuário autenticado", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    await AdminLayout({ children: <div>Conteúdo</div> });
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("2. Redireciona para /login?error=account quando registro em public.users falha", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "u-err" } }, error: null });
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: null, error: { message: "Not found" } }),
        }),
      }),
    });

    await AdminLayout({ children: <div>Conteúdo</div> });
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=account");
  });

  it("3. Redireciona para /dashboard se papel for CANDIDATE", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "u-cand" } }, error: null });
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: { role: "CANDIDATE" }, error: null }),
        }),
      }),
    });

    await AdminLayout({ children: <div>Conteúdo</div> });
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("4. Redireciona para /dashboard se papel for COMPANY", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "u-comp" } }, error: null });
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: { role: "COMPANY" }, error: null }),
        }),
      }),
    });

    await AdminLayout({ children: <div>Conteúdo</div> });
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("5. Renderiza shell com badge, email e botão de Sair se papel for ADMIN", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "u-admin", email: "admin@techlink.test" } },
      error: null,
    });
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValueOnce({ data: { role: "ADMIN" }, error: null }),
        }),
      }),
    });

    const jsx = await AdminLayout({
      children: <div data-testid="admin-child">Conteúdo Protegido</div>,
    });

    render(jsx);

    expect(screen.getByText("TechLink")).toBeInTheDocument();
    expect(screen.getByText("Administração")).toBeInTheDocument();
    expect(screen.getByText("admin@techlink.test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    expect(screen.getByTestId("admin-child")).toBeInTheDocument();
  });
});

