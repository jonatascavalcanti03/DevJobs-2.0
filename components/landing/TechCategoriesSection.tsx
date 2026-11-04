import Link from "next/link";

interface TechCategory {
  title: string;
  tag: string;
  count: number;
  icon: string;
  description: string;
}

const CATEGORIES: TechCategory[] = [
  {
    title: "Full Stack & Web",
    tag: "Full Stack",
    count: 14,
    icon: "💻",
    description: "Next.js, React, Node.js, TypeScript e arquitetura web moderna.",
  },
  {
    title: "Backend & Microsserviços",
    tag: "Backend",
    count: 22,
    icon: "⚙️",
    description: "APIs de alta performance com Go, Java, Python, PostgreSQL e Kafka.",
  },
  {
    title: "DevOps & Cloud",
    tag: "DevOps",
    count: 12,
    icon: "☁️",
    description: "Kubernetes, Docker, Terraform, AWS e observabilidade contínua.",
  },
  {
    title: "Dados & Inteligência Artificial",
    tag: "Dados",
    count: 18,
    icon: "🧠",
    description: "Machine Learning, LLMs, pipelines analíticos e Data Warehouses.",
  },
  {
    title: "Mobile (iOS & Android)",
    tag: "Mobile",
    count: 9,
    icon: "📱",
    description: "Aplicações fluidas com React Native, Flutter, Swift e Kotlin.",
  },
  {
    title: "Design de Produto (UX/UI)",
    tag: "UX",
    count: 8,
    icon: "🎨",
    description: "Design Systems, prototipagem no Figma e pesquisa centrada no usuário.",
  },
];

export function TechCategoriesSection() {
  return (
    <section className="tech-categories-section" aria-labelledby="tech-categories-title">
      <div className="container">
        <div className="section-header-centered">
          <div className="section-badge">
            <span className="section-badge-dot" aria-hidden="true" />
            <span>Especialidades em Alta</span>
          </div>
          <h2 id="tech-categories-title" className="section-title">
            Explore vagas por <span className="gradient-text">Especialidade</span>
          </h2>
          <p className="section-subtitle">
            Encontre a oportunidade ideal de acordo com sua stack de preferência e momento de carreira.
          </p>
        </div>

        <div className="tech-categories-grid" role="list">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.tag}
              href={`/vagas?q=${encodeURIComponent(cat.tag)}`}
              className="tech-category-card"
              role="listitem"
            >
              <div className="tech-category-icon-box" aria-hidden="true">
                {cat.icon}
              </div>
              <div className="tech-category-content">
                <h3 className="tech-category-name">{cat.title}</h3>
                <p className="tech-category-desc">{cat.description}</p>
                <span className="tech-category-count">{cat.count}+ oportunidades</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

