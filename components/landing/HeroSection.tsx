import Image from "next/image";
import Link from "next/link";
import { HeroCinematicScene } from "./HeroCinematicScene";

export function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      {/* Background Cinematográfico Imersivo (AST-01 Otimizado) */}
      <div className="hero-bg-container" aria-hidden="true">
        <Image
          src="/images/visual/01_hero_bg_desktop_otimizado.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-bg-image"
        />
        <div className="hero-gradient-overlay" />
      </div>
      <HeroCinematicScene />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-content">
          {/* Badge de Plataforma */}
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            <span>Recrutamento Técnico Especializado</span>
          </div>

          {/* Título Principal */}
          <h1 id="hero-title" className="hero-title">
            Conectando talentos tech às{" "}
            <span className="gradient-text">oportunidades certas.</span>
          </h1>

          {/* Subtítulo / Lead */}
          <p className="hero-lead">
            Plataforma inteligente de recrutamento em tecnologia. Compatibilidade técnica
            baseada em competências reais, transparência em cada etapa e conexão direta entre
            desenvolvedores e empresas.
          </p>

          {/* Chamadas de Ação (CTAs) */}
          <div className="hero-ctas">
            <Link href="#vagas" className="btn btn-primary" id="hero-cta-explore">
              Explorar vagas
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <Link href="#beneficios-empresas" className="btn btn-secondary" id="hero-cta-company">
              Sou uma empresa
            </Link>
          </div>

          {/* Pilares Fundamentais */}
          <div className="hero-pillars">
            <div className="hero-pillar-item">
              <span className="hero-pillar-label">Competências</span>
              <span className="hero-pillar-desc">
                Avaliação orientada à afinidade técnica e stack
              </span>
            </div>
            <div className="hero-pillar-item">
              <span className="hero-pillar-label">Transparência</span>
              <span className="hero-pillar-desc">
                Acompanhamento claro das etapas do processo
              </span>
            </div>
            <div className="hero-pillar-item">
              <span className="hero-pillar-label">Ecossistema</span>
              <span className="hero-pillar-desc">
                Oportunidades em engenharia, produto e dados
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
