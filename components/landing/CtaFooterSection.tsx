import Link from "next/link";
import { CtaCinematicScene } from "./CtaCinematicScene";

export function CtaFooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Bloco de CTA Final (LP-06) */}
      <section id="cta-final" className="cta-section" aria-labelledby="cta-title">
        <CtaCinematicScene />
        <div className="container">
          <div className="cta-box">
            <h2 id="cta-title" className="cta-title">
              Pronto para transformar sua jornada tech?
            </h2>
            <p className="cta-lead">
              Conecte-se às oportunidades certas para o seu momento de carreira ou publique suas
              vagas para alcançar desenvolvedores qualificados.
            </p>
            <div className="cta-buttons">
              <Link href="#vagas" className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
                Explorar vagas agora
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="#beneficios-empresas" className="btn btn-secondary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
                Sou uma empresa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé Institucional Completo */}
      <footer className="site-footer" role="contentinfo">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="header-logo">
                <div className="header-logo-icon" aria-hidden="true">
                  DJ
                </div>
                <span>DevJobs 2.0</span>
              </div>
              <p className="footer-desc">
                Plataforma de recrutamento em tecnologia desenhada para conectar competências
                reais a desafios de engenharia com transparência e precisão.
              </p>
            </div>

            <div>
              <h3 className="footer-col-title">Navegação</h3>
              <ul className="footer-links">
                <li>
                  <Link href="#main-content" className="footer-link">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="#beneficios" className="footer-link">
                    Benefícios
                  </Link>
                </li>
                <li>
                  <Link href="#como-funciona" className="footer-link">
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link href="#vagas" className="footer-link">
                    Vagas em destaque
                  </Link>
                </li>
                <li>
                  <Link href="#comunidade" className="footer-link">
                    Comunidade
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-col-title">Público</h3>
              <ul className="footer-links">
                <li>
                  <Link href="#beneficios-candidatos" className="footer-link">
                    Para Desenvolvedores
                  </Link>
                </li>
                <li>
                  <Link href="#beneficios-empresas" className="footer-link">
                    Para Empresas Tech
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="footer-link">
                    Acessar minha conta
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-col-title">Institucional</h3>
              <ul className="footer-links">
                <li>
                  <span className="footer-link" style={{ cursor: "default" }}>
                    Termos de Uso
                  </span>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: "default" }}>
                    Privacidade e Dados
                  </span>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: "default" }}>
                    Acessibilidade WCAG
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              &copy; {currentYear} DevJobs 2.0. Todos os direitos reservados.
            </span>
            <a
              href="#main-content"
              className="footer-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              Voltar ao topo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
