import React from "react";
import Link from "next/link";
import { MatchMeter } from "@/components/ui/MatchMeter";
import { Badge } from "@/components/ui/Badge";
import { MatchEvaluationResult } from "@/lib/matching/types";

export interface JobCardData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  location: string | null;
  modality: string | null;
  level: string | null;
  created_at: string;
  companyName: string;
  skills: string[];
}

export interface PremiumJobCardProps {
  job: JobCardData;
  matchResult?: MatchEvaluationResult | null;
  isCandidate?: boolean;
}

export function PremiumJobCard({
  job,
  matchResult,
  isCandidate = false,
}: PremiumJobCardProps) {
  const isMatchCalculated = Boolean(isCandidate && matchResult);
  const matchedSkillsSet = new Set(
    (matchResult?.matchedSkills || []).map((s) => s.toLowerCase())
  );

  return (
    <article
      className="job-card premium-job-card"
      role="listitem"
      aria-labelledby={`job-title-${job.id}`}
      data-testid={`job-card-${job.id}`}
    >
      <div className="job-card-top">
        <div className="job-card-badges">
          {job.status === "ACTIVE" ? (
            <Badge variant="success" size="sm" dot>
              Aberta
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Inativa
            </Badge>
          )}

          {job.modality && (
            <Badge variant="modality" size="sm">
              {job.modality}
            </Badge>
          )}

          {job.level && (
            <Badge variant="level" size="sm">
              {job.level}
            </Badge>
          )}
        </div>

        {isCandidate && (
          <div
            className="job-card-match-preview"
            data-testid="card-match-meter"
            title={
              isMatchCalculated
                ? `Afinidade calculada: ${matchResult?.score}% (${matchResult?.summaryExplanation})`
                : "Afinidade não calculada"
            }
          >
            <MatchMeter
              score={isMatchCalculated ? matchResult?.score : null}
              size="sm"
              showLabel={false}
            />
          </div>
        )}
      </div>

      <div className="job-card-main-content">
        <h2 id={`job-title-${job.id}`} className="job-title">
          <Link href={`/vagas/${job.id}`} className="job-title-link">
            {job.title}
          </Link>
        </h2>
        <p className="job-company">{job.companyName}</p>

        <div className="job-meta-list">
          {job.location && (
            <span className="job-meta-item" aria-label={`Localização: ${job.location}`}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                style={{ verticalAlign: "middle", marginRight: "4px" }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {job.location}
            </span>
          )}
        </div>

        {/* Competências Técnicas */}
        {job.skills && job.skills.length > 0 && (
          <div className="job-card-skills" aria-label="Competências da vaga">
            {job.skills.slice(0, 5).map((skill) => {
              const isMatched = matchedSkillsSet.has(skill.toLowerCase());
              return (
                <span
                  key={skill}
                  className={`job-card-skill-tag ${isMatched ? "skill-tag-matched" : ""}`}
                  title={isMatched ? "Competência presente no seu perfil" : undefined}
                >
                  {isMatched && <span aria-hidden="true" className="skill-tag-check">✓ </span>}
                  {skill}
                </span>
              );
            })}
            {job.skills.length > 5 && (
              <span className="job-card-skill-more">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Resumo consultivo de matching (se candidato) */}
        {isCandidate && matchResult && (
          <div className="job-card-match-banner" data-testid="card-match-banner">
            {matchResult.dataSufficiency === "INSUFFICIENT" ? (
              <p className="match-banner-hint">
                ℹ️ Complete seu perfil para um cálculo mais assertivo.
              </p>
            ) : (
              <p className="match-banner-text">
                {matchResult.matchedSkills.length > 0 ? (
                  <span>
                    <strong>{matchResult.matchedSkills.length}</strong> competência(s) coincidente(s)
                  </span>
                ) : (
                  <span>Nenhuma competência direta coincidente</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="job-card-bottom">
        <span className="job-date">
          {new Date(job.created_at).toLocaleDateString("pt-BR")}
        </span>
        <Link
          href={`/vagas/${job.id}`}
          className="job-view-link"
          aria-label={`Ver detalhes da vaga ${job.title}`}
        >
          Ver detalhes →
        </Link>
      </div>
    </article>
  );
}

