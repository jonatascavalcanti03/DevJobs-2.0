// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";

// Mock das bibliotecas do Supabase para testes isolados
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn((url: string, key: string) => ({
    supabaseUrl: url,
    supabaseKey: key,
    auth: { getUser: vi.fn() },
  })),
  createServerClient: vi.fn((url: string, key: string, options: unknown) => ({
    supabaseUrl: url,
    supabaseKey: key,
    options,
    auth: { getUser: vi.fn() },
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((url: string, key: string, options: unknown) => ({
    supabaseUrl: url,
    supabaseKey: key,
    options,
    auth: { getUser: vi.fn() },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

describe("Supabase Clients Infrastructure", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("Browser Client (lib/supabase/client.ts)", () => {
    it("deve lançar erro se NEXT_PUBLIC_SUPABASE_URL ou ANON_KEY estiverem ausentes", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { createClient } = await import("../../lib/supabase/client");
      expect(() => createClient()).toThrow(/Configuração do Supabase ausente/);
    });

    it("deve instanciar createBrowserClient com URL e Anon Key quando configuradas", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

      const { createClient } = await import("../../lib/supabase/client");
      const client = createClient();

      expect(client).toBeDefined();
      expect((client as unknown as { supabaseUrl: string }).supabaseUrl).toBe("https://mock.supabase.co");
      expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe("mock-anon-key");
    });

    it("o arquivo client.ts não deve referenciar SUPABASE_SERVICE_ROLE_KEY", () => {
      const clientFileContent = fs.readFileSync(
        path.join(process.cwd(), "lib/supabase/client.ts"),
        "utf8"
      );
      expect(clientFileContent).not.toContain("process.env.SUPABASE_SERVICE_ROLE_KEY");
      expect(clientFileContent).not.toContain('process.env["SUPABASE_SERVICE_ROLE_KEY"]');
    });
  });

  describe("Server Client (lib/supabase/server.ts)", () => {
    it("deve lançar erro se variáveis públicas estiverem ausentes no servidor", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { createClient } = await import("../../lib/supabase/server");
      await expect(createClient()).rejects.toThrow(/Configuração do Supabase ausente/);
    });

    it("deve criar Server Client integrando com cookies do Next.js sem usar Service Role", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role";

      const { createClient } = await import("../../lib/supabase/server");
      const client = await createClient();

      expect(client).toBeDefined();
      expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe("mock-anon-key");
      expect((client as unknown as { supabaseKey: string }).supabaseKey).not.toBe("mock-service-role");
    });

    it("o arquivo server.ts não deve utilizar SUPABASE_SERVICE_ROLE_KEY", () => {
      const serverFileContent = fs.readFileSync(
        path.join(process.cwd(), "lib/supabase/server.ts"),
        "utf8"
      );
      expect(serverFileContent).not.toContain("process.env.SUPABASE_SERVICE_ROLE_KEY");
      expect(serverFileContent).not.toContain('process.env["SUPABASE_SERVICE_ROLE_KEY"]');
    });
  });

  describe("Admin Client (lib/supabase/admin.ts)", () => {
    it("deve exigir SUPABASE_SERVICE_ROLE_KEY e lançar erro se estiver ausente", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { createAdminClient } = await import("../../lib/supabase/admin");
      expect(() => createAdminClient()).toThrow(/Configuração administrativa do Supabase ausente/);
    });

    it("deve instanciar createClient com persistSession: false e autoRefreshToken: false", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role";

      const { createAdminClient } = await import("../../lib/supabase/admin");
      const client = createAdminClient();

      expect(client).toBeDefined();
      expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe("mock-service-role");
      expect((client as unknown as { options: { auth: { persistSession: boolean } } }).options.auth.persistSession).toBe(false);
      expect((client as unknown as { options: { auth: { autoRefreshToken: boolean } } }).options.auth.autoRefreshToken).toBe(false);
    });

    it("deve bloquear a execução caso detecte ambiente de navegador (window definido)", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role";

      // Simula window
      // @ts-expect-error teste de proteção
      global.window = {} as unknown;

      const { createAdminClient } = await import("../../lib/supabase/admin");
      expect(() => createAdminClient()).toThrow(/VIOLAÇÃO DE SEGURANÇA/);

      // @ts-expect-error limpeza
      delete global.window;
    });
  });

  describe("Arquitetura e Governança de Arquivos", () => {
    it("NÃO deve existir middleware.ts na raiz do projeto (Next.js 16 usa proxy.ts)", () => {
      const middlewarePath = path.join(process.cwd(), "middleware.ts");
      expect(fs.existsSync(middlewarePath)).toBe(false);
    });

    it("proxy.ts deve existir na raiz do projeto", () => {
      const proxyPath = path.join(process.cwd(), "proxy.ts");
      expect(fs.existsSync(proxyPath)).toBe(true);
    });
  });
});
