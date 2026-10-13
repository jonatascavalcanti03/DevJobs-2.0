"use client";

import { useState } from "react";
import { updateCompanyProfile } from "@/lib/actions/company-jobs";

interface CompanyProfileFormProps {
  initialProfile: {
    company_name: string;
    trading_name: string | null;
    cnpj: string;
    website: string | null;
    description: string | null;
    verification_status: string;
  };
}

export function CompanyProfileForm({ initialProfile }: CompanyProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateCompanyProfile(formData);

    if (result.error) {
      setFeedback({ type: "error", message: result.error });
    } else {
      setFeedback({ type: "success", message: "Perfil corporativo atualizado com sucesso!" });
    }

    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {feedback && (
        <div role="status" aria-live="polite" className={feedback.type === "success" ? "alert-success-box" : "auth-error"}>
          {feedback.message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="company_name_ro">Razão Social</label>
        <input
          id="company_name_ro"
          type="text"
          value={initialProfile.company_name}
          disabled
          className="form-input"
          style={{ opacity: 0.7, cursor: "not-allowed" }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cnpj_ro">CNPJ</label>
        <input
          id="cnpj_ro"
          type="text"
          value={initialProfile.cnpj}
          disabled
          className="form-input"
          style={{ opacity: 0.7, cursor: "not-allowed" }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="trading_name">Nome Fantasia</label>
        <input
          id="trading_name"
          name="trading_name"
          type="text"
          defaultValue={initialProfile.trading_name || ""}
          placeholder="Nome comercial da empresa"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={initialProfile.website || ""}
          placeholder="https://suaempresa.com"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Apresentação da Empresa</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialProfile.description || ""}
          placeholder="Conte sobre a cultura e desafios técnicos da empresa"
          className="form-input"
        />
      </div>

      <button type="submit" disabled={isPending} className="btn btn-secondary btn-sm" id="btn-save-company-profile">
        {isPending ? "Salvando..." : "Salvar Perfil Corporativo"}
      </button>
    </form>
  );
}
