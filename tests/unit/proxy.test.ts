// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock de @supabase/ssr para testar proxy.ts
const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

describe("Next.js 16 Proxy Session & Route Protection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockGetUser.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("deve exportar config com matcher que ignora arquivos estáticos", async () => {
    const { config } = await import("../../proxy");
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  it("deve permitir requisições sem redirecionamento se variáveis do Supabase não estiverem definidas", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { proxy } = await import("../../proxy");
    const req = new NextRequest("http://localhost:3000/dashboard");
    const response = await proxy(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("deve redirecionar para /login se usuário não estiver autenticado em rota protegida", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

    // Simula usuário não autenticado
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const { proxy } = await import("../../proxy");
    const req = new NextRequest("http://localhost:3000/dashboard/candidato");
    const response = await proxy(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("redirect=%2Fdashboard%2Fcandidato");
  });

  it("deve permitir acesso para rotas protegidas se usuário estiver autenticado", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

    // Simula usuário autenticado
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123", email: "candidate@devjobs.com" } },
      error: null,
    });

    const { proxy } = await import("../../proxy");
    const req = new NextRequest("http://localhost:3000/perfil");
    const response = await proxy(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("deve permitir acesso direto a rotas públicas sem redirecionar", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const { proxy } = await import("../../proxy");
    const req = new NextRequest("http://localhost:3000/");
    const response = await proxy(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
