"use client";

import { useState } from "react";
import { updateCandidateProfile } from "@/lib/actions/candidate-profile";

interface CandidateProfileFormProps {
  initialProfile?: {
    headline?: string | null;
    location?: string | null;
    shortSummary?: string | null;
  } | null;
}

export function CandidateProfileForm({ initialProfile }: CandidateProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateCandidateProfile(formData);

    if (result.error) {
      setFeedback({
        type: "error",
        message: result.error,
      });
    } else {
      setFeedback({
        type: "success",
        message: "Perfil atualizado com sucesso!",
      });
    }

    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form candidate-profile-form">
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={feedback.type === "success" ? "alert-success-box" : "auth-error"}
        >
          {feedback.message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="headline">Título profissional</label>
        <input
          className="form-input"
          id="headline"
          name="headline"
          placeholder="Ex.: Desenvolvedora Front-end"
          defaultValue={initialProfile?.headline ?? ""}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Localização</label>
        <input
          className="form-input"
          id="location"
          name="location"
          placeholder="Ex.: São Paulo, SP"
          defaultValue={initialProfile?.location ?? ""}
        />
      </div>

      <div className="form-group">
        <label htmlFor="shortSummary">Resumo profissional</label>
        <textarea
          className="form-input"
          id="shortSummary"
          name="shortSummary"
          rows={4}
          placeholder="Conte brevemente sobre sua trajetória e competências"
          defaultValue={initialProfile?.shortSummary ?? ""}
        />
      </div>

      <button
        className="btn btn-secondary btn-sm"
        type="submit"
        disabled={isPending}
        id="btn-save-candidate-profile"
      >
        {isPending ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
