import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PremiumJobCard, JobCardData } from "@/components/jobs/PremiumJobCard";
import { MatchEvaluationResult } from "@/lib/matching/types";

const mockJob: JobCardData = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Engenheiro Frontend Sênior",
  description: "Desenvolvimento de aplicações web modernas com Next.js e React.",
  status: "ACTIVE",
  location: "São Paulo, SP",
  modality: "REMOTE",
  level: "SENIOR",
  created_at: "2026-10-15T12:00:00Z",
  companyName: "Acme Tech",
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
};

const mockMatchResult: MatchEvaluationResult = {
  score: 85,
  tier: "ALTA",
  breakdown: {
    skillsScore: 45,
    maxSkillsScore: 60,
    seniorityScore: 25,
    maxSeniorityScore: 25,
    locationScore: 15,
    maxLocationScore: 15,
  },
  matchedSkills: ["React", "TypeScript"],
  missingSkills: ["Next.js", "Tailwind CSS"],
  candidateSkillsTotal: 2,
  jobSkillsTotal: 4,
  seniorityAlignment: "EXACT",
  locationAlignment: "REMOTE_FRIENDLY",
  dataSufficiency: "COMPLETE",
  summaryExplanation: "Você possui 2 de 4 competências exigidas.",
  actionableFeedback: "Destaque conhecimentos em Next.js.",
};

describe("PremiumJobCard — Card Premium do Catálogo de Vagas (RF20 e RF26)", () => {
  it("renderiza informações essenciais da vaga para visitantes não autenticados", () => {
    render(<PremiumJobCard job={mockJob} isCandidate={false} matchResult={null} />);

    expect(screen.getByText("Engenheiro Frontend Sênior")).toBeInTheDocument();
    expect(screen.getByText("Acme Tech")).toBeInTheDocument();
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
    expect(screen.getByText("REMOTE")).toBeInTheDocument();
    expect(screen.getByText("SENIOR")).toBeInTheDocument();
    expect(screen.getByText("Aberta")).toBeInTheDocument();

    // Competências
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();

    // Link de detalhes
    const detailsLink = screen.getByRole("link", { name: /ver detalhes da vaga engenheiro frontend sênior/i });
    expect(detailsLink).toHaveAttribute("href", `/vagas/${mockJob.id}`);

    // Não deve exibir MatchMeter para visitante não autenticado
    expect(screen.queryByTestId("card-match-meter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("card-match-banner")).not.toBeInTheDocument();
  });

  it("renderiza MatchMeter com score calculado e badges correspondentes para candidato", () => {
    render(<PremiumJobCard job={mockJob} isCandidate={true} matchResult={mockMatchResult} />);

    const matchMeter = screen.getByTestId("card-match-meter");
    expect(matchMeter).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();

    // Checar se competências coincidentes têm a marcação visual ✓
    const matchedReact = screen.getByText("React").closest(".job-card-skill-tag");
    expect(matchedReact).toHaveClass("skill-tag-matched");

    // Banner de matching informativo
    const banner = screen.getByTestId("card-match-banner");
    expect(banner).toHaveTextContent("2");
    expect(banner).toHaveTextContent("competência(s) coincidente(s)");
  });

  it("exibe aviso de dados insuficientes no banner quando perfil do candidato for incompleto", () => {
    const insufficientMatch: MatchEvaluationResult = {
      ...mockMatchResult,
      score: 30,
      dataSufficiency: "INSUFFICIENT",
      matchedSkills: [],
      missingSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    };

    render(<PremiumJobCard job={mockJob} isCandidate={true} matchResult={insufficientMatch} />);

    expect(screen.getByText(/complete seu perfil para um cálculo mais assertivo/i)).toBeInTheDocument();
  });

  it("renderiza status inativo corretamente", () => {
    const inactiveJob: JobCardData = {
      ...mockJob,
      status: "CLOSED",
    };

    render(<PremiumJobCard job={inactiveJob} isCandidate={false} />);
    expect(screen.getByText("Inativa")).toBeInTheDocument();
  });
});
