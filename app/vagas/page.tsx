import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { JobFilters } from "@/components/jobs/JobFilters";

export const metadata = {
  title: "Catálogo de Vagas | TechLink",
  description: "Explore oportunidades abertas para desenvolvedores de software no TechLink.",
};

interface VagasIndexPageProps {
  searchParams: Promise<{
    q?: string;
    modality?: string;
    level?: string;
    location?: string;
  }>;
}

export default async function VagasIndexPage({ searchParams }: VagasIndexPageProps) {
  const { q, modality, level, location } = await searchParams;

  let jobs: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    location: string | null;
    modality: string | null;
    level: string | null;
    created_at: string;
    company_profiles:
      | {
          trading_name: string | null;
          company_name: string;
        }
      | {
          trading_name: string | null;
          company_name: string;
        }[]
      | null;
  }> = [];

  let fetchError: string | null = null;
  let currentUser: { email: string | null; role: string | null } | null = null;

  try {
    const supabase = await createClient();

    // Obter sessão atual de forma segura
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      currentUser = {
        email: user.email ?? null,
        role: userData?.role ?? null,
      };
    }

    // Consulta de vagas ativas com suporte aos filtros (RF20 e RF21)
    let query = supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        status,
        location,
        modality,
        level,
        created_at,
        company_profiles (
          company_name,
          trading_name
        )
      `)
      .eq("status", "ACTIVE");

    // Filtro por termo textual (RF20)
    if (q && q.trim().length > 0) {
      const cleanQ = q.trim();
      query = query.or(`title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`);
    }

    // Filtro por modalidade (RF21)
    if (modality && modality !== "ALL") {
      query = query.eq("modality", modality);
    }

    // Filtro por senioridade (RF21)
    if (level && level !== "ALL") {
      query = query.eq("level", level);
    }

    // Filtro por localização (RF21)
    if (location && location.trim().length > 0) {
      query = query.ilike("location", `%${location.trim()}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      fetchError = error.message;
    } else if (data) {
      jobs = data as unknown as typeof jobs;
    }
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : "Erro ao carregar vagas.";
  }

  const hasFiltersApplied = Boolean(q || (modality && modality !== "ALL") || (level && level !== "ALL") || location);

  return (
    <>
      <Header user={currentUser} />
      <main className="vagas-catalog-page" id="main-content">
        <div className="container">
          <header className="vagas-catalog-header">
            <span className="section-tag">Oportunidades Abertas</span>
            <h1 className="section-title">
              Catálogo de Vagas <span className="gradient-text">Tech</span>
            </h1>
            <p className="section-subtitle">
              Encontre sua próxima posição técnica em empresas inovadoras. Vagas 100% reais e validadas.
            </p>
          </header>

          {/* Barra de Busca e Filtros (RF20 e RF21) */}
          <JobFilters totalCount={jobs.length} />

          {fetchError && (
            <div className="vagas-error-notice" role="alert">
              Não foi possível carregar as vagas no momento. Tente novamente mais tarde.
            </div>
          )}

          {!fetchError && jobs.length === 0 && (
            <div className="vagas-empty-container">
              <div className="dashboard-empty-state" style={{ minHeight: "180px", flexDirection: "column", gap: "1rem" }}>
                <p>
                  {hasFiltersApplied
                    ? "Nenhuma vaga encontrada para os filtros selecionados."
                    : "Nenhuma vaga ativa encontrada no momento."}
                </p>
                {hasFiltersApplied && (
                  <Link href="/vagas" className="btn btn-secondary btn-sm">
                    Limpar filtros e ver todas as vagas
                  </Link>
                )}
              </div>
            </div>
          )}

          {!fetchError && jobs.length > 0 && (
            <div className="vagas-grid" role="list">
              {jobs.map((job) => {
                const companyProfile = Array.isArray(job.company_profiles)
                  ? job.company_profiles[0]
                  : job.company_profiles;
                const companyName = companyProfile?.trading_name || companyProfile?.company_name || "Empresa Confidencial";

                return (
                  <article key={job.id} className="job-card" role="listitem">
                    <div className="job-card-top">
                      <div className="job-card-badges">
                        <span className="job-badge-recent">Aberta</span>
                        {job.modality && <span className="job-meta-tag">{job.modality}</span>}
                        {job.level && <span className="job-meta-tag">{job.level}</span>}
                      </div>
                    </div>

                    <div>
                      <h2 className="job-title">{job.title}</h2>
                      <p className="job-company">{companyName}</p>

                      <div className="job-meta-list">
                        {job.location && (
                          <span className="job-meta-item">
                            📍 {job.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="job-card-bottom">
                      <span className="job-date">
                        {new Date(job.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <Link
                        href={`/vagas/${job.id}`}
                        className="job-view-link"
                        aria-label={`Ver detalhes da vaga ${job.title}`}
                      >
                        Ver detalhes →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <CtaFooterSection />
    </>
  );
}
