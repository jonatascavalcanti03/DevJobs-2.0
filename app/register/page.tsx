"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { register, registerCompany } from "@/lib/actions/auth";

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [roleTab, setRoleTab] = useState<"CANDIDATE" | "COMPANY">("CANDIDATE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleCandidateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerCompany(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <>
      {/* Seletor de Perfil (RF01 e RF02) */}
      <div className="role-selector" role="tablist" aria-label="Tipo de conta">
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "CANDIDATE"}
          className={`role-btn ${roleTab === "CANDIDATE" ? "active" : ""}`}
          onClick={() => {
            setRoleTab("CANDIDATE");
            setError(null);
          }}
          id="tab-candidate"
        >
          Candidato
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={roleTab === "COMPANY"}
          className={`role-btn ${roleTab === "COMPANY" ? "active" : ""}`}
          onClick={() => {
            setRoleTab("COMPANY");
            setError(null);
          }}
          id="tab-company"
        >
          Empresa
        </button>
      </div>

      {roleTab === "CANDIDATE" ? (
        <form onSubmit={handleCandidateSubmit} className="auth-form" aria-labelledby="tab-candidate">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="seu@email.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="••••••••"
              minLength={8}
              className="form-input"
            />
            <span className="form-hint">Use 8+ caracteres, com maiúscula, minúscula, número e símbolo.</span>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isPending}
            id="btn-register-candidate"
          >
            {isPending ? "Criando conta..." : "Criar conta de Candidato"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCompanySubmit} className="auth-form" aria-labelledby="tab-company">
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              required
              placeholder="00.000.000/0001-00"
              className="form-input"
            />
            <span className="form-hint">14 dígitos (pontuação é opcional).</span>
          </div>

          <div className="form-group">
            <label htmlFor="company_name">Razão Social</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              required
              placeholder="Ex.: Tech Inovações S.A."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="trading_name">Nome Fantasia (opcional)</label>
            <input
              type="text"
              id="trading_name"
              name="trading_name"
              placeholder="Ex.: Tech Inov"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_email">E-mail corporativo</label>
            <input
              type="email"
              id="company_email"
              name="email"
              required
              placeholder="recrutamento@empresa.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_password">Senha</label>
            <input
              type="password"
              id="company_password"
              name="password"
              required
              placeholder="••••••••"
              minLength={8}
              className="form-input"
            />
            <span className="form-hint">Use 8+ caracteres, com maiúscula, minúscula, número e símbolo.</span>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isPending}
            id="btn-register-company"
          >
            {isPending ? "Cadastrando empresa..." : "Cadastrar Empresa"}
          </button>
        </form>
      )}

      <div className="auth-footer">
        <p>
          Já tem uma conta?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="auth-link">
            Entrar
          </Link>
        </p>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo" aria-label="Voltar para a página inicial">
            <div className="header-logo-icon" aria-hidden="true">
              TL
            </div>
            <span>TechLink</span>
          </Link>
          <h1 className="auth-title">Crie sua conta</h1>
          <p className="auth-subtitle">Escolha seu perfil para iniciar no TechLink.</p>
        </div>

        <Suspense fallback={<div>Carregando formulário...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
