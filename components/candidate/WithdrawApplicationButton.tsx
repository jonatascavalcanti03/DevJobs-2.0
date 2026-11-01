"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withdrawApplication } from "@/lib/actions/applications";

interface WithdrawApplicationButtonProps {
  applicationId: string;
  currentStatus: string;
}

export function WithdrawApplicationButton({
  applicationId,
  currentStatus,
}: WithdrawApplicationButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados terminais nos quais a retirada não é aplicável
  const terminalStatuses = ["HIRED", "REJECTED", "WITHDRAWN", "CLOSED"];
  if (terminalStatuses.includes(currentStatus)) {
    return null;
  }

  const handleWithdraw = async () => {
    setIsPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("applicationId", applicationId);

    const res = await withdrawApplication(formData);

    if (res?.error) {
      setError(res.error);
      setShowConfirm(false);
    } else {
      setSuccess("Candidatura retirada com sucesso.");
      setShowConfirm(false);
      router.refresh();
    }

    setIsPending(false);
  };

  return (
    <div style={{ marginTop: "var(--space-2)" }}>
      {error && (
        <p role="alert" className="auth-error" style={{ fontSize: "0.75rem", marginBottom: "var(--space-1)" }}>
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="apply-success-box" style={{ fontSize: "0.75rem", marginBottom: "var(--space-1)" }}>
          {success}
        </p>
      )}

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="btn btn-ghost btn-sm"
          style={{ color: "#F87171", fontSize: "0.75rem", padding: "2px 8px" }}
        >
          Desistir da vaga
        </button>
      ) : (
        <div
          style={{
            background: "rgba(15, 29, 69, 0.9)",
            border: "1px solid var(--color-border-medium)",
            borderRadius: "var(--radius-control)",
            padding: "var(--space-2) var(--space-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            Confirmar desistência desta candidatura?
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleWithdraw}
            className="btn btn-primary btn-sm"
            style={{ background: "#DC2626", borderColor: "#DC2626", fontSize: "0.75rem", padding: "2px 8px" }}
          >
            {isPending ? "Processando..." : "Confirmar"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowConfirm(false)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem", padding: "2px 8px" }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
