import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Para Candidatos | TechLink" };

export default function CandidatesPage() {
  return (
    <ProductPreviewPage
      eyebrow="Para Talentos Tech"
      title="Sua carreira acelerada com transparência e precisão."
      description="Gerencie seu perfil profissional completo, descubra oportunidades com afinidade técnica explicável e acompanhe cada etapa das suas candidaturas em tempo real."
      cta={{ label: "Criar conta de candidato", href: "/register" }}
      secondaryCta={{ label: "Explorar catálogo de vagas", href: "/vagas" }}
      highlights={[
        {
          title: "Perfil Profissional Estruturado",
          description: "Cadastre experiências, formação, certificações, projetos e competências técnicas com upload seguro de currículo em PDF.",
          status: "Disponível",
          href: "/register",
          actionLabel: "Cadastre seu perfil",
        },
        {
          title: "Catálogo Inteligente & Filtros",
          description: "Explore vagas com filtros especializados por modalidade (remoto, híbrido, presencial), nível de experiência e stacks tecnológicas.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Acessar vagas abertas",
        },
        {
          title: "Matching Técnico Explicável",
          description: "Métricas de afinidade calculadas com base em competências reais entre seu perfil e a vaga, sem decisões automatizadas opacas.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Ver compatibilidade",
        },
        {
          title: "Acompanhamento de Candidaturas",
          description: "Painel exclusivo para visualizar o status do processo seletivo, histórico de etapas e agendamentos de entrevistas.",
          status: "Disponível",
          href: "/login",
          actionLabel: "Acessar painel",
        },
        {
          title: "Retirada Atômica de Candidatura",
          description: "Autonomia garantida para desistir ou retirar candidaturas de forma segura e imediata (RF29), preservando a rastreabilidade.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Ver detalhes",
        },
        {
          title: "Vagas Externas Integradas",
          description: "Acesso unificado a oportunidades parceiras via Adzuna, ampliando sua busca sem abrir mão do controle do seu perfil.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Ver vagas externas",
        },
      ]}
    />
  );
}
