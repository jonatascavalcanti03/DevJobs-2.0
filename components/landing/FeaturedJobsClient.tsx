"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

export interface JobItem {
  id: string;
  title: string;
  companyName?: string;
  modality?: string | null;
  level?: string | null;
  location?: string | null;
  created_at: string;
  isRecent?: boolean;
  isFeatured?: boolean;
}

interface FeaturedJobsClientProps {
  jobs: JobItem[];
  error?: string | null;
}

export function FeaturedJobsClient({ jobs, error }: FeaturedJobsClientProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const updateScrollButtons = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const currentTrack = trackRef.current;
    if (currentTrack) {
      currentTrack.addEventListener("scroll", updateScrollButtons, { passive: true });
      window.addEventListener("resize", updateScrollButtons, { passive: true });
    }
    return () => {
      if (currentTrack) {
        currentTrack.removeEventListener("scroll", updateScrollButtons);
      }
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [jobs, updateScrollButtons]);

  const scrollBy = (offset: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleSaveClick = (jobTitle: string) => {
    // Conforme DEC-LP04-01 e restrições de governança:
    // Persistência depende de autenticação e formalização de RF.
    setSaveNotice(
      `O salvamento da vaga "${jobTitle}" requer autenticação ativa. O recurso oficial está em fase de governança.`
    );
    setTimeout(() => {
      setSaveNotice(null);
    }, 5000);
  };

  // Estado de Erro
  if (error) {
    return (
      <div className="state-container" role="alert">
        <div className="state-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="state-title">Não foi possível carregar as vagas em destaque</h3>
        <p className="state-description">
          Ocorreu uma instabilidade temporária ao consultar as oportunidades ativas.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Estado Vazio (quando não há vagas ativas no banco de dados)
  if (!jobs || jobs.length === 0) {
    return (
      <div className="state-container" id="vagas-vazio">
        <div className="state-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <h3 className="state-title">Nenhuma vaga em destaque encontrada no momento</h3>
        <p className="state-description">
          Novas oportunidades de tecnologia são publicadas periodicamente pelas empresas parceiras.
          Consulte o catálogo completo de oportunidades na busca principal.
        </p>
        <Link href="/vagas" className="btn btn-primary">
          Explorar catálogo de vagas
        </Link>
      </div>
    );
  }

  return (
    <div className="featured-jobs-track-container">
      {/* Controles de Navegação Horizontal */}
      <div className="featured-jobs-header-wrap">
        <div>
          <span className="section-tag">Oportunidades em Destaque</span>
          <h2 id="featured-jobs-title" className="section-title">
            Vagas recentes na plataforma
          </h2>
          <p className="section-subtitle">
            Amostra em tempo real das oportunidades ativas cadastradas por empresas de tecnologia.
          </p>
        </div>

        <div className="featured-jobs-nav-buttons" aria-label="Navegação da vitrine horizontal de vagas">
          <button
            type="button"
            className="featured-jobs-nav-btn"
            aria-label="Vagas anteriores"
            disabled={!canScrollLeft}
            onClick={() => scrollBy(-360)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="featured-jobs-nav-btn"
            aria-label="Próximas vagas"
            disabled={!canScrollRight}
            onClick={() => scrollBy(360)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Aviso informativo de salvamento */}
      {saveNotice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            color: "#F8FAFC",
            fontSize: "0.875rem",
          }}
        >
          {saveNotice}
        </div>
      )}

      {/* Vitrine em Lista Horizontal Contida (DEC-LP04-01) */}
      <div
        ref={trackRef}
        className="featured-jobs-track"
        tabIndex={0}
        aria-label="Lista horizontal de vagas em destaque"
      >
        {jobs.map((job) => (
          <article key={job.id} className="job-card" aria-labelledby={`job-title-${job.id}`}>
            <div>
              <div className="job-card-top">
                <div className="job-card-badges">
                  {job.isRecent && <span className="job-badge-recent">Recente</span>}
                  {job.isFeatured && <span className="job-badge-featured">Destaque</span>}
                </div>

                <button
                  type="button"
                  className="job-save-btn"
                  aria-label={`Salvar vaga ${job.title}`}
                  onClick={() => handleSaveClick(job.title)}
                  title="Salvar vaga"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>

              <h3 id={`job-title-${job.id}`} className="job-title">
                {job.title}
              </h3>
              <p className="job-company">{job.companyName || "Empresa Confidencial"}</p>

              <div className="job-meta-list">
                {job.level && (
                  <span className="job-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {job.level}
                  </span>
                )}
                {job.modality && (
                  <span className="job-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    {job.modality}
                  </span>
                )}
                {job.location && (
                  <span className="job-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.location}
                  </span>
                )}
              </div>
            </div>

            <div className="job-card-bottom">
              <span className="job-date">
                Publicada em {new Date(job.created_at).toLocaleDateString("pt-BR")}
              </span>
              <Link
                href={`/vagas/${job.id}`}
                className="job-view-link"
                aria-label={`Ver detalhes da vaga ${job.title}`}
              >
                Ver vaga
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
