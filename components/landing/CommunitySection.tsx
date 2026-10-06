import { CommunityCinematicScene } from "./CommunityCinematicScene";

export function CommunitySection() {
  const panels = [
    {
      title: "Diversidade de Especialidades",
      desc: "Ecossistema focado nas principais áreas da engenharia de software: frontend, backend, dados, mobile, devops, arquitetura e segurança da informação.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      title: "Critérios Técnicos Claros",
      desc: "Processos seletivos orientados a competências verificáveis e requisitos objetivos, eliminando etapas burocráticas ou opacas.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: "Alinhamento Profissional",
      desc: "Comunicação fluida entre profissionais de tecnologia e equipes de contratação, com visibilidade mútua sobre desafios técnicos e stack.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section id="comunidade" className="community-section" aria-labelledby="community-title">
      <CommunityCinematicScene />
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
          <span className="section-tag">Ecossistema Conectado</span>
          <h2 id="community-title" className="section-title">
            O ponto de encontro da engenharia de software
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Aproximamos talentos e lideranças técnicas através de um ambiente estruturado para
            valorizar competências, práticas de desenvolvimento e clareza de expectativas.
          </p>
        </div>

        <div className="community-panels">
          {panels.map((panel, index) => (
            <div key={index} className="community-panel">
              <div className="community-panel-icon" aria-hidden="true">
                {panel.icon}
              </div>
              <h3 className="community-panel-title">{panel.title}</h3>
              <p className="community-panel-desc">{panel.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
