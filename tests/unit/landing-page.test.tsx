import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/landing/SkipLink";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturedJobsClient } from "@/components/landing/FeaturedJobsClient";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";

describe("Landing Page — Componentes Visuais e Acessibilidade", () => {
  it("renderiza o SkipLink para navegação acessível por teclado", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /pular para o conteúdo principal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("renderiza o Header com logo, navegação e botões de ação", () => {
    render(<Header />);
    expect(screen.getByLabelText("DevJobs 2.0 Início")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Benefícios" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "Como funciona" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "Vagas em destaque" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "Comunidade" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });

  it("renderiza o HeroSection com título, lead e CTAs aprovados", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/conectando talentos tech/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorar vagas/i })).toHaveAttribute("href", "#vagas");
    expect(screen.getByRole("link", { name: /sou uma empresa/i })).toHaveAttribute(
      "href",
      "#beneficios-empresas"
    );
    expect(document.querySelector(".hero-cinematic-scene")).toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza a seção de Benefícios com pilares de candidatos e empresas", () => {
    render(<BenefitsSection />);
    expect(screen.getByRole("heading", { name: /para desenvolvedores/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /para empresas tech/i })).toBeInTheDocument();
    expect(screen.getByText(/perfil profissional estruturado/i)).toBeInTheDocument();
    expect(screen.getByText(/perfil empresarial com governança/i)).toBeInTheDocument();
  });

  it("renderiza a seção Como Funciona com os 4 passos da jornada", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText("Crie seu perfil")).toBeInTheDocument();
    expect(screen.getByText("Descubra oportunidades")).toBeInTheDocument();
    expect(screen.getByText("Conecte competências")).toBeInTheDocument();
    expect(screen.getByText("Acompanhe o processo")).toBeInTheDocument();
  });

  it("renderiza o estado Vazio de Vagas em Destaque com mensagem e link para catálogo", () => {
    render(<FeaturedJobsClient jobs={[]} error={null} />);
    expect(
      screen.getByText(/nenhuma vaga em destaque encontrada no momento/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorar catálogo de vagas/i })).toHaveAttribute(
      "href",
      "/vagas"
    );
  });

  it("renderiza o estado de Erro de Vagas em Destaque caso ocorra falha de consulta", () => {
    render(<FeaturedJobsClient jobs={[]} error="Falha de conexão" />);
    expect(
      screen.getByText(/não foi possível carregar as vagas em destaque/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("renderiza os cards de vagas com selos e botões de ação quando houver vagas reais", () => {
    const mockJobs = [
      {
        id: "job-1",
        title: "Engenheiro Frontend Sênior",
        companyName: "TechCorp",
        modality: "Remoto",
        level: "Sênior",
        location: "Brasil",
        created_at: new Date().toISOString(),
        isRecent: true,
        isFeatured: true,
      },
    ];

    render(<FeaturedJobsClient jobs={mockJobs} error={null} />);
    expect(screen.getByText("Engenheiro Frontend Sênior")).toBeInTheDocument();
    expect(screen.getByText("TechCorp")).toBeInTheDocument();
    expect(screen.getByText("Recente")).toBeInTheDocument();
    expect(screen.getByText("Destaque")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar vaga/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes da vaga/i })).toHaveAttribute(
      "href",
      "/vagas/job-1"
    );
  });

  it("renderiza a seção de Comunidade com painéis de ecossistema sem dados fictícios", () => {
    render(<CommunitySection />);
    expect(screen.getByText("Diversidade de Especialidades")).toBeInTheDocument();
    expect(screen.getByText("Critérios Técnicos Claros")).toBeInTheDocument();
    expect(screen.getByText("Alinhamento Profissional")).toBeInTheDocument();
    expect(document.querySelector(".cm-cinematic-scene")).toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza a seção de CTA Final e Rodapé institucional", () => {
    render(<CtaFooterSection />);
    expect(screen.getByRole("heading", { name: /pronto para transformar sua jornada tech/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao topo/i })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(document.querySelector(".cta-cinematic-scene")).toHaveAttribute("aria-hidden", "true");
  });
});
