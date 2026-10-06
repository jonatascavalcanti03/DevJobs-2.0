"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        
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
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Ainda não tem conta?{" "}
          <Link href={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="auth-link">
            Cadastre-se
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo" aria-label="Voltar para a página inicial">
            <div className="header-logo-icon" aria-hidden="true">DJ</div>
            <span>DevJobs 2.0</span>
          </Link>
          <h1 className="auth-title">Entrar na sua conta</h1>
          <p className="auth-subtitle">Acesse o DevJobs para gerenciar sua carreira ou suas vagas.</p>
        </div>

        <Suspense fallback={<div>Carregando formulário...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

