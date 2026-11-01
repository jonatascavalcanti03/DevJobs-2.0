/**
 * TechLink — Engine de Matching Determinístico (RF26, RF27 e RF28)
 *
 * Função pura para cálculo transparente e auditável de compatibilidade entre
 * perfil do candidato e requisitos da vaga.
 *
 * Pesos canônicos:
 * - Competências técnicas: 60 pontos
 * - Senioridade: 25 pontos
 * - Modalidade e localização: 15 pontos
 * Total máximo: 100 pontos
 */

import {
  CandidateMatchingInput,
  DataSufficiency,
  JobMatchingInput,
  LocationAlignment,
  MatchBreakdown,
  MatchEvaluationResult,
  MatchTier,
  SeniorityAlignment,
  SeniorityLevel,
} from "./types";

// ============================================================================
// Normalização e Dicionário de Equivalência Canônica de Tecnologias
// ============================================================================

const CANONICAL_SKILL_EQUIVALENCES: Record<string, string> = {
  // JavaScript / TypeScript
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",

  // Frameworks Web
  react: "react",
  reactjs: "react",
  "react.js": "react",
  next: "nextjs",
  nextjs: "nextjs",
  "next.js": "nextjs",
  vue: "vue",
  vuejs: "vue",
  "vue.js": "vue",
  angular: "angular",
  angularjs: "angular",
  svelte: "svelte",

  // Backend & Ambientes
  node: "nodejs",
  nodejs: "nodejs",
  "node.js": "nodejs",
  express: "express",
  expressjs: "express",
  nest: "nestjs",
  nestjs: "nestjs",
  golang: "go",
  go: "go",
  csharp: "c#",
  "c#": "c#",
  dotnet: ".net",
  ".net": ".net",

  // Bancos de Dados
  postgres: "postgresql",
  postgresql: "postgresql",
  mysql: "mysql",
  mongo: "mongodb",
  mongodb: "mongodb",
  redis: "redis",

  // Infra / DevOps
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  docker: "docker",
  aws: "aws",
  gcp: "gcp",
  azure: "azure",
};

/**
 * Normaliza o nome de uma competência para comparação canônica.
 * Remove pontuação desnecessária nas bordas, espaços e aplica equivalência.
 */
