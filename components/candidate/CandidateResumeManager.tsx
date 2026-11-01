"use client";

import { useState } from "react";
import { uploadResume, deleteResume, getResumeDownloadUrl } from "@/lib/actions/candidate-profile";

interface ResumeItem {
  id: string;
  file_name: string;
  is_primary: boolean;
  created_at: string;
}

interface CandidateResumeManagerProps {
  resumes: ResumeItem[];
}

export function CandidateResumeManager({ resumes }: CandidateResumeManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("resume") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!file) {
      setErrorMessage("Selecione um arquivo PDF para enviar.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("O currículo deve ter a extensão .pdf.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("O arquivo excede o limite máximo permitido de 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData(form);

    try {
      const result = await uploadResume(formData);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Currículo em PDF enviado com sucesso!");
        form.reset();
      }
    } catch {
      setErrorMessage("Ocorreu um erro ao enviar o currículo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (resumeId: string) => {
    setErrorMessage(null);
    setDownloadingId(resumeId);
    try {
      const result = await getResumeDownloadUrl(resumeId);
      if (result.error || !result.signedUrl) {
        setErrorMessage(result.error || "Não foi possível gerar link para download.");
      } else {
        // Criar link temporário e disparar download com segurança
        const link = document.createElement("a");
        link.href = result.signedUrl;
        link.download = result.fileName || "curriculo.pdf";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      setErrorMessage("Falha ao obter link de download do currículo.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!window.confirm("Deseja realmente remover este currículo?")) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("resumeId", resumeId);

    try {
      const result = await deleteResume(formData);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Currículo removido com sucesso.");
      }
    } catch {
      setErrorMessage("Falha ao excluir o currículo.");
    }
  };

  return (
    <div className="candidate-resume-manager" style={{ marginTop: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            Currículo em PDF (RF06)
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Envie seu currículo oficial. Formato aceito: PDF até 5MB. Seus arquivos ficam em armazenamento privado seguro.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="auth-error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10b981",
            fontSize: "var(--font-size-sm)",
            marginBottom: "var(--space-4)",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Formulário de Envio */}
      <form onSubmit={handleUpload} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
        <input
          type="file"
          id="resume-file-input"
          name="resume"
          accept="application/pdf,.pdf"
          disabled={isUploading}
          className="form-control"
          style={{ maxWidth: "340px", padding: "var(--space-2)" }}
          required
        />
        <button
          type="submit"
          id="btn-upload-resume"
          className="btn btn-primary btn-sm"
          disabled={isUploading}
        >
          {isUploading ? "Enviando..." : "Enviar Currículo"}
        </button>
      </form>

      {/* Lista de currículos anexados */}
      {resumes.length === 0 ? (
        <div style={{ padding: "var(--space-4)", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border)", textAlign: "center" }}>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: 0 }}>
            Nenhum currículo em PDF enviado ainda.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {resumes.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-3) var(--space-4)",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <span aria-hidden="true" style={{ fontSize: "1.25rem" }}>📄</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <span style={{ fontWeight: 500, fontSize: "var(--font-size-sm)" }}>{item.file_name}</span>
                    {item.is_primary && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(59, 130, 246, 0.15)",
                          color: "#60a5fa",
                          fontWeight: 600,
                        }}
                      >
                        Principal
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Enviado em {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  id={`btn-download-resume-${item.id}`}
                  onClick={() => handleDownload(item.id)}
                  disabled={downloadingId === item.id}
                  className="btn btn-outline btn-sm"
                >
                  {downloadingId === item.id ? "Baixando..." : "Baixar"}
                </button>
                <button
                  type="button"
                  id={`btn-delete-resume-${item.id}`}
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-danger btn-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
