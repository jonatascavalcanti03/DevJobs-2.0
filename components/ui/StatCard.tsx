import React from "react";

export type StatCardVariant = "cyan" | "indigo" | "emerald" | "amber" | "neutral";

export interface StatCardProps {
  /**
   * Título ou rótulo principal da métrica (ex.: "Candidaturas Ativas").
   */
  title: string;
  /**
   * Valor em destaque (ex.: 12, "85%", "R$ 15k").
   */
  value: string | number;
  /**
   * Texto secundário descritivo ou informativo.
   */
  subtitle?: string;
  /**
   * Ícone SVG customizável (renderizado em container arredondado com fundo sutil).
   */
  icon?: React.ReactNode;
  /**
   * Indicador opcional de variação ou tendência (ex.: "+15% este mês").
   */
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  /**
   * Variante de cor para o acento visual do card.
   */
  variant?: StatCardVariant;
  /**
   * Se true, exibe esqueleto de carregamento com shimmer acessível.
   */
  isLoading?: boolean;
  /**
   * Classes adicionais.
   */
  className?: string;
}

const ACCENT_MAP: Record<StatCardVariant, { glow: string; borderHover: string; iconBg: string; iconColor: string }> = {
  cyan: {
    glow: "rgba(56, 189, 248, 0.12)",
    borderHover: "rgba(56, 189, 248, 0.35)",
    iconBg: "rgba(56, 189, 248, 0.12)",
    iconColor: "#38BDF8",
  },
  indigo: {
    glow: "rgba(99, 102, 241, 0.15)",
    borderHover: "rgba(99, 102, 241, 0.35)",
    iconBg: "rgba(99, 102, 241, 0.12)",
    iconColor: "#818CF8",
  },
  emerald: {
    glow: "rgba(16, 185, 129, 0.12)",
    borderHover: "rgba(16, 185, 129, 0.35)",
    iconBg: "rgba(16, 185, 129, 0.12)",
    iconColor: "#34D399",
  },
  amber: {
    glow: "rgba(245, 158, 11, 0.12)",
    borderHover: "rgba(245, 158, 11, 0.35)",
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#FBBF24",
  },
  neutral: {
    glow: "rgba(148, 163, 184, 0.08)",
    borderHover: "rgba(148, 163, 184, 0.25)",
    iconBg: "rgba(148, 163, 184, 0.10)",
    iconColor: "#94A3B8",
  },
};

/**
 * Componente StatCard reutilizável para métricas e indicadores de dashboard.
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "cyan",
  isLoading = false,
  className = "",
}: StatCardProps) {
  const accent = ACCENT_MAP[variant] || ACCENT_MAP.cyan;

  if (isLoading) {
    return (
      <article
        className={`stat-card stat-card-skeleton ${className}`}
        aria-busy="true"
        aria-label={`Carregando métrica ${title}`}
      >
        <div className="stat-card-skeleton-header" />
        <div className="stat-card-skeleton-value" />
        {subtitle && <div className="stat-card-skeleton-subtitle" />}
      </article>
    );
  }

  return (
    <article
      className={`stat-card stat-card-${variant} ${className}`}
      style={{
        background: "rgba(13, 27, 62, 0.65)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: "var(--radius-card, 12px)",
        padding: "var(--space-5, 20px) var(--space-6, 24px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-3, 12px)",
        position: "relative",
        overflow: "hidden",
        transition: "transform var(--transition-fast, 160ms ease), border-color var(--transition-fast, 160ms ease), box-shadow var(--transition-fast, 160ms ease)",
      }}
      tabIndex={0}
      aria-label={`${title}: ${value}${subtitle ? ` - ${subtitle}` : ""}`}
    >
      {/* Luz ambiente de fundo no topo */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 90,
          height: 90,
          background: `radial-gradient(circle at top right, ${accent.glow}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3, 12px)" }}>
        <h3
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-text-secondary, #94A3B8)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          {title}
        </h3>

        {icon && (
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-control, 8px)",
              background: accent.iconBg,
              color: accent.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3, 12px)" }}>
        <span
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--color-text-primary, #F8FAFC)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-sans)",
          }}
        >
          {value}
        </span>

        {trend && (
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "var(--radius-pill, 9999px)",
              background: trend.isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: trend.isPositive ? "#34D399" : "#F87171",
              border: `1px solid ${trend.isPositive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-muted, #64748B)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </p>
      )}
    </article>
  );
}
