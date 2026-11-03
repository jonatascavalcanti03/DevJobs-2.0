"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setIsPending(false);
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo" aria-label="Voltar para a página inicial">
            <div className="header-logo-icon" aria-hidden="true">TL</div>
            <span>TechLink</span>
          </Link>
          <h1 className="auth-title">Recuperar senha</h1>
          <p className="auth-subtitle">
            Informe seu e-mail cadastrado e enviaremos instruções com token de uso único para redefinição.
          </p>
        </div>

        <div
          role="note"
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--color-text-primary)" }}>Ambiente de Demonstração:</strong> O serviço de envio de e-mails via SMTP está desativado para a apresentação acadêmica.
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
            <div style={{ color: "#34D399", fontWeight: 600, marginBottom: "var(--space-2)" }}>
              Link de recuperação enviado com sucesso!
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "var(--space-4)" }}>
              Verifique sua caixa de entrada e siga as instruções para redefinir seu acesso com segurança.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ display: "inline-block" }}>
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">E-mail cadastrado</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="seu@email.com"
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
              {isPending ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <div className="auth-footer" style={{ marginTop: "var(--space-4)" }}>
              <p>
                Lembrou sua senha?{" "}
                <Link href="/login" className="auth-link">
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
