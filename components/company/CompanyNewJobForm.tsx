"use client";

import { useState } from "react";
import { createJob } from "@/lib/actions/company-jobs";

export function CompanyNewJobForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createJob(formData);

    if (result.error) {
      setFeedback({ type: "error", message: result.error });
    } else {
      setFeedback({ type: "success", message: "Vaga publicada com sucesso no catálogo!" });
      form.reset();
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
      }, 1500);
    }

    setIsPending(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-primary btn-sm"
        id="btn-open-new-job"
      >
        + Publicar Nova Vaga
      </button>
    );
  }

  return (
    <div className="company-new-job-box" style={{ background: "rgba(15, 29, 69, 0.7)", border: "1px solid var(--color-border-medium)", borderRadius: "var(--radius-card)", padding: "var(--space-6)", marginTop: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Publicar Oportunidade Técnica (RF17)</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 8px" }}
        >
          ✕ Cancelar
        </button>
      </div>

      {feedback && (
        <div role="status" aria-live="polite" className={feedback.type === "success" ? "alert-success-box" : "auth-error"}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="job-title">Título da Vaga</label>
          <input
            id="job-title"
            name="title"
            required
            placeholder="Ex.: Desenvolvedor Full Stack Sênior"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="job-desc">Descrição e Requisitos</label>
          <textarea
            id="job-desc"
            name="description"
            required
            rows={5}
            placeholder="Descreva as responsabilidades, tecnologias utilizadas e requisitos da posição"
            className="form-input"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div className="form-group">
            <label htmlFor="job-modality">Modalidade</label>
            <select id="job-modality" name="modality" className="form-input" defaultValue="REMOTE">
              <option value="REMOTE">Remoto</option>
              <option value="HYBRID">Híbrido</option>
              <option value="ON_SITE">Presencial</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="job-level">Nível de Senioridade</label>
            <select id="job-level" name="level" className="form-input" defaultValue="PLENO">
              <option value="JUNIOR">Júnior</option>
              <option value="PLENO">Pleno</option>
              <option value="SENIOR">Sênior</option>
              <option value="LEAD">Especialista / Lead</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="job-location">Localização (opcional)</label>
          <input
            id="job-location"
            name="location"
            placeholder="Ex.: São Paulo, SP ou Brasil (Remoto)"
            className="form-input"
          />
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary btn-sm"
            id="btn-submit-job"
          >
            {isPending ? "Publicando..." : "Publicar Vaga Imediatamente"}
          </button>
        </div>
      </form>
    </div>
  );
}
