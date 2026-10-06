import { HowItWorksCinematicScene } from "./HowItWorksCinematicScene";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Crie seu perfil",
      desc: "Cadastre suas competências técnicas, principais stacks, senioridade e preferências profissionais.",
    },
    {
      number: "02",
      title: "Descubra oportunidades",
      desc: "Navegue por vagas filtradas com clareza de requisitos, faixas salariais quando informadas e modalidade de trabalho.",
    },
    {
      number: "03",
      title: "Conecte competências",
      desc: "Avalie o alinhamento técnico entre suas habilidades e os requisitos exigidos com explicações de aderência.",
    },
    {
      number: "04",
      title: "Acompanhe o processo",
      desc: "Gerencie candidaturas e acompanhe as atualizações de cada etapa de forma organizada e transparente.",
    },
  ];

  return (
    <section id="como-funciona" className="how-it-works-section" aria-labelledby="how-it-works-title">
      <HowItWorksCinematicScene />
      <div className="container">
        <div className="how-it-works-header">
          <span className="section-tag">Fluxo Transparente</span>
          <h2 id="how-it-works-title" className="section-title">
            Como funciona o DevJobs 2.0
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Uma jornada desenhada em quatro etapas para simplificar sua aproximação com os
            projetos e times de engenharia certos.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-number" aria-label={`Passo ${step.number}`}>
                {step.number}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