export function normalizeSkillName(name: string): string {
  if (!name || typeof name !== "string") return "";

  const trimmed = name.trim().toLowerCase();
  // Limpeza de caracteres pontuais nas bordas preservando símbolos como C# e .NET
  const cleaned = trimmed.replace(/^[^\w#.+]+|[^\w#.+]+$/g, "");

  return CANONICAL_SKILL_EQUIVALENCES[cleaned] || cleaned;
}

/**
 * Extrai lista de competências tratadas preservando o nome original de exibição.
 */
function extractSkills(skills?: (string | { name: string })[]): Array<{ original: string; normalized: string }> {
  if (!Array.isArray(skills)) return [];

  const seen = new Set<string>();
  const result: Array<{ original: string; normalized: string }> = [];

  for (const item of skills) {
    const raw = typeof item === "string" ? item : item?.name;
    if (typeof raw === "string" && raw.trim().length > 0) {
      const original = raw.trim();
      const normalized = normalizeSkillName(original);

      if (normalized.length > 0 && !seen.has(normalized)) {
        seen.add(normalized);
        result.push({ original, normalized });
      }
    }
  }

  return result;
}

// ============================================================================
// Tratamento de Senioridade
// ============================================================================

const SENIORITY_MAP: Record<string, { level: SeniorityLevel; rank: number }> = {
  estagio: { level: "JUNIOR", rank: 0 },
  intern: { level: "JUNIOR", rank: 0 },
  trainee: { level: "JUNIOR", rank: 0 },
  junior: { level: "JUNIOR", rank: 0 },
  jr: { level: "JUNIOR", rank: 0 },

  pleno: { level: "PLENO", rank: 1 },
  mid: { level: "PLENO", rank: 1 },
  pl: { level: "PLENO", rank: 1 },

  senior: { level: "SENIOR", rank: 2 },
  sr: { level: "SENIOR", rank: 2 },

  lead: { level: "LEAD", rank: 3 },
  staff: { level: "LEAD", rank: 3 },
  principal: { level: "LEAD", rank: 3 },
  especialista: { level: "LEAD", rank: 3 },
};

/**
 * Converte string para o rank de senioridade [0, 3] ou retorna null se desconhecido.
 */
function parseSeniority(val?: string | null): { level: SeniorityLevel; rank: number } | null {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim().toLowerCase();
  return SENIORITY_MAP[clean] || null;
}

/**
 * Infere o nível de senioridade aproximado com base nos anos totais de experiência do candidato.
 */
function inferSeniorityFromExperiences(experiences?: CandidateMatchingInput["experiences"]): { level: SeniorityLevel; rank: number } | null {
  if (!Array.isArray(experiences) || experiences.length === 0) return null;

  let totalMonths = 0;
  const now = new Date();

  for (const exp of experiences) {
    if (!exp.start_date) continue;
    const start = new Date(exp.start_date);
    if (Number.isNaN(start.getTime())) continue;

    const end = exp.end_date ? new Date(exp.end_date) : now;
    if (Number.isNaN(end.getTime()) || end < start) continue;

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(1, months);
  }

  const years = totalMonths / 12;

  if (years < 2) return { level: "JUNIOR", rank: 0 };
  if (years < 5) return { level: "PLENO", rank: 1 };
  if (years < 8) return { level: "SENIOR", rank: 2 };
  return { level: "LEAD", rank: 3 };
}

// ============================================================================
// Tratamento de Modalidade e Localização
// ============================================================================

/**
 * Normaliza e compara duas localizações brasileiras ou genéricas.
 */
function isLocationCompatible(candidateLoc?: string | null, jobLoc?: string | null): boolean {
  if (!candidateLoc || !jobLoc) return false;

  const cClean = candidateLoc.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const jClean = jobLoc.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (cClean === jClean) return true;

  // Extração de partes (cidade, estado)
  const cParts = cClean.split(/[-,/]/).map((p) => p.trim()).filter((p) => p.length >= 2);
  const jParts = jClean.split(/[-,/]/).map((p) => p.trim()).filter((p) => p.length >= 2);

  // Match se houver interseção entre cidade ou sigla de estado
  return cParts.some((cp) => jParts.includes(cp));
}

// ============================================================================
// Engine Principal
// ============================================================================

/**
 * Calcula determinísticamente a compatibilidade entre um candidato e uma vaga.
 *
 * @param candidate Perfil, competências e histórico do candidato.
 * @param job Requisitos, competências e detalhes da vaga.
 * @returns MatchEvaluationResult com nota, breakdown, explicações e feedback.
 */
export function calculateJobMatch(
  candidate: CandidateMatchingInput,
  job: JobMatchingInput
): MatchEvaluationResult {
  // --------------------------------------------------------------------------
  // 1. Avaliação de Competências Técnicas (Peso Máximo: 60 Pontos)
  // --------------------------------------------------------------------------
  const candSkills = extractSkills(candidate?.skills);
  const jobSkills = extractSkills(job?.skills);

  const candNormSet = new Set(candSkills.map((s) => s.normalized));
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const js of jobSkills) {
    if (candNormSet.has(js.normalized)) {
      matchedSkills.push(js.original);
    } else {
      missingSkills.push(js.original);
    }
  }

  let skillsScore = 0;
  const maxSkillsScore = 60;

  if (jobSkills.length > 0) {
    const ratio = matchedSkills.length / jobSkills.length;
    skillsScore = Math.round(ratio * maxSkillsScore);
  } else {
    // Vaga não especificou competências
    skillsScore = 0;
  }

  // --------------------------------------------------------------------------
  // 2. Avaliação de Senioridade (Peso Máximo: 25 Pontos)
  // --------------------------------------------------------------------------
  const jobSeniority = parseSeniority(job?.level);
  let candSeniority = parseSeniority(candidate?.seniority);

  if (!candSeniority && candidate?.experiences) {
    candSeniority = inferSeniorityFromExperiences(candidate.experiences);
  }

  let seniorityScore = 0;
  const maxSeniorityScore = 25;
  let seniorityAlignment: SeniorityAlignment = "UNKNOWN";

  if (!jobSeniority || !candSeniority) {
    // Dado ausente: aplica pontuação neutra documentada
    seniorityScore = 12;
    seniorityAlignment = "UNKNOWN";
  } else {
    const diff = Math.abs(candSeniority.rank - jobSeniority.rank);
    if (diff === 0) {
      seniorityScore = 25;
      seniorityAlignment = "EXACT";
    } else if (diff === 1) {
      seniorityScore = 15;
      seniorityAlignment = "NEAR";
    } else {
      seniorityScore = 5;
      seniorityAlignment = "DISTANT";
    }
  }

  // --------------------------------------------------------------------------
  // 3. Avaliação de Modalidade e Localização (Peso Máximo: 15 Pontos)
  // --------------------------------------------------------------------------
  const rawModality = (job?.modality || "").toUpperCase().trim();
  const isRemote = rawModality === "REMOTE" || rawModality.includes("REMOT");

  let locationScore = 0;
  const maxLocationScore = 15;
  let locationAlignment: LocationAlignment = "UNKNOWN";

  if (isRemote) {
    locationScore = 15;
    locationAlignment = "REMOTE_FRIENDLY";
  } else if (rawModality === "HYBRID" || rawModality === "ON_SITE") {
    if (!candidate?.location || !job?.location) {
      locationScore = 7;
      locationAlignment = "UNKNOWN";
    } else if (isLocationCompatible(candidate.location, job.location)) {
      locationScore = 15;
      locationAlignment = "MATCH";
    } else {
      locationScore = 0;
      locationAlignment = "MISMATCH";
    }
  } else {
    // Modalidade não especificada na vaga
    locationScore = 7;
    locationAlignment = "UNKNOWN";
  }

  // --------------------------------------------------------------------------
  // 4. Consolidação do Score e Tiers
  // --------------------------------------------------------------------------
  const rawTotal = skillsScore + seniorityScore + locationScore;
  const score = Math.max(0, Math.min(100, Math.round(rawTotal)));

  let tier: MatchTier = "BAIXA";
  if (score >= 80) {
    tier = "ALTA";
  } else if (score >= 50) {
    tier = "MEDIA";
  }

  const breakdown: MatchBreakdown = {
    skillsScore,
    maxSkillsScore,
    seniorityScore,
    maxSeniorityScore,
    locationScore,
    maxLocationScore,
  };

  // --------------------------------------------------------------------------
  // 5. Avaliação da Suficiência de Dados
  // --------------------------------------------------------------------------
  let dataSufficiency: DataSufficiency = "COMPLETE";
  if (jobSkills.length === 0 || candSkills.length === 0) {
    dataSufficiency = "INSUFFICIENT";
  } else if (seniorityAlignment === "UNKNOWN" || locationAlignment === "UNKNOWN") {
    dataSufficiency = "PARTIAL";
  }

  // --------------------------------------------------------------------------
  // 6. Geração da Explicação Textual Neutra (RF28)
  // --------------------------------------------------------------------------
  const summaryParts: string[] = [];

  if (jobSkills.length > 0) {
    summaryParts.push(
      `Você possui ${matchedSkills.length} de ${jobSkills.length} competências exigidas (${skillsScore}/60 pts).`
    );
  } else {
    summaryParts.push("A vaga não listou competências técnicas específicas no cadastro (0/60 pts).");
  }

  if (seniorityAlignment === "EXACT") {
    summaryParts.push(`Seu nível de senioridade coincide exatamente com o perfil buscado (+25 pts).`);
  } else if (seniorityAlignment === "NEAR") {
    summaryParts.push(`Sua senioridade é próxima ao nível solicitado pela oportunidade (+15 pts).`);
  } else if (seniorityAlignment === "DISTANT") {
    summaryParts.push(`Existe divergência significativa entre o nível exigido e sua senioridade atual (+5 pts).`);
  } else {
    summaryParts.push(`Nível de senioridade não pôde ser comparado com precisão (+12 pts neutros).`);
  }

  if (locationAlignment === "REMOTE_FRIENDLY") {
    summaryParts.push(`Vaga 100% remota compatível com qualquer localidade (+15 pts).`);
  } else if (locationAlignment === "MATCH") {
    summaryParts.push(`Localização compatível com a modalidade presencial/híbrida (+15 pts).`);
  } else if (locationAlignment === "MISMATCH") {
    summaryParts.push(`Localização divergente para vaga presencial/híbrida (+0 pts).`);
  } else {
    summaryParts.push(`Localização ou modalidade não especificada para cálculo exato (+7 pts neutros).`);
  }

  const summaryExplanation = summaryParts.join(" ");

  // --------------------------------------------------------------------------
  // 7. Ações Sugeridas ao Candidato (Feedback Construtivo)
  // --------------------------------------------------------------------------
  const feedbackParts: string[] = [];

  if (missingSkills.length > 0) {
    const list = missingSkills.slice(0, 4).join(", ");
    feedbackParts.push(
      `Para aumentar sua afinidade com esta vaga, destaque conhecimentos práticos em: ${list}${missingSkills.length > 4 ? " e outras" : ""}.`
    );
  }

  if (candSkills.length === 0) {
    feedbackParts.push("Cadastre suas competências técnicas no perfil profissional para liberar a pontuação completa.");
  }

  if (seniorityAlignment === "UNKNOWN") {
    feedbackParts.push("Complete seu histórico de experiências para que sua senioridade seja reconhecida automaticamente.");
  }

  if (locationAlignment === "MISMATCH") {
    feedbackParts.push("Verifique se você tem disponibilidade para atuação presencial ou híbrida na localidade indicada.");
  }

  if (feedbackParts.length === 0) {
    feedbackParts.push("Seu perfil apresenta excelente alinhamento com os requisitos declarados para esta posição.");
  }

  const actionableFeedback = feedbackParts.join(" ");

  return {
    score,
    tier,
    breakdown,
    matchedSkills,
    missingSkills,
    candidateSkillsTotal: candSkills.length,
    jobSkillsTotal: jobSkills.length,
    seniorityAlignment,
    locationAlignment,
    dataSufficiency,
    summaryExplanation,
    actionableFeedback,
  };
}
