/**
 * AI Provider — Abstração de Interface (Provider Adapter)
 *
 * ADR-006: IA deve ser utilizada através de camada de abstração/provider adapter.
 * O domínio não deve depender diretamente de um fornecedor específico.
 *
 * O domínio e os serviços de aplicação NUNCA devem importar
 * SDKs de IA diretamente. Sempre usar esta interface.
 *
 * Fornecedores candidatos: Google Gemini, OpenAI, Anthropic, etc.
 * A escolha será feita na etapa de implementação de IA.
 *
 * STATUS: NÃO IMPLEMENTADO — ETAPA 0 (abstração apenas)
 */

// ---------------------------------------------------------------------------
// Tipos base
// ---------------------------------------------------------------------------

export interface TextGenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface TextGenerationResult {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: "stop" | "length" | "error";
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage?: {
    inputTokens: number;
  };
}

// ---------------------------------------------------------------------------
// Contrato do Provider
// ---------------------------------------------------------------------------

/**
 * Contrato que qualquer provider de IA deve implementar.
 * Implementações concretas ficam em `./providers/`.
 *
 * Cobertura planejada:
 * - RF14: Análise de Currículo por IA
 * - RF22: Busca em Linguagem Natural
 * - RF26: Recomendação de Vagas
 * - RF27: Matching Candidato-Vaga
 * - RF28: Explicação do Matching
 *
 * Implementação pendente nas etapas correspondentes.
 */
export interface AIProvider {
  /**
   * Gera texto a partir de um prompt.
   * Usado para análise, matching e explicações.
   */
  generateText(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<TextGenerationResult>;

  /**
   * Gera embeddings vetoriais para busca semântica.
   * Integra com pgvector (ADR-007).
   */
  generateEmbedding(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult>;

  /**
   * Verifica se o provider está configurado e operacional.
   */
  healthCheck(): Promise<boolean>;
}
