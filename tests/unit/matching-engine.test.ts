import { describe, it, expect } from "vitest";
import { calculateJobMatch, normalizeSkillName } from "@/lib/matching/engine";
import { CandidateMatchingInput, JobMatchingInput } from "@/lib/matching/types";

describe("TechLink — Engine de Matching Determinístico (RF26, RF27 e RF28)", () => {
  it("0. Normalizador de competências: mapeia equivalências canônicas e remove pontuação", () => {
    expect(normalizeSkillName(" React.js ")).toBe("react");
    expect(normalizeSkillName("NODEJS")).toBe("nodejs");
    expect(normalizeSkillName("k8s")).toBe("kubernetes");
    expect(normalizeSkillName("Postgres")).toBe("postgresql");
    expect(normalizeSkillName("C#")).toBe("c#");
    expect(normalizeSkillName("")).toBe("");
  });

  // --------------------------------------------------------------------------
  // Cenário 1: Correspondência Perfeita
  // --------------------------------------------------------------------------
  it("1. Correspondência perfeita: 100% das competências, senioridade exata e vaga remota", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      seniority: "SENIOR",
      location: "Belo Horizonte, MG",
    };

    const job: JobMatchingInput = {
      title: "Desenvolvedor Full Stack Sênior",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      level: "SENIOR",
      modality: "REMOTE",
      location: "São Paulo, SP",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.score).toBe(100);
    expect(result.tier).toBe("ALTA");
    expect(result.breakdown.skillsScore).toBe(60);
    expect(result.breakdown.seniorityScore).toBe(25);
    expect(result.breakdown.locationScore).toBe(15);
    expect(result.matchedSkills).toEqual(["React", "TypeScript", "Node.js", "PostgreSQL"]);
    expect(result.missingSkills).toEqual([]);
    expect(result.seniorityAlignment).toBe("EXACT");
    expect(result.locationAlignment).toBe("REMOTE_FRIENDLY");
    expect(result.dataSufficiency).toBe("COMPLETE");
    expect(result.summaryExplanation).toContain("4 de 4 competências exigidas");
  });

  // --------------------------------------------------------------------------
  // Cenário 2: Correspondência Parcial de Competências
  // --------------------------------------------------------------------------
  it("2. Correspondência parcial: 2 de 4 competências atendidas pontuam proporcionalmente", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React", "TypeScript"],
      seniority: "PLENO",
      location: "Remoto",
    };

    const job: JobMatchingInput = {
      title: "Desenvolvedor Frontend Pleno",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
      level: "PLENO",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    // 2/4 * 60 = 30 pts em skills + 25 pts senioridade + 15 pts remoto = 70 pts
    expect(result.breakdown.skillsScore).toBe(30);
    expect(result.breakdown.seniorityScore).toBe(25);
    expect(result.breakdown.locationScore).toBe(15);
    expect(result.score).toBe(70);
    expect(result.tier).toBe("MEDIA");
    expect(result.matchedSkills).toEqual(["React", "TypeScript"]);
    expect(result.missingSkills).toEqual(["Tailwind CSS", "Next.js"]);
  });

  // --------------------------------------------------------------------------
  // Cenário 3: Nenhuma Competência Coincidente
  // --------------------------------------------------------------------------
  it("3. Nenhuma competência coincidente zera a pontuação do eixo técnico", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["Java", "Spring Boot", "Oracle"],
      seniority: "SENIOR",
      location: "São Paulo, SP",
    };

    const job: JobMatchingInput = {
      title: "Engenheiro Frontend",
      skills: ["React", "TypeScript", "Vue.js"],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.skillsScore).toBe(0);
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toHaveLength(3);
    // 0 + 25 + 15 = 40 pts
    expect(result.score).toBe(40);
    expect(result.tier).toBe("BAIXA");
  });

  // --------------------------------------------------------------------------
  // Cenário 4: Lista de Competências Vazia do Candidato
  // --------------------------------------------------------------------------
  it("4. Candidato sem competências cadastradas: pontuação técnica zero e feedback orientador", () => {
    const candidate: CandidateMatchingInput = {
      skills: [],
      seniority: "PLENO",
    };

    const job: JobMatchingInput = {
      title: "Dev Backend",
      skills: ["Node.js", "Docker"],
      level: "PLENO",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.skillsScore).toBe(0);
    expect(result.missingSkills).toEqual(["Node.js", "Docker"]);
    expect(result.dataSufficiency).toBe("INSUFFICIENT");
    expect(result.actionableFeedback).toContain("Cadastre suas competências técnicas");
  });

  // --------------------------------------------------------------------------
  // Cenário 5: Lista de Competências Vazia da Vaga
  // --------------------------------------------------------------------------
  it("5. Vaga sem competências definidas: não inventa score técnico e marca suficiência insuficiente", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React", "TypeScript"],
      seniority: "SENIOR",
      location: "Curitiba, PR",
    };

    const job: JobMatchingInput = {
      title: "Desenvolvedor Geral",
      skills: [],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.skillsScore).toBe(0);
    expect(result.dataSufficiency).toBe("INSUFFICIENT");
    expect(result.summaryExplanation).toContain("A vaga não listou competências técnicas específicas");
  });

  // --------------------------------------------------------------------------
  // Cenário 6: Diferenças de Capitalização, Espaços e Pontuações
  // --------------------------------------------------------------------------
  it("6. Normalização: tolera maiúsculas, pontuações canônicas e espaços sem perder precisão", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["  React.js  ", "NODEJS", "typescript", "C#", "k8s"],
      seniority: "PLENO",
    };

    const job: JobMatchingInput = {
      title: "Dev Cloud",
      skills: ["React", "Node.js", "TypeScript", "csharp", "kubernetes"],
      level: "PLENO",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.skillsScore).toBe(60);
    expect(result.matchedSkills).toHaveLength(5);
    expect(result.missingSkills).toHaveLength(0);
  });

  // --------------------------------------------------------------------------
  // Cenário 7: Competências Duplicadas
  // --------------------------------------------------------------------------
  it("7. Competências duplicadas na entrada são deduplicadas sem inflar a nota", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React", "react", "REACT", "TypeScript"],
      seniority: "PLENO",
    };

    const job: JobMatchingInput = {
      title: "Dev",
      skills: ["React", "reactjs", "TypeScript", "Docker"],
      level: "PLENO",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    // Vaga deduplicada: React, TypeScript, Docker (3 skills)
    // Candidato deduplicado atende: React e TypeScript (2/3 * 60 = 40 pts)
    expect(result.candidateSkillsTotal).toBe(2);
    expect(result.jobSkillsTotal).toBe(3);
    expect(result.breakdown.skillsScore).toBe(40);
  });

  // --------------------------------------------------------------------------
  // Cenário 8: Senioridade Exata
  // --------------------------------------------------------------------------
  it("8. Senioridade exata confere 25 pontos máximos", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "SENIOR",
    };

    const job: JobMatchingInput = {
      title: "Lead/Senior Dev",
      skills: ["React"],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.seniorityScore).toBe(25);
    expect(result.seniorityAlignment).toBe("EXACT");
  });

  // --------------------------------------------------------------------------
  // Cenário 9: Senioridade Próxima (Diferença de 1 Nível)
  // --------------------------------------------------------------------------
  it("9. Senioridade próxima (Pleno vs Sênior) confere 15 pontos", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "PLENO",
    };

    const job: JobMatchingInput = {
      title: "Senior Dev",
      skills: ["React"],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.seniorityScore).toBe(15);
    expect(result.seniorityAlignment).toBe("NEAR");
  });

  // --------------------------------------------------------------------------
  // Cenário 10: Senioridade Distante (Diferença >= 2 Níveis)
  // --------------------------------------------------------------------------
  it("10. Senioridade distante (Júnior vs Lead) confere 5 pontos", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "JUNIOR",
    };

    const job: JobMatchingInput = {
      title: "Tech Lead",
      skills: ["React"],
      level: "LEAD",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.seniorityScore).toBe(5);
    expect(result.seniorityAlignment).toBe("DISTANT");
  });

  // --------------------------------------------------------------------------
  // Cenário 11: Senioridade Desconhecida / Não Declarada
  // --------------------------------------------------------------------------
  it("11. Senioridade desconhecida aplica pontuação neutra documentada (12 pontos)", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: null,
    };

    const job: JobMatchingInput = {
      title: "Dev",
      skills: ["React"],
      level: null,
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.seniorityScore).toBe(12);
    expect(result.seniorityAlignment).toBe("UNKNOWN");
  });

  // --------------------------------------------------------------------------
  // Cenário 12: Trabalho Remoto
  // --------------------------------------------------------------------------
  it("12. Modalidade REMOTE concede pontuação máxima (15 pontos) independente do local", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "PLENO",
      location: "Manaus, AM",
    };

    const job: JobMatchingInput = {
      title: "Dev Remoto",
      skills: ["React"],
      level: "PLENO",
      modality: "REMOTE",
      location: "Porto Alegre, RS",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.locationScore).toBe(15);
    expect(result.locationAlignment).toBe("REMOTE_FRIENDLY");
  });

  // --------------------------------------------------------------------------
  // Cenário 13: Localização Compatível em Vaga Presencial
  // --------------------------------------------------------------------------
  it("13. Localização compatível em vaga presencial/híbrida confere 15 pontos", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "PLENO",
      location: "São Paulo, SP",
    };

    const job: JobMatchingInput = {
      title: "Dev Presencial",
      skills: ["React"],
      level: "PLENO",
      modality: "ON_SITE",
      location: "São Paulo - SP",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.locationScore).toBe(15);
    expect(result.locationAlignment).toBe("MATCH");
  });

  // --------------------------------------------------------------------------
  // Cenário 14: Localização Incompatível em Vaga Presencial
  // --------------------------------------------------------------------------
  it("14. Localização incompatível para vaga presencial zera a pontuação geográfica", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "PLENO",
      location: "Fortaleza, CE",
    };

    const job: JobMatchingInput = {
      title: "Dev Presencial",
      skills: ["React"],
      level: "PLENO",
      modality: "ON_SITE",
      location: "Curitiba, PR",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.locationScore).toBe(0);
    expect(result.locationAlignment).toBe("MISMATCH");
    expect(result.actionableFeedback).toContain("disponibilidade para atuação presencial");
  });

  // --------------------------------------------------------------------------
  // Cenário 15: Localização Desconhecida
  // --------------------------------------------------------------------------
  it("15. Localização desconhecida em vaga presencial atribui 7 pontos neutros", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React"],
      seniority: "PLENO",
      location: null,
    };

    const job: JobMatchingInput = {
      title: "Dev Híbrido",
      skills: ["React"],
      level: "PLENO",
      modality: "HYBRID",
      location: "Rio de Janeiro, RJ",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.breakdown.locationScore).toBe(7);
    expect(result.locationAlignment).toBe("UNKNOWN");
  });

  // --------------------------------------------------------------------------
  // Cenário 16: Combinações de Dados Ausentes
  // --------------------------------------------------------------------------
  it("16. Entrada inteiramente nula ou mínima calcula score seguro sem estourar exceções", () => {
    const candidate: CandidateMatchingInput = {};
    const job: JobMatchingInput = { title: "Vaga Teste" };

    const result = calculateJobMatch(candidate, job);

    // Skills: 0, Senioridade: 12 (neutra), Local: 7 (neutra) = 19 pts
    expect(result.score).toBe(19);
    expect(result.tier).toBe("BAIXA");
    expect(result.dataSufficiency).toBe("INSUFFICIENT");
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toEqual([]);
  });

  // --------------------------------------------------------------------------
  // Cenário 17: Limites e Faixas de Pontuação
  // --------------------------------------------------------------------------
  it("17. Limites garantem que o score fique rigidamente em [0, 100] e defina o tier correto", () => {
    // Caso de alta: >= 80
    const high = calculateJobMatch(
      { skills: ["A", "B", "C"], seniority: "SENIOR", location: "SP" },
      { title: "Vaga", skills: ["A", "B", "C"], level: "SENIOR", modality: "REMOTE" }
    );
    expect(high.score).toBeGreaterThanOrEqual(80);
    expect(high.tier).toBe("ALTA");

    // Caso de média: 50 <= score < 80
    const medium = calculateJobMatch(
      { skills: ["A"], seniority: "SENIOR", location: "SP" },
      { title: "Vaga", skills: ["A", "B"], level: "SENIOR", modality: "REMOTE" }
    );
    // 30 (skills) + 25 (seniority) + 15 (loc) = 70
    expect(medium.score).toBe(70);
    expect(medium.tier).toBe("MEDIA");

    // Caso de baixa: < 50
    const low = calculateJobMatch(
      { skills: [], seniority: "JUNIOR", location: "AM" },
      { title: "Vaga", skills: ["A", "B"], level: "LEAD", modality: "ON_SITE", location: "RS" }
    );
    // 0 + 5 + 0 = 5
    expect(low.score).toBe(5);
    expect(low.tier).toBe("BAIXA");
  });

  // --------------------------------------------------------------------------
  // Cenário 18: Determinismo Absoluto
  // --------------------------------------------------------------------------
  it("18. Determinismo: 10 execuções idênticas produzem rigorosamente o mesmo resultado", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React", "TypeScript"],
      seniority: "PLENO",
      location: "Campinas, SP",
    };

    const job: JobMatchingInput = {
      title: "Dev",
      skills: ["React", "TypeScript", "Node.js"],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const first = calculateJobMatch(candidate, job);

    for (let i = 0; i < 9; i++) {
      const next = calculateJobMatch(candidate, job);
      expect(next).toEqual(first);
    }
  });

  // --------------------------------------------------------------------------
  // Cenário 19: Explicação Coerente com o Cálculo (RF28)
  // --------------------------------------------------------------------------
  it("19. Explicação textual cita explicitamente os pontos e competências apuradas", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["React", "Node.js"],
      seniority: "SENIOR",
    };

    const job: JobMatchingInput = {
      title: "Senior Full Stack",
      skills: ["React", "Node.js", "Docker"],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.summaryExplanation).toContain("2 de 3 competências exigidas (40/60 pts)");
    expect(result.summaryExplanation).toContain("coincide exatamente com o perfil buscado (+25 pts)");
    expect(result.summaryExplanation).toContain("Vaga 100% remota compatível com qualquer localidade (+15 pts)");
    expect(result.actionableFeedback).toContain("Docker");
  });

  // --------------------------------------------------------------------------
  // Cenário 20: Inferência de Senioridade a partir de Experiências Profissionais
  // --------------------------------------------------------------------------
  it("20. Infere senioridade de forma determinística quando não declarada mas presente em experiences", () => {
    const candidate: CandidateMatchingInput = {
      skills: ["Java"],
      seniority: null, // Não declarada
      experiences: [
        { title: "Dev Jr", start_date: "2018-01-01", end_date: "2021-01-01" }, // 3 anos
        { title: "Dev Pleno", start_date: "2021-02-01", end_date: "2024-02-01" }, // 3 anos (total 6 anos -> Sênior)
      ],
    };

    const job: JobMatchingInput = {
      title: "Java Sênior",
      skills: ["Java"],
      level: "SENIOR",
      modality: "REMOTE",
    };

    const result = calculateJobMatch(candidate, job);

    expect(result.seniorityAlignment).toBe("EXACT");
    expect(result.breakdown.seniorityScore).toBe(25);
  });
});
