import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Recursos | TechLink" };

export default function ResourcesPage() {
  return (
    <ProductPreviewPage
      eyebrow="Arquitetura & Recursos"
      title="Engenharia de software moderna a serviço do recrutamento."
      description="Conheça os recursos reais já desenvolvidos e operacionais no TechLink, construídos sob princípios de alta segurança, conformidade e transparência."
      cta={{ label: "Explorar vagas abertas", href: "/vagas" }}
      secondaryCta={{ label: "Criar uma conta", href: "/register" }}
      highlights={[
        {
          title: "Catálogo & Busca Multifacetada",
          description: "Pesquisa por palavras-chave, filtros refinados por tecnologia e localidade, com performance otimizada no servidor.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Abrir catálogo",
        },
        {
          title: "Matching Explicável de Competências",
          description: "Algoritmo determinístico que calcula percentual de compatibilidade e detalha competências coincidentes e pendentes.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Ver em ação",
        },
        {
          title: "Pipeline de Recrutamento Transacional",
          description: "Transições de status atômicas via PostgreSQL RPC, prevenindo corridas concorrentes e assegurando histórico de auditoria imutável.",
          status: "Disponível",
          href: "/login",
          actionLabel: "Entrar para gerenciar",
        },
        {
          title: "Armazenamento Seguro de Currículos",
          description: "Bucket Supabase Storage privado para arquivos PDF (até 5MB), com validação de MIME type e controle de acesso rigoroso via RLS.",
          status: "Disponível",
          href: "/register",
          actionLabel: "Cadastrar currículo",
        },
        {
          title: "Portal de Moderação Administrativa",
          description: "Painel exclusivo para administradores com ações de aprovação de empresas e moderação de conteúdo com registro de motivos.",
          status: "Disponível",
          href: "/admin",
          actionLabel: "Acessar administração",
        },
        {
          title: "Integração Externa com Agregadores",
          description: "Alimentação dinâmica de oportunidades via Adzuna com fallback resiliente que preserva a integridade do catálogo institucional.",
          status: "Disponível",
          href: "/vagas",
          actionLabel: "Ver catálogo integrado",
        },
      ]}
    />
  );
}
