import React from "react";

export type MatchMeterSize = "sm" | "md" | "lg";

export interface MatchMeterProps {
  /**
   * Score de compatibilidade de 0 a 100.
   * Se nulo ou indefinido, renderiza estado neutro/indeterminado.
   */
  score?: number | null;
  /**
   * Tamanho do componente.
   * - sm: 44x44px (ideal para listas densas e tabelas)
   * - md: 56x56px (padrão para cards de vaga e kanban)
   * - lg: 84x84px (destaque para páginas de detalhes e resumos)
   */
  size?: MatchMeterSize;
  /**
   * Se true, exibe rótulo textual abaixo ou ao lado do anel.
   */
  showLabel?: boolean;
  /**
   * Texto descritivo personalizado (padrão: "Match" ou percentual formatado).
   */
  label?: string;
  /**
   * Classe CSS adicional.
   */
  className?: string;
}

/**
 * Retorna as configurações de cor e classificação baseadas no percentual de aderência.
 */
function getMatchTier(score: number | null | undefined) {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return {
      tier: "NEUTRAL",
      color: "#64748B",
      bgTrack: "rgba(100, 116, 139, 0.2)",
      textClass: "match-meter-neutral",
      label: "Não calculado",
    };
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  if (clamped >= 80) {
    return {
      tier: "HIGH",
      color: "#10B981", // Emerald 500
      bgTrack: "rgba(16, 185, 129, 0.18)",
      textClass: "match-meter-high",
      label: "Alta afinidade",
    };
  }

  if (clamped >= 50) {
    return {
      tier: "MEDIUM",
      color: "#38BDF8", // Electric Blue / Sky
      bgTrack: "rgba(56, 189, 248, 0.18)",
      textClass: "match-meter-medium",
      label: "Média afinidade",
    };
  }

  return {
    tier: "LOW",
    color: "#F59E0B", // Amber 500
    bgTrack: "rgba(245, 158, 11, 0.18)",
    textClass: "match-meter-low",
    label: "Afinidade inicial",
  };
}

const SIZE_CONFIGS = {
  sm: {
    dimension: 44,
    strokeWidth: 3.5,
    fontSize: "0.75rem",
    percentSignSize: "0.55rem",
  },
  md: {
    dimension: 56,
    strokeWidth: 4.5,
    fontSize: "0.9375rem",
    percentSignSize: "0.625rem",
  },
  lg: {
    dimension: 84,
    strokeWidth: 6,
    fontSize: "1.375rem",
    percentSignSize: "0.875rem",
  },
};

/**
 * Componente visual reutilizável MatchMeter.
 *
 * Apresenta a aderência calculada ou estimada entre candidato e vaga
 * através de um anel SVG circular de alto contraste com gradiente e rótulos acessíveis.
 */
export function MatchMeter({
  score,
  size = "md",
  showLabel = false,
  label,
  className = "",
}: MatchMeterProps) {
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const tierInfo = getMatchTier(score);
  const isCalculated = typeof score === "number" && !Number.isNaN(score);
  const clampedScore = isCalculated ? Math.max(0, Math.min(100, Math.round(score!))) : 0;

  // Parâmetros do círculo SVG
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isCalculated
    ? circumference - (clampedScore / 100) * circumference
    : circumference;

  const accessibleLabel = label || (isCalculated ? `${clampedScore}% de afinidade - ${tierInfo.label}` : "Afinidade não calculada");

  return (
    <div
      className={`match-meter-wrap match-meter-${size} ${className}`}
      role="meter"
      aria-valuenow={isCalculated ? clampedScore : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={accessibleLabel}
    >
      <div
        className="match-meter-circle-container"
        style={{
          width: config.dimension,
          height: config.dimension,
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={config.dimension}
          height={config.dimension}
          viewBox={`0 0 ${config.dimension} ${config.dimension}`}
          style={{ transform: "rotate(-90deg)", display: "block" }}
          aria-hidden="true"
        >
          {/* Anel de fundo / Track */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="transparent"
            stroke={tierInfo.bgTrack}
            strokeWidth={config.strokeWidth}
          />
          {/* Anel de progresso / Indicator */}
          {isCalculated && (
            <circle
              cx={config.dimension / 2}
              cy={config.dimension / 2}
              r={radius}
              fill="transparent"
              stroke={tierInfo.color}
              strokeWidth={config.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          )}
        </svg>

        {/* Valor numérico central */}
        <div
          className="match-meter-value"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            color: tierInfo.color,
            fontSize: config.fontSize,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {isCalculated ? (
            <>
              <span>{clampedScore}</span>
              <span
                style={{
                  fontSize: config.percentSignSize,
                  opacity: 0.85,
                  marginLeft: 1,
                  fontWeight: 600,
                }}
              >
                %
              </span>
            </>
          ) : (
            <span style={{ fontSize: config.percentSignSize, color: "var(--color-text-muted)" }}>
              --
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <span
          className={`match-meter-caption ${tierInfo.textClass}`}
          style={{
            display: "block",
            fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
            fontWeight: 600,
            color: tierInfo.color,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {label || tierInfo.label}
        </span>
      )}
    </div>
  );
}
