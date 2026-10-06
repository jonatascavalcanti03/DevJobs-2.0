import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { ApplyButton } from "@/components/jobs/ApplyButton";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;

  // Validação preliminar do formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  // Consulta da vaga e dados de empresa associada
  const { data: job, error: jobError } = await supabase
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
      company_id,
      company_profiles (
        id,
        company_name,
        trading_name,
        website
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (jobError || !job) {
    notFound();
  }

  // Obter sessão e role do usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: "CANDIDATE" | "COMPANY" | "ADMIN" | null = null;
  let hasApplied = false;

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = (userData?.role as "CANDIDATE" | "COMPANY" | "ADMIN") || null;

    if (userRole === "CANDIDATE") {
      // Verificar se o candidato já se candidatou
      const { data: candidateProfile } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (candidateProfile) {
        const { data: existingApp } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", id)
          .eq("candidate_id", candidateProfile.id)
          .maybeSingle();

        if (existingApp) {
          hasApplied = true;
        }
      }
    }
  }

  // Type safe handling for company_profiles relation
  const companyProfile = Array.isArray(job.company_profiles)
    ? job.company_profiles[0]
    : job.company_profiles;
  const companyName = companyProfile?.trading_name || companyProfile?.company_name || "Empresa Confidencial";

  return (
    <>
      <Header />
      <main className="job-details-page" id="main-content">
        <div className="container">
          <div className="job-details-breadcrumb">
            <Link href="/vagas" className="job-breadcrumb-link">
              ← Voltar para todas as vagas
            </Link>
          </div>

          <div className="job-details-layout">
            <article className="job-details-main-content">
              <header className="job-details-header">
                <div className="job-details-badges">
                  {job.status === "ACTIVE" ? (
                    <span className="job-badge-recent">Vaga Aberta</span>
                  ) : (
                    <span className="job-badge-inactive">Vaga Inativa</span>
                  )}
                  {job.modality && <span className="job-meta-tag">{job.modality}</span>}
                  {job.level && <span className="job-meta-tag">{job.level}</span>}
                </div>

                <h1 className="job-details-title">{job.title}</h1>
                <div className="job-details-company-line">
                  <span className="job-details-company-name">{companyName}</span>
                  {job.location && (
                    <>
                      <span className="job-details-separator" aria-hidden="true">•</span>
                      <span className="job-details-location">{job.location}</span>
                    </>
                  )}
                </div>
              </header>

              <section className="job-details-body" aria-labelledby="job-description-heading">
                <h2 id="job-description-heading" className="job-details-section-title">
                  Descrição da Vaga
                </h2>
                <div className="job-details-description-text">
                  {job.description ? (
                    job.description.split("\n").map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p>Sem descrição detalhada disponível para esta vaga.</p>
                  )}
                </div>
              </section>
            </article>

            <aside className="job-details-sidebar" aria-label="Ações de candidatura">
              <div className="job-action-card">
                <h2 className="job-action-title">Candidatura</h2>
                <p className="job-action-desc">
                  Envie sua candidatura diretamente para a equipe de recrutamento desta vaga.
                </p>

                <ApplyButton
                  jobId={job.id}
                  isJobActive={job.status === "ACTIVE"}
                  userRole={userRole}
                  hasApplied={hasApplied}
                />

                <div className="job-action-meta">
                  <div className="job-meta-row">
                    <span className="job-meta-label">Publicada em:</span>
                    <span className="job-meta-value">
                      {new Date(job.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {job.modality && (
                    <div className="job-meta-row">
                      <span className="job-meta-label">Modalidade:</span>
                      <span className="job-meta-value">{job.modality}</span>
                    </div>
                  )}
                  {job.level && (
                    <div className="job-meta-row">
                      <span className="job-meta-label">Nível:</span>
                      <span className="job-meta-value">{job.level}</span>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <CtaFooterSection />
    </>
  );
}
