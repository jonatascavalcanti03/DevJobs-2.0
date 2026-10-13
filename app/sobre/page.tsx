import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Sobre | TechLink" };

export default function AboutPage() {
  return <ProductPreviewPage eyebrow="TechLink" title="Tecnologia para tornar o recrutamento mais humano." description="Estamos construindo uma plataforma para conectar talentos e empresas com transparência, privacidade e processos claros." cta={{ label: "Ver recursos", href: "/recursos" }} highlights={[{ title: "Privacidade por padrão", description: "Dados profissionais devem circular apenas dentro de contextos autorizados." }, { title: "Decisões rastreáveis", description: "Regras, operações críticas e evolução do produto são tratadas com governança." }, { title: "IA como apoio", description: "Análises e recomendações ajudam a decidir, sem substituir pessoas ou alterar dados silenciosamente." }]} />;
}
