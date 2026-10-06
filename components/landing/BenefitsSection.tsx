import { BenefitsCinematicScene } from "./BenefitsCinematicScene";

export function BenefitsSection() {
  const candidateBenefits = [
    {
      title: "Perfil Profissional Estruturado",
      desc: "Organize suas competências, histórico de projetos e stack de desenvolvimento em um formato objetivo.",
    },
    {
      title: "Busca e Filtros Especializados",
      desc: "Encontre oportunidades filtrando por modalidade (remoto, híbrido), senioridade e tecnologias específicas.",
    },
    {
      title: "Compatibilidade Técnica",
      desc: "Avaliação de aderência entre as competências da vaga e o seu perfil para direcionar candidaturas relevantes.",
    },
    {
      title: "Transparência nos Critérios",
      desc: "Entenda com clareza quais pontos do seu perfil se conectam aos requisitos de cada oportunidade.",
    },
    {
      title: "Gestão Centralizada de Candidaturas",
      desc: "Acompanhe a evolução e o status de cada processo seletivo do qual você participa.",
    },
    {
      title: "Orientação Consultiva de Perfil",
      desc: "Análise assistida para valorizar suas experiências técnicas mais relevantes para o mercado.",
    },
  ];

  const companyBenefits = [
    {
      title: "Perfil Empresarial com Governança",
      desc: "Apresente a cultura, desafios tecnológicos e equipe com padrões sólidos de governança.",
    },
    {
      title: "Publicação Estruturada de Oportunidades",
      desc: "Defina requisitos, tecnologias essenciais e benefícios de forma transparente e padronizada.",
    },
    {
      title: "Triagem Eficiente de Candidaturas",
      desc: "Visualize profissionais qualificados com histórico técnico e competências organizadas.",
    },
    {
      title: "Pipeline de Seleção Organizado",
      desc: "Gerencie as etapas seletivas com visibilidade total do funil de contratação da empresa.",
    },
    {
      title: "Gestão de Entrevistas Técnicas",
      desc: "Coordene conversas e alinhamentos técnicos diretamente com os profissionais selecionados.",
    },
  ];

  return (
    <section id="beneficios" className="benefits-section" aria-labelledby="benefits-title">
      <BenefitsCinematicScene />
      <div className="container">
        <div className="benefits-header">
          <span className="section-tag">Pilares de Valor</span>
          <h2 id="benefits-title" className="section-title">
            Projetado para quem constrói e contrata tecnologia
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Uma plataforma desenhada para eliminar ruídos no recrutamento técnico, conectando
            competências reais a necessidades genuínas de engenharia de software.
          </p>
        </div>

        <div className="benefits-columns">
          {/* Coluna Candidato */}
          <div className="benefits-column benefits-column-candidate" id="beneficios-candidatos">
            <div className="benefits-column-header">
              <div className="benefit-icon benefit-icon-candidate" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="benefits-column-title">Para Desenvolvedores</h3>
                <p className="benefits-column-subtitle">Visibilidade e clareza para sua carreira</p>
              </div>
            </div>

            <ul className="benefits-list">
              {candidateBenefits.map((item, index) => (
                <li key={index} className="benefit-item">
                  <div className="benefit-icon benefit-icon-candidate" style={{ width: 28, height: 28 }} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="benefit-title">{item.title}</h4>
                    <p className="benefit-description">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna Empresa */}
          <div className="benefits-column benefits-column-company" id="beneficios-empresas">
            <div className="benefits-column-header">
              <div className="benefit-icon benefit-icon-company" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <h3 className="benefits-column-title">Para Empresas Tech</h3>
                <p className="benefits-column-subtitle">Contratações precisas com governança</p>
              </div>
            </div>

            <ul className="benefits-list">
              {companyBenefits.map((item, index) => (
                <li key={index} className="benefit-item">
                  <div className="benefit-icon benefit-icon-company" style={{ width: 28, height: 28 }} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="benefit-title">{item.title}</h4>
                    <p className="benefit-description">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
