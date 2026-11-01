"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { advanceApplicationStage } from "@/lib/actions/company-jobs";

export interface CompanyApplicationItem {
  id: string;
  status: string;
  created_at: string;
  candidate_profiles: {
    headline: string | null;
    location: string | null;
    short_summary: string | null;
  } | null;
  jobs: {
    id: string;
    title: string;
  } | null;
}

export interface ApplicationStageHistoryItem {
  id: string;
  application_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  created_at: string;
}

interface CompanyPipelineKanbanProps {
  applications: CompanyApplicationItem[];
  history: ApplicationStageHistoryItem[];
}

const ACTIVE_STAGES = [
  { key: "SUBMITTED", label: "Inscritos", color: "#60A5FA" },
  { key: "SCREENING", label: "Triagem", color: "#F59E0B" },
  { key: "INTERVIEW", label: "Entrevistas", color: "#A78BFA" },
  { key: "ADVANCING", label: "Finalistas", color: "#38BDF8" },
];

const OUTCOME_STAGES = [
  { key: "HIRED", label: "Contratados", color: "#34D399" },
  { key: "REJECTED", label: "Desqualificados", color: "#F87171" },
  { key: "WITHDRAWN", label: "Desistências", color: "#94A3B8" },
  { key: "CLOSED", label: "Encerradas", color: "#64748B" },
];

const STAGE_LABELS = Object.fromEntries(
  [...ACTIVE_STAGES, ...OUTCOME_STAGES].map((stage) => [stage.key, stage.label])
);

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["SCREENING", "REJECTED", "ADVANCING", "CLOSED"],
  SCREENING: ["INTERVIEW", "REJECTED", "ADVANCING", "SUBMITTED", "CLOSED"],
  INTERVIEW: ["ADVANCING", "REJECTED", "SCREENING", "CLOSED"],
  ADVANCING: ["HIRED", "REJECTED", "INTERVIEW", "CLOSED"],
};

export function CompanyPipelineKanban({ applications, history }: CompanyPipelineKanbanProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleStageChange = async (applicationId: string, newStatus: string) => {
    setIsPending(applicationId);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("newStatus", newStatus);

      const result = await advanceApplicationStage(formData);
      if ("error" in result) {
        setFeedback({ type: "error", message: result.error ?? "Não foi possível atualizar a etapa." });
        return;
      }

      setFeedback({ type: "success", message: "Etapa atualizada com sucesso." });
      router.refresh();
    } finally {
      setIsPending(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="dashboard-empty-state" style={{ minHeight: "140px" }}>
        Nenhuma candidatura recebida nas vagas da empresa até o momento.
      </div>
    );
  }

  const renderCard = (app: CompanyApplicationItem) => {
    const allowedTransitions = ALLOWED_TRANSITIONS[app.status] ?? [];
    const appHistory = history.filter((entry) => entry.application_id === app.id);

    return (
      <div
        key={app.id}
        style={{
          background: "rgba(15, 29, 69, 0.8)",
          border: "1px solid var(--color-border-medium)",
          borderRadius: "var(--radius-control)",
          padding: "var(--space-3)",
          fontSize: "0.8125rem",
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "2px" }}>
          {app.candidate_profiles?.headline || "Candidato Tech"}
        </div>

        <div style={{ color: "var(--color-electric-blue)", fontSize: "0.75rem", marginBottom: "var(--space-2)" }}>
          {app.jobs ? (
            <Link href={`/vagas/${app.jobs.id}`} style={{ color: "inherit", textDecoration: "none" }}>
              💼 {app.jobs.title}
            </Link>
          ) : (
            "Vaga"
          )}
        </div>

        {app.candidate_profiles?.location && (
          <div style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem", marginBottom: "var(--space-2)" }}>
            📍 {app.candidate_profiles.location}
          </div>
        )}

        {allowedTransitions.length > 0 ? (
          <div style={{ marginTop: "var(--space-2)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "var(--space-2)" }}>
            <label htmlFor={`stage-select-${app.id}`} style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", display: "block", marginBottom: "2px" }}>
              Mover para:
            </label>
            <select
              id={`stage-select-${app.id}`}
              defaultValue=""
              disabled={isPending === app.id}
              onChange={(event) => {
                if (event.target.value) handleStageChange(app.id, event.target.value);
              }}
              className="form-input"
              style={{ height: "30px", fontSize: "0.75rem", padding: "0 6px" }}
            >
              <option value="" disabled>Selecionar etapa</option>
              {allowedTransitions.map((status) => (
                <option key={status} value={status}>
                  {STAGE_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "var(--space-2)" }}>
            Processo encerrado
          </p>
        )}

        <details style={{ marginTop: "var(--space-3)" }}>
          <summary style={{ cursor: "pointer", color: "var(--color-electric-blue)", fontSize: "0.75rem" }}>
            Histórico de etapas ({appHistory.length})
          </summary>
          {appHistory.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Nenhuma transição registrada.</p>
          ) : (
            <ol style={{ margin: "var(--space-2) 0 0", paddingLeft: "var(--space-4)", fontSize: "0.75rem" }}>
              {appHistory.map((entry) => (
                <li key={entry.id}>
                  {entry.previous_status ? `${STAGE_LABELS[entry.previous_status]} → ` : "Início → "}
                  {STAGE_LABELS[entry.new_status]} · {new Date(entry.created_at).toLocaleString("pt-BR")} · Equipe recrutadora
                </li>
              ))}
            </ol>
          )}
        </details>
      </div>
    );
  };

  const renderStage = (stage: (typeof ACTIVE_STAGES)[number] | (typeof OUTCOME_STAGES)[number]) => {
    const stageApps = applications.filter((app) => app.status === stage.key);

    return (
      <div
        key={stage.key}
        style={{
          background: "rgba(7, 18, 46, 0.4)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          minHeight: "320px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)", borderBottom: `2px solid ${stage.color}`, paddingBottom: "var(--space-2)" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{stage.label}</span>
          <span style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "9999px", padding: "2px 6px", fontSize: "0.75rem", fontWeight: 600 }}>{stageApps.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
          {stageApps.map(renderCard)}
          {stageApps.length === 0 && <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textAlign: "center", margin: "auto 0" }}>Vazio</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="company-kanban-container" style={{ overflowX: "auto", paddingBottom: "var(--space-4)" }}>
      {feedback && <p className={feedback.type === "error" ? "auth-error" : "apply-success-box"} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
        {ACTIVE_STAGES.map(renderStage)}
      </div>
      <section aria-labelledby="closed-applications-heading" style={{ marginTop: "var(--space-5)" }}>
        <h3 id="closed-applications-heading" style={{ marginBottom: "var(--space-3)" }}>Candidaturas encerradas</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
          {OUTCOME_STAGES.map(renderStage)}
        </div>
      </section>
    </div>
  );
}
