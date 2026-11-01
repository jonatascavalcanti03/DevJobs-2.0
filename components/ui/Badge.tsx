import React from "react";

export type BadgeVariant =
  | "tech"
  | "modality"
  | "level"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string; border: string; dotColor: string }> = {
  tech: {
    background: "rgba(99, 102, 241, 0.12)",
    color: "#818CF8", // Indigo light
    border: "rgba(99, 102, 241, 0.25)",
    dotColor: "#6366F1",
  },
  modality: {
    background: "rgba(249, 115, 22, 0.12)",
    color: "#FB923C", // Orange
    border: "rgba(249, 115, 22, 0.25)",
    dotColor: "#F97316",
  },
  level: {
    background: "rgba(56, 189, 248, 0.12)",
    color: "#38BDF8", // Electric Blue / Sky
    border: "rgba(56, 189, 248, 0.25)",
    dotColor: "#38BDF8",
  },
  accent: {
    background: "rgba(139, 92, 246, 0.12)",
    color: "#A78BFA", // Violet
    border: "rgba(139, 92, 246, 0.25)",
    dotColor: "#8B5CF6",
  },
  success: {
    background: "rgba(16, 185, 129, 0.12)",
    color: "#34D399", // Emerald
    border: "rgba(16, 185, 129, 0.25)",
    dotColor: "#10B981",
  },
  warning: {
    background: "rgba(245, 158, 11, 0.12)",
    color: "#FBBF24", // Amber
    border: "rgba(245, 158, 11, 0.25)",
    dotColor: "#F59E0B",
  },
  error: {
    background: "rgba(239, 68, 68, 0.12)",
    color: "#F87171", // Rose / Red
    border: "rgba(239, 68, 68, 0.25)",
    dotColor: "#EF4444",
  },
  neutral: {
    background: "rgba(148, 163, 184, 0.10)",
    color: "#94A3B8", // Slate
    border: "rgba(148, 163, 184, 0.20)",
    dotColor: "#64748B",
  },
};

/**
 * Componente Badge reutilizável para exibição de tags técnicas, status, modalidades e níveis.
 */
export function Badge({
  children,
  variant = "tech",
  size = "sm",
  dot = false,
  className = "",
  style,
  ...props
}: BadgeProps) {
  const vStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;
  const isSmall = size === "sm";

  return (
    <span
      className={`techlink-badge techlink-badge-${variant} techlink-badge-${size} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? 4 : 6,
        padding: isSmall ? "2px 8px" : "4px 12px",
        borderRadius: "var(--radius-pill, 9999px)",
        fontSize: isSmall ? "0.6875rem" : "0.75rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "0.01em",
        background: vStyle.background,
        color: vStyle.color,
        border: `1px solid ${vStyle.border}`,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        transition: "background var(--transition-fast, 160ms ease), border-color var(--transition-fast, 160ms ease)",
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: isSmall ? 5 : 6,
            height: isSmall ? 5 : 6,
            borderRadius: "50%",
            backgroundColor: vStyle.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
