/**
 * Storage Provider — Abstração de Interface
 *
 * ADR-009: Storage privado para arquivos sensíveis via Supabase Storage.
 *
 * O domínio e os serviços de aplicação NUNCA devem importar
 * SDKs de storage diretamente. Sempre usar esta interface.
 *
 * Implementação concreta usará Supabase Storage.
 * Arquivos sensíveis (currículos, documentos) → buckets privados.
 * Arquivos públicos (avatares, logos) → buckets públicos com políticas.
 *
 * STATUS: NÃO IMPLEMENTADO — ETAPA 0 (abstração apenas)
 */

// ---------------------------------------------------------------------------
// Tipos base
// ---------------------------------------------------------------------------

export type StorageBucket = "resumes" | "avatars" | "company-logos" | "documents";

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl?: string; // Disponível apenas para buckets públicos
}

export interface SignedUrlOptions {
  expiresIn: number; // segundos
  download?: boolean;
}

// ---------------------------------------------------------------------------
// Contrato do Provider
// ---------------------------------------------------------------------------

/**
 * Contrato que qualquer provider de storage deve implementar.
 * Implementação concreta em `./providers/supabase-storage.ts` (etapa futura).
 *
 * Regras de segurança:
 * - Currículos e documentos sensíveis → SEMPRE em buckets privados
 * - URLs de acesso temporário via signed URLs com expiração
 * - Avatares e logos públicos → buckets públicos com RLS apropriado
 */
export interface StorageProvider {
  /**
   * Faz upload de um arquivo para o bucket especificado.
   * @throws InfrastructureError em caso de falha
   */
  upload(
    bucket: StorageBucket,
    path: string,
    file: Buffer | Blob | File,
    options?: UploadOptions
  ): Promise<UploadResult>;

  /**
   * Remove um arquivo do bucket.
   */
  delete(bucket: StorageBucket, path: string): Promise<void>;

  /**
   * Gera uma URL assinada temporária para acesso a arquivos privados.
   * Obrigatório para currículos e documentos sensíveis.
   */
  getSignedUrl(
    bucket: StorageBucket,
    path: string,
    options: SignedUrlOptions
  ): Promise<string>;

  /**
   * Retorna a URL pública de um arquivo em bucket público.
   * NÃO usar para arquivos privados/sensíveis.
   */
  getPublicUrl(bucket: StorageBucket, path: string): string;

  /**
   * Verifica se o provider está configurado e operacional.
   */
  healthCheck(): Promise<boolean>;
}
