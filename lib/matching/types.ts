/**
 * TechLink — Engine de Matching Determinístico (RF26, RF27 e RF28)
 * Tipos e contratos de dados para cálculo de compatibilidade candidato-vaga.
 */

export type SeniorityLevel = "JUNIOR" | "PLENO" | "SENIOR" | "LEAD";

export type JobModality = "REMOTE" | "HYBRID" | "ON_SITE";

export type MatchTier = "ALTA" | "MEDIA" | "BAIXA";

export type SeniorityAlignment = "EXACT" | "NEAR" | "DISTANT" | "UNKNOWN";

export type LocationAlignment = "MATCH" | "REMOTE_FRIENDLY" | "MISMATCH" | "UNKNOWN";

export type DataSufficiency = "COMPLETE" | "PARTIAL" | "INSUFFICIENT";

/**
 * Dados de entrada do candidato para avaliação de compatibilidade.
 * Mapeado a partir de candidate_profiles, candidate_skills e experiences.
 */
export interface CandidateMatchingInput {
  /**
   * Competências cadastradas pelo candidato (strings ou objetos com campo name).
   */
  skills?: (string | { name: string })[];
  /**
   * Nível de senioridade declarado ou inferido.
   */
  seniority?: SeniorityLevel | string | null;
  /**
   * Localização geográfica informada (ex.: "São Paulo, SP" ou "Remoto").
   */
  location?: string | null;
  /**
   * Título profissional ou resumo do perfil.
   */
  headline?: string | null;
  /**
   * Histórico de experiências para inferência de senioridade caso não declarada.
   */
  experiences?: Array<{
    title?: string;
    start_date?: string;
    end_date?: string | null;
  }>;
}

/**
 * Dados de entrada da vaga para avaliação de compatibilidade.
 * Mapeado a partir de jobs, job_skills e company_profiles.
 */
export interface JobMatchingInput {
  id?: string;
  title: string;
  description?: string | null;
  /**
   * Competências requeridas pela vaga (strings ou objetos com campo name).
   */
  skills?: (string | { name: string })[];
  /**
   * Senioridade exigida pela vaga.
   */
  level?: SeniorityLevel | string | null;
  /**
   * Modalidade de trabalho (REMOTE, HYBRID, ON_SITE).
   */
  modality?: JobModality | string | null;
  /**
   * Localização da vaga (cidade/estado ou remota).
   */
  location?: string | null;
}

/**
 * Discriminação detalhada dos pontos obtidos por eixo de avaliação.
 */
export interface MatchBreakdown {
  /**
   * Pontuação obtida em competências técnicas (0 a 60).
   */
  skillsScore: number;
  /**
   * Pontuação máxima possível para competências (60).
   */
  maxSkillsScore: number;
  /**
   * Pontuação obtida em senioridade (0 a 25).
   */
  seniorityScore: number;
  /**
   * Pontuação máxima possível para senioridade (25).
   */
  maxSeniorityScore: number;
  /**
   * Pontuação obtida em modalidade e localização (0 a 15).
   */
  locationScore: number;
  /**
   * Pontuação máxima possível para localização (15).
   */
  maxLocationScore: number;
}

/**
 * Resultado completo e explicável da avaliação de compatibilidade.
 * Totalmente transparente, determinístico e auditável.
 */
export interface MatchEvaluationResult {
  /**
   * Score geral de compatibilidade (inteiro de 0 a 100).
   */
  score: number;
  /**
   * Faixa de afinidade:
   * - ALTA: score >= 80
   * - MEDIA: 50 <= score < 80
   * - BAIXA: score < 50
   */
  tier: MatchTier;
  /**
   * Discriminação detalhada dos pontos por critério.
   */
  breakdown: MatchBreakdown;
  /**
   * Lista de competências que coincidem entre o candidato e a vaga (preservando o nome original).
   */
  matchedSkills: string[];
  /**
   * Lista de competências exigidas pela vaga que o candidato ainda não cadastrou.
   */
  missingSkills: string[];
  /**
   * Total de competências válidas identificadas no candidato.
   */
  candidateSkillsTotal: number;
  /**
   * Total de competências exigidas pela vaga.
   */
  jobSkillsTotal: number;
  /**
   * Grau de proximidade de senioridade entre candidato e vaga.
   */
  seniorityAlignment: SeniorityAlignment;
  /**
   * Grau de proximidade geográfica ou modalidade.
   */
  locationAlignment: LocationAlignment;
  /**
   * Grau de suficiência dos dados fornecidos para a avaliação.
   */
  dataSufficiency: DataSufficiency;
  /**
   * Explicação compreensível e neutra da pontuação obtida (RF28).
   */
  summaryExplanation: string;
  /**
   * Sugestões práticas de evolução ou preenchimento de perfil para o candidato.
   */
  actionableFeedback: string;
}
