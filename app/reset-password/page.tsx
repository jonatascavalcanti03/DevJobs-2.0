"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo" aria-label="Voltar para a página inicial">
            <div className="header-logo-icon" aria-hidden="true">TL</div>
            <span>TechLink</span>
          </Link>
          <h1 className="auth-title">Nova senha</h1>
          <p className="auth-subtitle">
            Defina sua nova credencial de acesso. A senha deve ter ao menos 8 caracteres, maiúscula, minúscula, número e símbolo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Nova Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="••••••••"
              className="form-input"
            />
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
          >
            {isPending ? "Redefinindo..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </main>
  );
}
