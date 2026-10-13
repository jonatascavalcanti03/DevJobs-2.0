"use client";

import { useState } from "react";
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

interface CompanyPipelineKanbanProps {
  applications: CompanyApplicationItem[];
}

const STAGES = [
  { key: "SUBMITTED", label: "Inscritos", color: "#60A5FA" },
  { key: "SCREENING", label: "Triagem", color: "#F59E0B" },
  { key: "INTERVIEW", label: "Entrevistas", color: "#A78BFA" },
  { key: "ADVANCING", label: "Finalistas", color: "#38BDF8" },
  { key: "HIRED", label: "Contratados", color: "#34D399" },
  { key: "REJECTED", label: "Desqualificados", color: "#F87171" },
];

export function CompanyPipelineKanban({ applications }: CompanyPipelineKanbanProps) {
  const [isPending, setIsPending] = useState<string | null>(null);

  const handleStageChange = async (applicationId: string, newStatus: string) => {
    setIsPending(applicationId);
    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("newStatus", newStatus);

    await advanceApplicationStage(formData);
    setIsPending(null);
  };

  if (applications.length === 0) {
    return (
      <div className="dashboard-empty-state" style={{ minHeight: "140px" }}>
        Nenhuma candidatura recebida nas vagas da empresa até o momento.
      </div>
    );
  }

  return (
    <div className="company-kanban-container" style={{ overflowX: "auto", paddingBottom: "var(--space-4)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
        {STAGES.map((stage) => {
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-3)",
                  borderBottom: `2px solid ${stage.color}`,
                  paddingBottom: "var(--space-2)",
                }}
              >
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {stage.label}
                </span>
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "9999px",
                    padding: "2px 6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {stageApps.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
                {stageApps.map((app) => (
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

                    {/* Ações de Transição de Etapa (RF33) */}
                    <div style={{ marginTop: "var(--space-2)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "var(--space-2)" }}>
                      <label htmlFor={`stage-select-${app.id}`} style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", display: "block", marginBottom: "2px" }}>
                        Mover para:
                      </label>
                      <select
                        id={`stage-select-${app.id}`}
                        value={app.status}
                        disabled={isPending === app.id}
                        onChange={(e) => handleStageChange(app.id, e.target.value)}
                        className="form-input"
                        style={{ height: "30px", fontSize: "0.75rem", padding: "0 6px" }}
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageApps.length === 0 && (
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textAlign: "center", margin: "auto 0" }}>
                    Vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
