import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";

export type HighlightItem = {
  title: string;
  description: string;
  status?: string;
  href?: string;
  actionLabel?: string;
};

type ProductPreviewPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: HighlightItem[];
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  user?: { email?: string | null; role?: string | null } | null;
};

export function ProductPreviewPage({
  eyebrow,
  title,
  description,
  highlights,
  cta,
  secondaryCta = { label: "Explorar vagas", href: "/vagas" },
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
            <Link className="btn btn-secondary" href={secondaryCta.href}>
              {secondaryCta.label}
            </Link>
          </div>
        </section>
        <section className="container product-preview-grid" aria-label="Recursos e funcionalidades">
          {highlights.map((item, index) => (
            <article className="product-preview-card" key={item.title}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "auto" }}>
                <span className="product-preview-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="product-preview-status" style={{ marginTop: 0 }}>
                  {item.status || "Disponível"}
                </span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              {item.href && item.actionLabel && (
                <Link
                  href={item.href}
                  className="btn btn-ghost"
                  style={{
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.8125rem",
                    marginTop: "var(--space-4)",
                    color: "var(--color-electric-blue)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: "var(--radius-sm)"
                  }}
                >
                  {item.actionLabel} &rarr;
                </Link>
              )}
            </article>
          ))}
        </section>
      </main>
      <CtaFooterSection />
    </>
  );
}
