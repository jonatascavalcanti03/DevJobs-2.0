import { ProductPreviewPage } from "@/components/product/ProductPreviewPage";

export const metadata = { title: "Recursos | TechLink" };

export default function ResourcesPage() {
  return <ProductPreviewPage eyebrow="Produto" title="Recrutamento que conecta dados e pessoas." description="Os recursos abaixo mostram a direção do produto. Cada um será liberado por etapas, com regras e segurança validadas." cta={{ label: "Explorar vagas", href: "/vagas" }} highlights={[{ title: "Busca inteligente", description: "Busca tradicional, filtros e linguagem natural para encontrar vagas relevantes." }, { title: "Matching explicável", description: "Indicadores de compatibilidade com explicações claras, sem promessas de contratação." }, { title: "Processos rastreáveis", description: "Candidaturas, entrevistas, comunicação e auditoria preparados para evoluir juntos." }]} />;
}
