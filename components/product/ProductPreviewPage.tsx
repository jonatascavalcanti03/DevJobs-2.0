import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";

type ProductPreviewPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: { title: string; description: string }[];
  cta: { label: string; href: string };
  user?: { email?: string | null; role?: string | null } | null;
};

export function ProductPreviewPage({
  eyebrow,
  title,
  description,
  highlights,
  cta,
  user,
}: ProductPreviewPageProps) {
  return (
    <>
      <Header user={user} />
      <main className="product-preview" id="main-content">
        <section className="container product-preview-hero">
          <p className="section-tag">{eyebrow}</p>
          <h1 className="product-preview-title">{title}</h1>
          <p className="product-preview-description">{description}</p>
          <div className="product-preview-actions">
            <Link className="btn btn-primary" href={cta.href}>
              {cta.label}
            </Link>
            <Link className="btn btn-secondary" href="/vagas">
              Ver vagas abertas
            </Link>
          </div>
        </section>
        <section className="container product-preview-grid" aria-label="Recursos em prévia">
          {highlights.map((item, index) => (
            <article className="product-preview-card" key={item.title}>
              <span className="product-preview-index" aria-hidden="true">
                0{index + 1}
              </span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span className="product-preview-status">Em construção</span>
            </article>
          ))}
        </section>
      </main>
      <CtaFooterSection />
    </>
  );
}
