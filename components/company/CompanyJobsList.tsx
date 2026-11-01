"use client";

import { useState } from "react";
import Link from "next/link";
import { updateJobStatus, updateJobContent } from "@/lib/actions/company-jobs";

export interface CompanyJobItem {
  id: string;
  title: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | string;
  modality: string | null;
  level: string | null;
  location: string | null;
  created_at: string;
}

interface CompanyJobsListProps {
  jobs: CompanyJobItem[];
}

export function CompanyJobsList({ jobs }: CompanyJobsListProps) {
  const [isPending, setIsPending] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    setIsPending(jobId);
    setFeedback(null);
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("status", newStatus);

    const res = await updateJobStatus(formData);
    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({
        type: "success",
        message: newStatus === "ACTIVE" ? "Oportunidade reativada no catálogo." : "Oportunidade pausada.",
      });
    }
    setIsPending(null);
  };

  const handleCloseJob = async (jobId: string) => {
    if (!confirm("Tem certeza que deseja encerrar esta oportunidade? Vagas encerradas bloqueiam candidaturas.")) {
      return;
    }
    setIsPending(jobId);
    setFeedback(null);
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("status", "CLOSED");

    const res = await updateJobStatus(formData);
    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({ type: "success", message: "Oportunidade encerrada com sucesso." });
    }
    setIsPending(null);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>, jobId: string) => {
    e.preventDefault();
    setIsPending(jobId);
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    formData.append("jobId", jobId);

    const res = await updateJobContent(formData);
    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({ type: "success", message: "Conteúdo da oportunidade atualizado com sucesso." });
      setEditingJobId(null);
    }
    setIsPending(null);
  };

  if (jobs.length === 0) {
    return (
      <div className="dashboard-empty-state" style={{ minHeight: "140px" }}>
        Nenhuma vaga cadastrada por sua empresa ainda.
      </div>
    );
  }

  return (
    <div className="company-jobs-list" role="list">
      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={feedback.type === "error" ? "auth-error" : "apply-success-box"}
          style={{ marginBottom: "var(--space-3)" }}
        >
          {feedback.message}
        </p>
      )}

      {jobs.map((job) => {
        const isActive = job.status === "ACTIVE";
        const isPaused = job.status === "PAUSED";
        const isClosed = job.status === "CLOSED";
        const isEditing = editingJobId === job.id;

        return (
          <div
            key={job.id}
            className="company-job-card"
            style={{
              background: "rgba(7, 18, 46, 0.4)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-control)",
              padding: "var(--space-4)",
              marginBottom: "var(--space-3)",
            }}
            role="listitem"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      background: isActive
                        ? "rgba(16, 185, 129, 0.2)"
                        : isPaused
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                      color: isActive ? "#6EE7B7" : isPaused ? "#FCD34D" : "#FCA5A5",
                    }}
                  >
                    {isActive ? "Ativa" : isPaused ? "Pausada" : "Encerrada"}
                  </span>
                  <h4 style={{ fontSize: "1rem", color: "var(--color-text-primary)", margin: 0 }}>
                    <Link href={`/vagas/${job.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {job.title}
                    </Link>
                  </h4>
                </div>

                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "flex", gap: "var(--space-3)" }}>
                  {job.modality && <span>{job.modality}</span>}
                  {job.level && <span>• {job.level}</span>}
                  {job.location && <span>• {job.location}</span>}
                  <span>• Criada em {new Date(job.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                {!isClosed && (
                  <button
                    type="button"
                    disabled={isPending === job.id}
                    onClick={() => setEditingJobId(isEditing ? null : job.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.8125rem", padding: "0.35rem 0.75rem" }}
                  >
                    {isEditing ? "Fechar Edição" : "Editar"}
                  </button>
                )}

                {!isClosed && (
                  <button
                    type="button"
                    disabled={isPending === job.id}
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "0.8125rem", padding: "0.35rem 0.75rem" }}
                  >
                    {isPending === job.id ? "Alterando..." : isActive ? "Pausar" : "Reativar"}
                  </button>
                )}

                {!isClosed && (
                  <button
                    type="button"
                    disabled={isPending === job.id}
                    onClick={() => handleCloseJob(job.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "0.8125rem", padding: "0.35rem 0.75rem", color: "#F87171" }}
                  >
                    Encerrar
                  </button>
                )}

                <Link
                  href={`/vagas/${job.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.8125rem", padding: "0.35rem 0.75rem" }}
                >
                  Ver Página →
                </Link>
              </div>
            </div>

            {/* Formulário de Edição Inline (RF18) */}
            {isEditing && (
              <form
                onSubmit={(e) => handleSaveEdit(e, job.id)}
                className="auth-form"
                style={{
                  marginTop: "var(--space-4)",
                  padding: "var(--space-4)",
                  background: "rgba(15, 29, 69, 0.7)",
                  borderRadius: "var(--radius-control)",
                  borderTop: "1px solid var(--color-border-medium)",
                }}
              >
                <div className="form-group">
                  <label htmlFor={`edit-title-${job.id}`}>Título da Vaga</label>
                  <input
                    id={`edit-title-${job.id}`}
                    name="title"
                    defaultValue={job.title}
                    required
                    minLength={3}
                    className="form-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
                  <div className="form-group">
                    <label htmlFor={`edit-modality-${job.id}`}>Modalidade</label>
                    <select
                      id={`edit-modality-${job.id}`}
                      name="modality"
                      defaultValue={job.modality || "REMOTE"}
                      className="form-input"
                    >
                      <option value="REMOTE">Remoto</option>
                      <option value="HYBRID">Híbrido</option>
                      <option value="ON_SITE">Presencial</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`edit-level-${job.id}`}>Nível</label>
                    <select
                      id={`edit-level-${job.id}`}
                      name="level"
                      defaultValue={job.level || "PLENO"}
                      className="form-input"
                    >
                      <option value="JUNIOR">Júnior</option>
                      <option value="PLENO">Pleno</option>
                      <option value="SENIOR">Sênior</option>
                      <option value="LEAD">Especialista / Lead</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`edit-location-${job.id}`}>Localização</label>
                    <input
                      id={`edit-location-${job.id}`}
                      name="location"
                      defaultValue={job.location || ""}
                      placeholder="Ex.: São Paulo, SP"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`edit-desc-${job.id}`}>Descrição Detalhada</label>
                  <textarea
                    id={`edit-desc-${job.id}`}
                    name="description"
                    defaultValue={job.description || ""}
                    required
                    rows={4}
                    minLength={10}
                    placeholder="Responsabilidades, requisitos e benefícios"
                    className="form-input"
                  />
                </div>

                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button type="submit" disabled={isPending === job.id} className="btn btn-primary btn-sm">
                    {isPending === job.id ? "Salvando..." : "Salvar Alterações"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingJobId(null)}
                    disabled={isPending === job.id}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
