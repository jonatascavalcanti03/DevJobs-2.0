import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobMatchPanel } from "@/components/jobs/JobMatchPanel";
import { MatchEvaluationResult } from "@/lib/matching/types";

const completeMatch: MatchEvaluationResult = {
  score: 92,
  tier: "ALTA",
  breakdown: {
    skillsScore: 52,
    maxSkillsScore: 60,
    seniorityScore: 25,
    maxSeniorityScore: 25,
    locationScore: 15,
    maxLocationScore: 15,
  },
  matchedSkills: ["TypeScript", "Next.js", "PostgreSQL"],
  missingSkills: ["Docker"],
  candidateSkillsTotal: 3,
  jobSkillsTotal: 4,
  seniorityAlignment: "EXACT",
  locationAlignment: "REMOTE_FRIENDLY",
  dataSufficiency: "COMPLETE",
  summaryExplanation: "Você possui 3 de 4 competências exigidas (52/60 pts). Seu nível de senioridade coincide exatamente (+25 pts). Vaga 100% remota (+15 pts).",
  actionableFeedback: "Para aumentar sua afinidade com esta vaga, destaque conhecimentos práticos em: Docker.",
};

const partialInsufficientMatch: MatchEvaluationResult = {
  score: 31,
  tier: "BAIXA",
  breakdown: {
    skillsScore: 0,
    maxSkillsScore: 60,
    seniorityScore: 12,
    maxSeniorityScore: 25,
    locationScore: 7,
    maxLocationScore: 15,
  },
  matchedSkills: [],
  missingSkills: ["Go (Golang)", "PostgreSQL"],
  candidateSkillsTotal: 0,
  jobSkillsTotal: 2,
  seniorityAlignment: "UNKNOWN",
  locationAlignment: "UNKNOWN",
  dataSufficiency: "INSUFFICIENT",
  summaryExplanation: "Você possui 0 de 2 competências exigidas (0/60 pts). Nível de senioridade não pôde ser comparado com precisão (+12 pts neutros). Localização não especificada (+7 pts neutros).",
  actionableFeedback: "Cadastre suas competências técnicas no perfil profissional para liberar a pontuação completa.",
};

describe("JobMatchPanel — Painel Explicável de Matching (RF26, RF27 e RF28)", () => {
  it("renderiza painel com score, tier, badges e explicação determinística completa", () => {
    render(<JobMatchPanel matchResult={completeMatch} />);

    expect(screen.getByTestId("job-match-panel")).toBeInTheDocument();
    expect(screen.getByText("Seu Match com esta Oportunidade")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("Afinidade ALTA")).toBeInTheDocument();
    expect(screen.getByText("Dados Completos")).toBeInTheDocument();

    // Explicação textual da nota (RF28)
    expect(screen.getByText(/você possui 3 de 4 competências exigidas/i)).toBeInTheDocument();

    // Breakdown dos 3 eixos
    expect(screen.getByText("Competências Técnicas")).toBeInTheDocument();
    expect(screen.getByText("52 / 60 pts")).toBeInTheDocument();
    expect(screen.getByText("Senioridade")).toBeInTheDocument();
    expect(screen.getByText("25 / 25 pts")).toBeInTheDocument();
    expect(screen.getByText("Modalidade e Localização")).toBeInTheDocument();
    expect(screen.getByText("15 / 15 pts")).toBeInTheDocument();

    // Competências coincidentes e faltantes
    const matchedList = screen.getByTestId("matched-skills-list");
    expect(matchedList).toHaveTextContent("TypeScript");
    expect(matchedList).toHaveTextContent("Next.js");
    expect(matchedList).toHaveTextContent("PostgreSQL");

    const missingList = screen.getByTestId("missing-skills-list");
    expect(missingList).toHaveTextContent("Docker");

    // Feedback acionável
    expect(screen.getByTestId("actionable-feedback")).toHaveTextContent("Docker");

    // Nota consultiva obrigatória
    expect(screen.getByText(/o score de afinidade é/i)).toBeInTheDocument();
    expect(screen.getByText(/estritamente consultivo/i)).toBeInTheDocument();
  });

  it("apresenta tratamento neutro quando dados são insuficientes", () => {
    render(<JobMatchPanel matchResult={partialInsufficientMatch} />);

    expect(screen.getByText("Dados Insuficientes")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
    expect(screen.getByText("Afinidade BAIXA")).toBeInTheDocument();

    // Não deve acusar incompatibilidade culposa, e sim ausência de dados
    expect(screen.getByText(/nível de senioridade não pôde ser comparado com precisão/i)).toBeInTheDocument();
    expect(screen.getByText(/cadastre suas competências técnicas/i)).toBeInTheDocument();

    // Nenhuma lista de competências coincidentes deve ser exibida
    expect(screen.queryByTestId("matched-skills-list")).not.toBeInTheDocument();
    // Faltantes exibidas
    expect(screen.getByTestId("missing-skills-list")).toBeInTheDocument();
  });
});
