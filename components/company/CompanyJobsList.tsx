"use client";

import { useState } from "react";
import Link from "next/link";
import { updateJobStatus } from "@/lib/actions/company-jobs";

export interface CompanyJobItem {
  id: string;
  title: string;
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

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    setIsPending(jobId);
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("status", newStatus);

    await updateJobStatus(formData);
    setIsPending(null);
  };

  const handleCloseJob = async (jobId: string) => {
    if (!confirm("Tem certeza que deseja encerrar esta oportunidade? Vagas encerradas bloqueiam candidaturas.")) {
      return;
    }
    setIsPending(jobId);
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("status", "CLOSED");

    await updateJobStatus(formData);
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
      {jobs.map((job) => {
        const isActive = job.status === "ACTIVE";
        const isPaused = job.status === "PAUSED";
        const isClosed = job.status === "CLOSED";

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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
            role="listitem"
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

            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
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
        );
      })}
    </div>
  );
}
