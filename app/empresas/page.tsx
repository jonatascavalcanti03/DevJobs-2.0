import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Para empresas | TechLink" };

export default function CompaniesPage() {
  return <ProductPreviewPage eyebrow="Para empresas" title="Contrate com mais contexto e menos ruído." description="Prévia da área empresarial: vagas, candidatos e pipeline em um ambiente com papéis e dados protegidos." cta={{ label: "Conhecer a plataforma", href: "/sobre" }} highlights={[{ title: "Publicação de vagas", description: "Crie oportunidades e mantenha o ciclo de vida de cada posição visível para sua equipe." }, { title: "Pipeline seletivo", description: "Acompanhe candidatos por etapa, com histórico das transições importantes." }, { title: "Colaboração segura", description: "Papéis de proprietário, administrador e membro definidos por empresa." }]} />;
}
