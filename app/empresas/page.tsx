import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Para Empresas | TechLink" };

export default function CompaniesPage() {
  return (
    <ProductPreviewPage
      eyebrow="Para Empresas & Recrutadores"
      title="Contrate talentos técnicos com contexto, governança e agilidade."
      description="Gerencie publicações de vagas, visualize candidatos com índice de afinidade técnica e conduza processos seletivos através de um pipeline Kanban com rastreabilidade total."
      cta={{ label: "Cadastrar empresa", href: "/register" }}
      secondaryCta={{ label: "Acessar painel empresarial", href: "/login" }}
      highlights={[
        {
          title: "Publicação Estruturada de Vagas",
          description: "Crie e gerencie vagas com especificações claras de competências essenciais, faixa salarial, modalidade e benefícios corporativos.",
          status: "Disponível",
          href: "/register",
          actionLabel: "Publicar oportunidades",
        },
        {
          title: "Pipeline de Candidaturas (Kanban)",
          description: "Avance candidatos entre 8 etapas (Inscrição, Triagem, Entrevista, Oferta, etc.) com histórico de transição imutável (RF33).",
          status: "Disponível",
          href: "/login",
          actionLabel: "Gerenciar pipeline",
        },
        {
          title: "Gestão e Agendamento de Entrevistas",
          description: "Coordene etapas técnicas e entrevistas com candidatos, com registro de links de videoconferência, horários e feedback.",
          status: "Disponível",
          href: "/login",
          actionLabel: "Ver entrevistas",
        },
        {
          title: "Isolamento Multitenant Seguro",
          description: "Segurança garantida via Row Level Security (RLS) no PostgreSQL: cada empresa acessa estritamente seus próprios dados e candidatos.",
          status: "Disponível",
          href: "/register",
          actionLabel: "Criar conta corporativa",
        },
        {
          title: "Verificação e Governança de CNPJ",
          description: "Validação rigorosa de CNPJ e moderação administrativa para assegurar a autenticidade das oportunidades publicadas.",
          status: "Disponível",
          href: "/register",
          actionLabel: "Iniciar verificação",
        },
        {
          title: "Acesso a Currículos Protegidos",
          description: "Visualização de currículos em PDF armazenados em bucket privado, restritos apenas aos recrutadores responsáveis pela vaga.",
          status: "Disponível",
          href: "/login",
          actionLabel: "Acessar plataforma",
        },
      ]}
    />
  );
}
