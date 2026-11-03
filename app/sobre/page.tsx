import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Sobre | TechLink" };

export default function AboutPage() {
  return (
    <ProductPreviewPage
      eyebrow="Nossa Missão"
      title="Tecnologia transparente para aproximar quem constrói o futuro."
      description="O TechLink nasceu para transformar o recrutamento na área de tecnologia. Substituímos processos opacos e seleções descontextualizadas por critérios técnicos objetivos, rastreabilidade e respeito mútuo."
      cta={{ label: "Explorar oportunidades", href: "/vagas" }}
      secondaryCta={{ label: "Conhecer recursos", href: "/recursos" }}
      highlights={[
        {
          title: "Privacidade e Segurança por Padrão",
          description: "Dados de candidatos e empresas são estritamente isolados através de Row Level Security (RLS) no PostgreSQL e buckets privados.",
          status: "Pilar Fundamental",
          href: "/recursos",
          actionLabel: "Conhecer arquitetura",
        },
        {
          title: "Transparência e Rastreabilidade",
          description: "Cada etapa do processo seletivo gera registros auditáveis. Candidatos acompanham seu status em tempo real e têm autonomia para retirar candidaturas.",
          status: "Pilar Fundamental",
          href: "/candidatos",
          actionLabel: "Ver visão do candidato",
        },
        {
          title: "Critérios Técnicos Objetivos",
          description: "Foco nas competências reais e stack de desenvolvimento. Nosso motor de matching detalha afinidades sem decisões discriminatórias ou opacas.",
          status: "Pilar Fundamental",
          href: "/vagas",
          actionLabel: "Ver vagas disponíveis",
        },
        {
          title: "Governança e Verificação de Empresas",
          description: "Ambiente empresarial corporativo estruturado com verificação de CNPJ e moderação atômica para garantir vagas seguras e legítimas.",
          status: "Pilar Fundamental",
          href: "/empresas",
          actionLabel: "Ver visão da empresa",
        },
        {
          title: "Código Aberto e Engenharia Moderna",
          description: "Desenvolvido com Next.js 16, TypeScript, Supabase, Tailwind CSS e PostgreSQL 17, seguindo as melhores práticas da engenharia de software.",
          status: "Pilar Fundamental",
          href: "/recursos",
          actionLabel: "Ver tecnologias",
        },
        {
          title: "Experiência de Uso Acessível",
          description: "Interface com tema escuro imersivo, contraste em conformidade com WCAG 2.1 AA, navegação por teclado e semântica acessível para leitores de tela.",
          status: "Pilar Fundamental",
          href: "/vagas",
          actionLabel: "Experimentar plataforma",
        },
      ]}
    />
  );
}
