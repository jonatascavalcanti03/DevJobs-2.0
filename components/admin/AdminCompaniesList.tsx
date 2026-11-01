"use client";

import { useState } from "react";
import { reviewCompanyVerification } from "@/lib/actions/admin";

interface CompanyItem {
  id: string;
  cnpj: string;
  company_name: string;
  trading_name: string | null;
  website: string | null;
  verification_status: "PENDING" | "APPROVED" | "REJECTED" | string;
  created_at: string;
}

interface AdminCompaniesListProps {
  companies: CompanyItem[];
}

export function AdminCompaniesList({ companies }: AdminCompaniesListProps) {
  const [isPending, setIsPending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const handleReview = async (companyId: string, action: "APPROVE" | "REJECT") => {
    setIsPending(companyId);
    setFeedback(null);

    const formData = new FormData();
    formData.append("companyId", companyId);
    formData.append("action", action);

    const res = await reviewCompanyVerification(formData);
    if (res?.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({
        type: "success",
        message: action === "APPROVE" ? "Empresa aprovada com sucesso." : "Empresa rejeitada.",
      });
    }
    setIsPending(null);
  };

  const filteredCompanies = companies.filter((c) => {
    if (filter === "ALL") return true;
    return c.verification_status === filter;
  });

  return (
    <div className="admin-companies-container" data-testid="admin-companies-section">
      <div className="admin-filter-bar">
        <label htmlFor="company-status-filter" className="admin-filter-label">
          Filtrar status:
        </label>
        <select
          id="company-status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input admin-filter-select"
        >
          <option value="ALL">Todas ({companies.length})</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovadas</option>
          <option value="REJECTED">Rejeitadas</option>
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

      {filteredCompanies.length === 0 ? (
        <div className="dashboard-empty-state" style={{ minHeight: "120px" }}>
          Nenhuma empresa encontrada para o filtro selecionado.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Lista de Empresas para Moderação">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Website</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.trading_name || c.company_name}</strong>
                    {c.trading_name && <span className="admin-subtext">{c.company_name}</span>}
                  </td>
                  <td>{c.cnpj}</td>
                  <td>
                    {c.website ? (
                      <a
                        href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-electric-blue"
                      >
                        Link
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge-status status-${c.verification_status.toLowerCase()}`}>
                      {c.verification_status === "APPROVED"
                        ? "Aprovada"
                        : c.verification_status === "REJECTED"
                        ? "Rejeitada"
                        : "Pendente"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      {c.verification_status !== "APPROVED" && (
                        <button
                          type="button"
                          disabled={isPending === c.id}
                          onClick={() => handleReview(c.id, "APPROVE")}
                          className="btn btn-secondary btn-sm btn-approve"
                          aria-label={`Aprovar empresa ${c.trading_name || c.company_name}`}
                        >
                          Aprovar
                        </button>
                      )}
                      {c.verification_status !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isPending === c.id}
                          onClick={() => handleReview(c.id, "REJECT")}
                          className="btn btn-ghost btn-sm btn-reject"
                          aria-label={`Rejeitar empresa ${c.trading_name || c.company_name}`}
                        >
                          Rejeitar
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

