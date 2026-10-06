"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { register } from "@/lib/actions/auth";

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"CANDIDATE" | "COMPANY">("CANDIDATE");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append("role", selectedRole);
    // Removemos redirectTo do formData de register porque a action já direciona para /dashboard
    
    const result = await register(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="role-selector">
        <button 
          type="button" 
          className={`role-btn ${selectedRole === "CANDIDATE" ? "active" : ""}`}
          onClick={() => setSelectedRole("CANDIDATE")}
        >
          Sou Candidato
        </button>
        <button 
          type="button" 
          className={`role-btn ${selectedRole === "COMPANY" ? "active" : ""}`}
          onClick={() => setSelectedRole("COMPANY")}
        >
          Sou Empresa
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
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
            minLength={6}
            className="form-input"
          />
          <span className="form-hint">Mínimo de 6 caracteres.</span>
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
          {isPending ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

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
            <div className="header-logo-icon" aria-hidden="true">DJ</div>
            <span>DevJobs 2.0</span>
          </Link>
          <h1 className="auth-title">Crie sua conta</h1>
          <p className="auth-subtitle">Escolha seu perfil para iniciar no DevJobs.</p>
        </div>

        <Suspense fallback={<div>Carregando formulário...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}

