"use client";

import { useState } from "react";
import Link from "next/link";
import { moderateJobStatus } from "@/lib/actions/admin";

interface JobItem {
  id: string;
  title: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED" | string;
  modality: string | null;
  level: string | null;
  location: string | null;
  created_at: string;
  companyName: string;
}

interface AdminJobsListProps {
  jobs: JobItem[];
}

export function AdminJobsList({ jobs }: AdminJobsListProps) {
  const [isPending, setIsPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const handleUpdateStatus = async (jobId: string, status: "ACTIVE" | "PAUSED" | "CLOSED") => {
    setIsPending(jobId);
    setFeedback(null);

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("status", status);

    const res = await moderateJobStatus(formData);
    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({
        type: "success",
        message: `Status da oportunidade atualizado para ${status}.`,
      });
    }
    setIsPending(null);
  };

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === "ALL") return true;
    return j.status === statusFilter;
  });

  return (
    <div className="admin-jobs-container" data-testid="admin-jobs-section">
      <div className="admin-filter-bar">
        <label htmlFor="job-status-filter" className="admin-filter-label">
          Filtrar vagas:
        </label>
        <select
          id="job-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input admin-filter-select"
        >
          <option value="ALL">Todas ({jobs.length})</option>
          <option value="ACTIVE">Ativas</option>
          <option value="PAUSED">Pausadas</option>
          <option value="CLOSED">Encerradas</option>
        </select>
      </div>

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={feedback.type === "error" ? "auth-error" : "apply-success-box"}
          style={{ marginBottom: "var(--space-3)" }}
        >
          {feedback.message}
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div className="dashboard-empty-state" style={{ minHeight: "120px" }}>
          Nenhuma vaga cadastrada para o filtro selecionado.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Lista de Vagas para Moderação">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Empresa</th>
                <th>Modalidade / Nível</th>
                <th>Status</th>
                <th>Moderação</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <Link href={`/vagas/${j.id}`} className="text-electric-blue" target="_blank">
                      {j.title} ↗
                    </Link>
                    <span className="admin-subtext">ID: {j.id.slice(0, 8)}...</span>
                  </td>
                  <td>{j.companyName}</td>
                  <td>
                    {j.modality || "—"} {j.level ? `· ${j.level}` : ""}
                  </td>
                  <td>
                    <span className={`admin-badge-status status-${j.status.toLowerCase()}`}>
                      {j.status === "ACTIVE"
                        ? "Ativa"
                        : j.status === "PAUSED"
                        ? "Pausada"
                        : "Encerrada"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      {j.status !== "ACTIVE" && (
                        <button
                          type="button"
                          disabled={isPending === j.id}
                          onClick={() => handleUpdateStatus(j.id, "ACTIVE")}
                          className="btn btn-secondary btn-sm"
                        >
                          Ativar
                        </button>
                      )}
                      {j.status !== "PAUSED" && (
                        <button
                          type="button"
                          disabled={isPending === j.id}
                          onClick={() => handleUpdateStatus(j.id, "PAUSED")}
                          className="btn btn-ghost btn-sm"
                        >
                          Pausar
                        </button>
                      )}
                      {j.status !== "CLOSED" && (
                        <button
                          type="button"
                          disabled={isPending === j.id}
                          onClick={() => handleUpdateStatus(j.id, "CLOSED")}
                          className="btn btn-ghost btn-sm btn-danger-subtle"
                        >
                          Encerrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

