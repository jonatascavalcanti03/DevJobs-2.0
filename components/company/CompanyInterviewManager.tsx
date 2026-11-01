"use client";

import { useState } from "react";
import { scheduleInterview, updateInterviewStatus } from "@/lib/actions/company-interviews";

export interface CompanyInterviewItem {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW" | string;
  meeting_link: string | null;
  applications?: {
    candidate_profiles?: {
      headline: string | null;
    } | null;
    jobs?: {
      title: string;
    } | null;
  } | null;
}

interface CompanyInterviewManagerProps {
  interviews: CompanyInterviewItem[];
  applications: Array<{
    id: string;
    candidate_profiles?: { headline: string | null } | null;
    jobs?: { title: string } | null;
  }>;
}

export function CompanyInterviewManager({
  interviews,
  applications,
}: CompanyInterviewManagerProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const res = await scheduleInterview(formData);

    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({ type: "success", message: "Entrevista agendada com sucesso!" });
      setShowScheduleModal(false);
    }
    setIsPending(false);
  };

  const handleStatusChange = async (interviewId: string, status: string) => {
    setIsPending(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("interviewId", interviewId);
    formData.append("status", status);

    const res = await updateInterviewStatus(formData);
    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({ type: "success", message: `Status da entrevista atualizado para ${status}.` });
    }
    setIsPending(false);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: "Agendada", color: "#60A5FA" },
    CONFIRMED: { label: "Confirmada", color: "#34D399" },
    COMPLETED: { label: "Realizada", color: "#A78BFA" },
    CANCELED: { label: "Cancelada", color: "#F87171" },
    NO_SHOW: { label: "Não Compareceu", color: "#F59E0B" },
  };

  return (
    <div className="company-interviews-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
            Entrevistas Agendadas ({interviews.length})
          </h3>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            Controle e conduza entrevistas técnicas com candidatos do pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowScheduleModal(!showScheduleModal);
            setFeedback(null);
          }}
          className="btn btn-primary btn-sm"
          style={{ padding: "6px 14px", fontSize: "0.8125rem" }}
        >
          {showScheduleModal ? "Fechar Formulário" : "+ Agendar Entrevista"}
        </button>
      </div>

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={feedback.type === "error" ? "auth-error" : "apply-success-box"}
          style={{ marginBottom: "var(--space-3)" }}
        >
          {feedback.message}
        </p>
      )}

      {/* Formulário de Agendamento */}
      {showScheduleModal && (
        <form
          onSubmit={handleSchedule}
          className="auth-form"
          style={{
            background: "rgba(15, 29, 69, 0.8)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-control)",
            border: "1px solid var(--color-border-medium)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div className="form-group">
            <label htmlFor="interview-app">Candidatura / Candidato</label>
            <select id="interview-app" name="applicationId" required className="form-input">
              <option value="" disabled selected>
                Selecione uma candidatura
              </option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.candidate_profiles?.headline || "Candidato"} — Vaga: {app.jobs?.title || "Oportunidade"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div className="form-group">
              <label htmlFor="interview-time">Data e Horário</label>
              <input
                id="interview-time"
                name="scheduledAt"
                type="datetime-local"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="interview-duration">Duração (Minutos)</label>
              <input
                id="interview-duration"
                name="durationMinutes"
                type="number"
                min={15}
                max={240}
                defaultValue={45}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="interview-link">Link da Sala Virtual (Google Meet, Zoom, Teams)</label>
            <input
              id="interview-link"
              name="meetingLink"
              type="url"
              placeholder="https://meet.google.com/..."
              className="form-input"
            />
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
            {isPending ? "Agendando..." : "Confirmar Agendamento"}
          </button>
        </form>
      )}

      {/* Listagem de Entrevistas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {interviews.map((item) => {
          const statusInfo = statusLabels[item.status] || { label: item.status, color: "#94A3B8" };
          const candidateTitle = item.applications?.candidate_profiles?.headline || "Candidato em processo";
          const jobTitle = item.applications?.jobs?.title || "Vaga";

          return (
            <div
              key={item.id}
              style={{
                background: "rgba(7, 18, 46, 0.4)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-control)",
                padding: "var(--space-4)",
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
                      background: "rgba(255,255,255,0.08)",
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.color}`,
                    }}
                  >
                    {statusInfo.label}
                  </span>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", margin: 0 }}>
                    {candidateTitle}
                  </h4>
                </div>

                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                  💼 Vaga: {jobTitle} • 📅 {new Date(item.scheduled_at).toLocaleString("pt-BR")} ({item.duration_minutes} min)
                </div>

                {item.meeting_link && (
                  <div style={{ marginTop: "var(--space-1)" }}>
                    <a
                      href={item.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75rem", color: "var(--color-electric-blue)", textDecoration: "underline" }}
                    >
                      🔗 Link da Sala de Reunião
                    </a>
                  </div>
                )}
              </div>

              {/* Ações de Status da Entrevista */}
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                {item.status === "SCHEDULED" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(item.id, "CONFIRMED")}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                  >
                    Confirmar
                  </button>
                )}

                {["SCHEDULED", "CONFIRMED"].includes(item.status) && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(item.id, "COMPLETED")}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                  >
                    Concluir
                  </button>
                )}

                {["SCHEDULED", "CONFIRMED"].includes(item.status) && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(item.id, "CANCELED")}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#F87171", fontSize: "0.75rem", padding: "2px 8px" }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {interviews.length === 0 && !showScheduleModal && (
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", padding: "var(--space-4)", textAlign: "center" }}>
            Nenhuma entrevista agendada no momento.
          </div>
        )}
      </div>
    </div>
  );
}
