import React from "react";
import { MatchMeter } from "@/components/ui/MatchMeter";
import { Badge } from "@/components/ui/Badge";
import { MatchEvaluationResult } from "@/lib/matching/types";

interface JobMatchPanelProps {
  matchResult: MatchEvaluationResult;
}

export function JobMatchPanel({ matchResult }: JobMatchPanelProps) {
  const {
    score,
    tier,
    breakdown,
    matchedSkills,
    missingSkills,
    seniorityAlignment,
    locationAlignment,
    dataSufficiency,
    summaryExplanation,
    actionableFeedback,
  } = matchResult;

  const getSufficiencyBadge = () => {
    switch (dataSufficiency) {
      case "COMPLETE":
        return <Badge variant="success" size="sm">Dados Completos</Badge>;
      case "PARTIAL":
        return <Badge variant="warning" size="sm">Dados Parciais</Badge>;
      case "INSUFFICIENT":
      default:
        return <Badge variant="neutral" size="sm">Dados Insuficientes</Badge>;
    }
  };

  const getSeniorityLabel = () => {
    switch (seniorityAlignment) {
      case "EXACT":
        return "Alinhamento Exato (25/25 pts)";
      case "NEAR":
        return "Alinhamento Próximo (15/25 pts)";
      case "DISTANT":
        return "Divergente (5/25 pts)";
      case "UNKNOWN":
      default:
        return "Neutro / Não especificado (12/25 pts)";
    }
  };

  const getLocationLabel = () => {
    switch (locationAlignment) {
      case "REMOTE_FRIENDLY":
        return "100% Remota (15/15 pts)";
      case "MATCH":
        return "Localização Compatível (15/15 pts)";
      case "MISMATCH":
        return "Localização Divergente (0/15 pts)";
      case "UNKNOWN":
      default:
        return "Neutro / Não especificado (7/15 pts)";
    }
  };

  return (
    <section
      className="job-match-panel"
      aria-labelledby="match-panel-heading"
      data-testid="job-match-panel"
    >
      <header className="job-match-header">
        <div className="job-match-header-left">
          <div className="job-match-badges">
            <span className="match-panel-tag">Análise de Compatibilidade</span>
            {getSufficiencyBadge()}
          </div>
          <h2 id="match-panel-heading" className="job-match-title">
            Seu Match com esta Oportunidade
          </h2>
          <p className="job-match-subtitle">
            Cálculo determinístico e transparente baseado nas competências, senioridade e localização.
          </p>
        </div>

        <div className="job-match-meter-container" data-testid="match-meter-display">
          <MatchMeter score={score} size="lg" showLabel label={`Afinidade ${tier}`} />
        </div>
      </header>

      {/* Explicação Geral (RF28) */}
      <div className="job-match-explanation-box" role="status">
        <p className="job-match-explanation-text">
          {summaryExplanation}
        </p>
      </div>

      {/* Breakdown detalhado dos 3 eixos */}
      <div className="job-match-breakdown-grid">
        <div className="match-breakdown-card">
          <div className="match-breakdown-card-top">
            <span className="match-breakdown-label">Competências Técnicas</span>
            <span className="match-breakdown-score">
              {breakdown.skillsScore} / {breakdown.maxSkillsScore} pts
            </span>
          </div>
          <div className="match-progress-bar-bg" aria-hidden="true">
            <div
              className="match-progress-bar-fill fill-indigo"
              style={{ width: `${(breakdown.skillsScore / breakdown.maxSkillsScore) * 100}%` }}
            />
          </div>
          <span className="match-breakdown-desc">
            {matchedSkills.length} de {matchedSkills.length + missingSkills.length} competências solicitadas
          </span>
        </div>

        <div className="match-breakdown-card">
          <div className="match-breakdown-card-top">
            <span className="match-breakdown-label">Senioridade</span>
            <span className="match-breakdown-score">
              {breakdown.seniorityScore} / {breakdown.maxSeniorityScore} pts
            </span>
          </div>
          <div className="match-progress-bar-bg" aria-hidden="true">
            <div
              className="match-progress-bar-fill fill-cyan"
              style={{ width: `${(breakdown.seniorityScore / breakdown.maxSeniorityScore) * 100}%` }}
            />
          </div>
          <span className="match-breakdown-desc">{getSeniorityLabel()}</span>
        </div>

        <div className="match-breakdown-card">
          <div className="match-breakdown-card-top">
            <span className="match-breakdown-label">Modalidade e Localização</span>
            <span className="match-breakdown-score">
              {breakdown.locationScore} / {breakdown.maxLocationScore} pts
            </span>
          </div>
          <div className="match-progress-bar-bg" aria-hidden="true">
            <div
              className="match-progress-bar-fill fill-emerald"
              style={{ width: `${(breakdown.locationScore / breakdown.maxLocationScore) * 100}%` }}
            />
          </div>
          <span className="match-breakdown-desc">{getLocationLabel()}</span>
        </div>
      </div>

      {/* Competências Coincidentes e Faltantes */}
      <div className="job-match-skills-breakdown">
        {matchedSkills.length > 0 && (
          <div className="skills-group matched-skills-group">
            <h3 className="skills-group-title text-success">
              ✓ Competências Coincidentes ({matchedSkills.length})
            </h3>
            <div className="skills-tags-wrap" data-testid="matched-skills-list">
              {matchedSkills.map((skill) => (
                <Badge key={skill} variant="success" size="sm">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div className="skills-group missing-skills-group">
            <h3 className="skills-group-title text-warning">
              ⚡ Competências a Desenvolver ({missingSkills.length})
            </h3>
            <div className="skills-tags-wrap" data-testid="missing-skills-list">
              {missingSkills.map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feedback acionável */}
      {actionableFeedback && (
        <div className="job-match-feedback-box" data-testid="actionable-feedback">
          <h4 className="feedback-box-title">💡 Dica para sua candidatura:</h4>
          <p className="feedback-box-text">{actionableFeedback}</p>
        </div>
      )}

      {/* Nota consultiva obrigatória */}
      <footer className="job-match-footer-note">
        <p>
          * O score de afinidade é <strong>estritamente consultivo</strong> e informativo.
          Você pode se candidatar livremente a qualquer oportunidade aberta independentemente do percentual.
        </p>
      </footer>
    </section>
  );
}

