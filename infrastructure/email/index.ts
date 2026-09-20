/**
 * Email Provider — Abstração de Interface
 *
 * ADR-006 (adaptado para email): A camada de infraestrutura de email
 * deve ser acessada através de uma interface/contrato, não diretamente
 * via SDK do fornecedor.
 *
 * O domínio e os serviços de aplicação NUNCA devem importar
 * SDKs de email diretamente. Sempre usar esta interface.
 *
 * Provedor definitivo a ser definido em etapa posterior.
 * Candidatos: Resend, SendGrid, AWS SES, Postmark.
 *
 * STATUS: NÃO IMPLEMENTADO — ETAPA 0 (abstração apenas)
 */

export interface EmailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailResult {
  id: string;
  status: "sent" | "queued" | "failed";
  timestamp: Date;
}

/**
 * Contrato que qualquer provider de e-mail deve implementar.
 * Implementações concretas ficam em `./providers/`.
 */
export interface EmailProvider {
  /**
   * Envia um e-mail transacional.
   * @param message - Dados do e-mail
   * @returns Resultado do envio com ID para rastreamento
   * @throws InfrastructureError em caso de falha de envio
   */
  sendEmail(message: EmailMessage): Promise<EmailResult>;

  /**
   * Verifica se o provider está configurado e operacional.
   */
  healthCheck(): Promise<boolean>;
}
