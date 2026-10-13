import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Para candidatos | TechLink" };

export default function CandidatesPage() {
  return <ProductPreviewPage eyebrow="Para talentos" title="Sua carreira em um só lugar." description="Uma visão inicial da área que reunirá perfil profissional, vagas recomendadas e o acompanhamento de cada candidatura." cta={{ label: "Criar conta de candidato", href: "/register" }} highlights={[{ title: "Perfil profissional", description: "Experiências, competências e projetos organizados para apresentar sua trajetória." }, { title: "Vagas recomendadas", description: "Descoberta orientada pelas habilidades e interesses que você escolher compartilhar." }, { title: "Acompanhamento claro", description: "Status da candidatura e próximos passos reunidos no seu painel." }]} />;
}
