"use client";

import { useState } from "react";
import Link from "next/link";
import { applyToJob } from "@/lib/actions/applications";

interface ApplyButtonProps {
  jobId: string;
  isJobActive: boolean;
  userRole: "CANDIDATE" | "COMPANY" | "ADMIN" | null;
  hasApplied: boolean;
}

export function ApplyButton({
  jobId,
  isJobActive,
  userRole,
  hasApplied: initialHasApplied,
}: ApplyButtonProps) {
  const [hasApplied, setHasApplied] = useState(initialHasApplied);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Caso 1: Usuário não autenticado
  if (!userRole) {
    return (
      <div className="apply-cta-container">
        <Link
          href={`/login?redirect=${encodeURIComponent(`/vagas/${jobId}`)}`}
          className="btn btn-primary apply-cta-btn"
          id="btn-apply-login"
        >
          Candidatar-se à vaga
        </Link>
        <p className="apply-cta-hint">
          Faça login ou crie sua conta de candidato para se candidatar.
        </p>
      </div>
    );
  }

  // Caso 2: Vaga não está ativa
  if (!isJobActive) {
    return (
      <div className="apply-cta-container">
        <button
          type="button"
          disabled
          className="btn btn-secondary apply-cta-btn"
          aria-disabled="true"
        >
          Vaga Indisponível
        </button>
        <p className="apply-cta-hint text-warning">
          Esta vaga não está recebendo novas candidaturas no momento.
        </p>
      </div>
    );
  }

  // Caso 3: Usuário é COMPANY (ou outro não-candidato)
  if (userRole === "COMPANY") {
    return (
      <div className="apply-cta-container">
        <div className="apply-company-notice" role="status">
          <strong>Conta Corporativa:</strong> Perfis de empresa não podem se candidatar a vagas de emprego.
        </div>
      </div>
    );
  }

  // Caso 4: Já candidatado
  if (hasApplied) {
    return (
      <div className="apply-cta-container">
        <div className="apply-success-box" role="status">
          <div className="apply-success-icon" aria-hidden="true">✓</div>
          <div className="apply-success-info">
            <h3 className="apply-success-title">Você já se candidatou a esta vaga</h3>
            <p className="apply-success-text">
              {feedback?.type === "success"
                ? feedback.message
                : "Sua candidatura foi registrada e está disponível no seu painel."}
            </p>
            <Link
              href="/dashboard/candidato"
              className="btn btn-secondary btn-sm apply-dashboard-link"
              id="link-view-my-applications"
            >
              Ver minhas candidaturas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Caso 5: Candidato elegível para se candidatar
  const handleApply = async () => {
    setIsPending(true);
    setFeedback(null);

    const result = await applyToJob(jobId);

    if (result.success) {
      setHasApplied(true);
      setFeedback({
        type: "success",
        message: "Candidatura realizada com sucesso.",
      });
    } else {
      if (result.error?.code === "ALREADY_APPLIED") {
        setHasApplied(true);
      }
      setFeedback({
        type: "error",
        message: result.error?.message || "Não foi possível registrar a candidatura.",
      });
    }

    setIsPending(false);
  };

  return (
    <div className="apply-cta-container">
      {feedback?.type === "error" && (
        <div className="apply-error-notice" role="alert">
          {feedback.message}
        </div>
      )}

      <button
        type="button"
        onClick={handleApply}
        disabled={isPending}
        className="btn btn-primary apply-cta-btn"
        id="btn-apply-job"
        aria-busy={isPending}
      >
        {isPending ? "Registrando candidatura..." : "Candidatar-se à vaga"}
      </button>
    </div>
  );
}
