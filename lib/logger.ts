/* eslint-disable no-console */
/**
 * Logger Estruturado — DevJobs 2.0
 *
 * Estratégia de logging:
 *
 * - Desenvolvimento: saída legível no console com cores
 * - Produção: JSON estruturado para integração com observabilidade
 *   (Sentry, Datadog, CloudWatch, etc.)
 *
 * Níveis: debug < info < warn < error
 * Nível padrão: info em produção, debug em desenvolvimento
 *
 * REGRAS OBRIGATÓRIAS:
 * - NUNCA logar senhas, tokens, secrets ou API keys
 * - NUNCA logar dados sensíveis de usuários (CPF, dados bancários)
 * - NUNCA logar o corpo completo de requests sem sanitização
 * - Dados pessoais (email, nome) apenas quando estritamente necessário
 *   e com justificativa documentada no código
 *
 * Integração com serviço de observabilidade externo:
 * Pendente — será configurado na etapa de Observabilidade.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  service?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// ---------------------------------------------------------------------------
// Implementação
// ---------------------------------------------------------------------------

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const envLevel = process.env["LOG_LEVEL"] as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVELS) return envLevel;
  return process.env["NODE_ENV"] === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatForConsole(entry: LogEntry): string {
  const time = new Date(entry.timestamp).toLocaleTimeString("pt-BR");
  const level = entry.level.toUpperCase().padEnd(5);
  const prefix = `[${time}] ${level}`;

  if (entry.context || entry.error) {
    return `${prefix} ${entry.message}`;
  }
  return `${prefix} ${entry.message}`;
}

function serializeError(error: unknown): LogEntry["error"] | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Stack trace apenas em desenvolvimento
      stack: process.env["NODE_ENV"] !== "production" ? error.stack : undefined,
    };
  }
  return undefined;
}

/**
 * Sanitiza o contexto antes de logar.
 * Remove campos sensíveis que não devem aparecer nos logs.
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const SENSITIVE_KEYS = [
    "password",
    "senha",
    "token",
    "secret",
    "apiKey",
    "api_key",
    "authorization",
    "cookie",
    "serviceRoleKey",
    "service_role_key",
    "stripeKey",
    "stripe_key",
  ];

  const sanitized = { ...context };
  for (const key of SENSITIVE_KEYS) {
    if (key in sanitized) {
      sanitized[key] = "[REDACTED]";
    }
  }
  return sanitized;
}

function log(
  level: LogLevel,
  message: string,
  options?: { context?: LogContext; error?: unknown }
): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: sanitizeContext(options?.context),
    error: serializeError(options?.error),
  };

  if (process.env["NODE_ENV"] === "production") {
    // Produção: JSON estruturado para sistemas de observabilidade
    const output = JSON.stringify(entry);
    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  } else {
    // Desenvolvimento: saída legível
    const formatted = formatForConsole(entry);
    if (level === "error") {
      console.error(formatted, entry.context ?? "", entry.error ?? "");
    } else if (level === "warn") {
      console.warn(formatted, entry.context ?? "");
    } else if (level === "debug") {
      console.log(formatted, entry.context ?? "");
    } else {
      console.log(formatted, entry.context ?? "");
    }
  }
}

// ---------------------------------------------------------------------------
// API Pública
// ---------------------------------------------------------------------------

export const logger = {
  debug: (message: string, context?: LogContext) =>
    log("debug", message, { context }),

  info: (message: string, context?: LogContext) =>
    log("info", message, { context }),

  warn: (message: string, context?: LogContext) =>
    log("warn", message, { context }),

  error: (message: string, error?: unknown, context?: LogContext) =>
    log("error", message, { context, error }),
} as const;

export default logger;
