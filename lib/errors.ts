/**
 * Sistema de Erros Tipados — DevJobs 2.0
 *
 * Estratégia de tratamento de erros:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Tipo de Erro         │ Classe              │ HTTP Status   │
 * ├─────────────────────────────────────────────────────────────┤
 * │  Domínio              │ DomainError         │ 422           │
 * │  Validação            │ ValidationError     │ 400           │
 * │  Autenticação         │ AuthenticationError │ 401           │
 * │  Autorização          │ AuthorizationError  │ 403           │
 * │  Não encontrado       │ NotFoundError       │ 404           │
 * │  Conflito             │ ConflictError       │ 409           │
 * │  Infraestrutura       │ InfrastructureError │ 503           │
 * │  Inesperado           │ UnexpectedError     │ 500           │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Princípio: Erros de domínio não devem expor detalhes de infraestrutura.
 * O logger captura os detalhes internamente; a resposta ao cliente é sanitizada.
 */

// ---------------------------------------------------------------------------
// Classe base
// ---------------------------------------------------------------------------

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly isOperational: boolean;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      isOperational?: boolean;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = this.constructor.name;
    this.isOperational = options?.isOperational ?? true;
    this.timestamp = new Date();
    this.context = options?.context;
    // Garante que o stack trace aponte para onde o erro foi lançado
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializa o erro para resposta ao cliente.
   * NUNCA inclui detalhes de infraestrutura ou stack trace.
   */
  toClientResponse(): { error: { code: string; message: string } } {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Erros de Domínio
// ---------------------------------------------------------------------------

/**
 * Violação de regra de negócio.
 * Ex: Candidato já aplicou para esta vaga, empresa não verificada.
 */
export class DomainError extends AppError {
  readonly code = "DOMAIN_ERROR";
  readonly httpStatus = 422;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, { isOperational: true, context });
  }
}

// ---------------------------------------------------------------------------
// Erros de Validação
// ---------------------------------------------------------------------------

/**
 * Dados de entrada inválidos (campos obrigatórios, formato, etc).
 * Geralmente originado do Zod.
 */
export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 400;
  readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    options?: {
      fields?: Record<string, string[]>;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, { isOperational: true, context: options?.context });
    this.fields = options?.fields;
  }

  override toClientResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        fields: this.fields,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Erros de Autenticação / Autorização
// ---------------------------------------------------------------------------

/**
 * Usuário não autenticado (sem sessão válida).
 */
export class AuthenticationError extends AppError {
  readonly code = "AUTHENTICATION_ERROR";
  readonly httpStatus = 401;

  constructor(message = "Autenticação necessária") {
    super(message, { isOperational: true });
  }
}

/**
 * Usuário autenticado mas sem permissão para o recurso.
 */
export class AuthorizationError extends AppError {
  readonly code = "AUTHORIZATION_ERROR";
  readonly httpStatus = 403;

  constructor(message = "Acesso não autorizado") {
    super(message, { isOperational: true });
  }
}

// ---------------------------------------------------------------------------
// Erros de Recurso
// ---------------------------------------------------------------------------

/**
 * Recurso não encontrado.
 */
export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;

  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} com ID '${id}' não encontrado`
      : `${resource} não encontrado`;
    super(message, { isOperational: true });
  }
}

/**
 * Conflito de dados (ex: e-mail já cadastrado, duplicidade).
 */
export class ConflictError extends AppError {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;

  constructor(message: string) {
    super(message, { isOperational: true });
  }
}

// ---------------------------------------------------------------------------
// Erros de Infraestrutura
// ---------------------------------------------------------------------------

/**
 * Falha em serviço externo (banco, email, IA, storage).
 * A mensagem para o cliente é genérica; detalhes ficam no log.
 */
export class InfrastructureError extends AppError {
  readonly code = "INFRASTRUCTURE_ERROR";
  readonly httpStatus = 503;

  constructor(
    message: string,
    options?: {
      service?: string;
      cause?: Error;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, {
      isOperational: false,
      cause: options?.cause,
      context: {
        service: options?.service,
        ...options?.context,
      },
    });
  }

  override toClientResponse() {
    return {
      error: {
        code: this.code,
        message: "Serviço temporariamente indisponível. Tente novamente.",
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Erro Inesperado
// ---------------------------------------------------------------------------

/**
 * Erro não previsto pelo sistema.
 * Sempre logar com nível ERROR e alertar.
 */
export class UnexpectedError extends AppError {
  readonly code = "UNEXPECTED_ERROR";
  readonly httpStatus = 500;

  constructor(cause?: Error) {
    super("Ocorreu um erro inesperado. Tente novamente.", {
      isOperational: false,
      cause,
    });
  }

  override toClientResponse() {
    return {
      error: {
        code: this.code,
        message: "Ocorreu um erro inesperado. Tente novamente.",
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

/**
 * Type guard para verificar se um erro é do tipo AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Converte um erro desconhecido para AppError.
 * Útil em blocos catch que recebem `unknown`.
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) return new UnexpectedError(error);
  return new UnexpectedError(new Error(String(error)));
}
