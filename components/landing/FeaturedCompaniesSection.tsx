import Link from "next/link";
import { DEMO_COMPANIES } from "@/lib/jobs/demo-catalog";

export function FeaturedCompaniesSection() {
  return (
    <section className="featured-companies-section" aria-labelledby="featured-companies-title">
      <div className="container">
        <div className="section-header-centered">
          <div className="section-badge">
            <span className="section-badge-dot" aria-hidden="true" />
            <span>Ecossistema Parceiro Demonstrativo</span>
          </div>
          <h2 id="featured-companies-title" className="section-title">
            Empresas que contratam pelo <span className="gradient-text">TechLink</span>
          </h2>
          <p className="section-subtitle">
            Conheça algumas das empresas de tecnologia com vagas e processos seletivos ativos na plataforma.
          </p>
        </div>

        <div className="featured-companies-grid" role="list">
          {DEMO_COMPANIES.map((company) => (
            <article key={company.id} className="company-card" role="listitem">
              <div className="company-card-top">
                <div className="company-avatar-placeholder" aria-hidden="true">
                  {company.initials}
                </div>
                <div className="company-info-header">
                  <h3 className="company-name">{company.tradingName}</h3>
                  <span className="company-segment">{company.segment}</span>
                </div>
              </div>

              <p className="company-desc">{company.description}</p>

              <div className="company-card-footer">
                <span className="company-location">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {company.location}
                </span>
                <Link
                  href={`/vagas?q=${encodeURIComponent(company.tradingName)}`}
                  className="company-jobs-link"
                  aria-label={`Ver ${company.jobsCount} vagas em ${company.tradingName}`}
                >
                  {company.jobsCount} vagas abertas →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

