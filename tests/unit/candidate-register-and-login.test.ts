// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockRevalidatePath = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

import { register, login } from "@/lib/actions/auth";

describe("Autenticação sem Dependência de E-mail — Candidato e Login (ETAPA 7.6.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cadastro de Candidato (register)", () => {
    const validCandidateFormData = (extraFields?: Record<string, string>) => {
      const fd = new FormData();
      fd.append("email", "candidato.demo@techlink.com");
      fd.append("password", "Forte@2026Pass");
      if (extraFields) {
        for (const [key, value] of Object.entries(extraFields)) {
          fd.append(key, value);
        }
      }
      return fd;
    };

    it("1. Cadastra candidato com sucesso quando 'Confirm email' está desativado (retorna sessão ativa e vai para /dashboard)", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: "cand-uuid-001",
            email: "candidato.demo@techlink.com",
          },
          session: {
            access_token: "mock-session-token",
            expires_in: 3600,
          },
        },
        error: null,
      });

      await expect(register(validCandidateFormData())).rejects.toThrow("NEXT_REDIRECT:/dashboard");
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "candidato.demo@techlink.com",
        password: "Forte@2026Pass",
      });
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("2. Redireciona para /login?registered=1 caso a sessão seja nula (modo confirmação ativada)", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: "cand-uuid-002",
            email: "candidato.demo@techlink.com",
          },
          session: null,
        },
        error: null,
      });

      await expect(register(validCandidateFormData())).rejects.toThrow("NEXT_REDIRECT:/login?registered=1");
      expect(mockRedirect).toHaveBeenCalledWith("/login?registered=1");
    });

    it("3. Rejeita tentativa de cadastro com e-mail inválido ou senha fraca", async () => {
      const invalidFd = new FormData();
      invalidFd.append("email", "email-invalido");
      invalidFd.append("password", "fraca");

      const result = await register(invalidFd);
      expect(result).toHaveProperty("error");
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("4. Retorna mensagem clara caso o e-mail já esteja cadastrado no Supabase", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "User already registered", status: 400 },
      });

      const result = await register(validCandidateFormData());
      expect(result).toEqual({ error: "Este e-mail já está em uso no sistema." });
    });

    it("5. Proteção contra elevação de privilégio: campos extras como role=ADMIN são desconsiderados", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: "cand-uuid-003", email: "hacker@test.com" },
          session: { access_token: "tok" },
        },
        error: null,
      });

      const fd = validCandidateFormData({ role: "ADMIN", is_admin: "true" });
      await expect(register(fd)).rejects.toThrow("NEXT_REDIRECT:/dashboard");

      // Confirma que apenas email e password validados foram repassados ao Supabase Auth
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "candidato.demo@techlink.com",
        password: "Forte@2026Pass",
      });
    });
  });

  describe("Login de Usuários (login)", () => {
    const validLoginFormData = (redirectTo?: string) => {
      const fd = new FormData();
      fd.append("email", "usuario@techlink.com");
      fd.append("password", "Forte@2026Pass");
      if (redirectTo) {
        fd.append("redirectTo", redirectTo);
      }
      return fd;
    };

    it("6. Realiza login com sucesso e redireciona para /dashboard por padrão", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: "usr-01" }, session: { access_token: "tok" } },
        error: null,
      });

      await expect(login(validLoginFormData())).rejects.toThrow("NEXT_REDIRECT:/dashboard");
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "usuario@techlink.com",
        password: "Forte@2026Pass",
      });
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("7. Respeita redirectTo interno válido e rejeita open redirect malicioso", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: "usr-01" } },
        error: null,
      });

      // Redirect interno permitido
      await expect(login(validLoginFormData("/vagas"))).rejects.toThrow("NEXT_REDIRECT:/vagas");
      expect(mockRedirect).toHaveBeenCalledWith("/vagas");

      // Open redirect bloqueado
      await expect(login(validLoginFormData("//malicious-site.com"))).rejects.toThrow("NEXT_REDIRECT:/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("8. Retorna erro amigável em caso de credenciais inválidas", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials", status: 400 },
      });

      const result = await login(validLoginFormData());
      expect(result).toEqual({ error: "Não foi possível entrar com estas credenciais." });
    });

    it("9. Orienta claramente sobre confirmação de e-mail desativada em caso de erro 'Email not confirmed'", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Email not confirmed", status: 400 },
      });

      const result = await login(validLoginFormData());
      expect(result?.error).toContain("Confirm email");
    });
  });
});

