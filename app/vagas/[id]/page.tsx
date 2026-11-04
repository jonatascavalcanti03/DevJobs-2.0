import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { Badge } from "@/components/ui/Badge";
import { JobMatchPanel } from "@/components/jobs/JobMatchPanel";
import { calculateJobMatch } from "@/lib/matching/engine";
import { CandidateMatchingInput, MatchEvaluationResult } from "@/lib/matching/types";
import { getDemoJobById } from "@/lib/jobs/demo-catalog";

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

  // Consulta da vaga, dados de empresa e competências associadas
  const { data: rawJob } = await supabase
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
      ),
      job_skills (
        skills (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  // Se não encontrar no banco de dados, busca no catálogo demonstrativo
  const demoJob = !rawJob ? getDemoJobById(id) : null;

  if (!rawJob && !demoJob) {
    notFound();
  }

  // Obter sessão e role do usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: "CANDIDATE" | "COMPANY" | "ADMIN" | null = null;
  let hasApplied = false;
  let matchResult: MatchEvaluationResult | null = null;

  // Unifica estrutura de job
  const job = rawJob || {
    id: demoJob!.id,
    title: demoJob!.title,
    description: demoJob!.description,
    status: demoJob!.status,
    location: demoJob!.location,
    modality: demoJob!.modality,
    level: demoJob!.level,
    created_at: demoJob!.created_at,
    company_id: "demo-company-id",
    company_profiles: {
      id: "demo-company-id",
      company_name: demoJob!.companyName,
      trading_name: demoJob!.companyTradingName,
      website: "https://example.com",
    },
  };

  const jobSkills: string[] = rawJob
    ? (rawJob.job_skills || [])
        .map((js: { skills: { id: string; name: string } | { id: string; name: string }[] | null }) => {
          const s = Array.isArray(js.skills) ? js.skills[0] : js.skills;
          return s?.name;
        })
        .filter((name): name is string => typeof name === "string" && name.length > 0)
    : demoJob!.skills;

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    userRole = (userData?.role as "CANDIDATE" | "COMPANY" | "ADMIN") || null;

    if (userRole === "CANDIDATE") {
      const { data: candidateProfile } = await supabase
        .from("candidate_profiles")
        .select("id, headline, location")
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

        const { data: skillsData } = await supabase
          .from("candidate_skills")
          .select(`
            skills (
              name
            )
          `)
          .eq("candidate_id", candidateProfile.id);

        const candidateSkillsList = (skillsData || [])
          .map((cs: { skills: { name: string } | { name: string }[] | null }) => {
            const s = Array.isArray(cs.skills) ? cs.skills[0] : cs.skills;
            return s?.name;
          })
          .filter((name): name is string => typeof name === "string" && name.length > 0);

        const candidateInput: CandidateMatchingInput = {
          headline: candidateProfile.headline,
          location: candidateProfile.location,
          skills: candidateSkillsList,
        };

        matchResult = calculateJobMatch(candidateInput, {
          id: job.id,
          title: job.title,
          description: job.description,
          skills: jobSkills,
          level: job.level,
          modality: job.modality,
          location: job.location,
        });
      }
    }
  }

  const cp = Array.isArray(job.company_profiles) ? job.company_profiles[0] : job.company_profiles;
  const companyName = cp?.trading_name || cp?.company_name || "Empresa Confidencial";
  const formattedDate = new Date(job.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Header user={user ? { email: user.email ?? null, role: userRole } : null} />

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
                    <Badge variant="success" size="sm" dot>
                      Vaga Aberta
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Vaga Inativa
                    </Badge>
                  )}
                  {job.modality && (
                    <Badge variant="modality" size="sm">
                      {job.modality}
                    </Badge>
                  )}
                  {job.level && (
                    <Badge variant="level" size="sm">
                      {job.level}
                    </Badge>
                  )}
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

              {userRole === "CANDIDATE" && matchResult && (
                <JobMatchPanel matchResult={matchResult} />
              )}

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

              {demoJob && demoJob.responsibilities && (
                <section className="job-details-body" aria-labelledby="job-resp-heading">
                  <h2 id="job-resp-heading" className="job-details-section-title">
                    Principais Responsabilidades
                  </h2>
                  <ul className="job-details-bullet-list">
                    {demoJob.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </section>
              )}

              {demoJob && demoJob.requirements && (
                <section className="job-details-body" aria-labelledby="job-req-heading">
                  <h2 id="job-req-heading" className="job-details-section-title">
                    Requisitos e Diferenciais
                  </h2>
                  <ul className="job-details-bullet-list">
                    {demoJob.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}

              {jobSkills.length > 0 && (
                <section className="job-details-skills-section" aria-labelledby="job-skills-heading">
                  <h2 id="job-skills-heading" className="job-details-section-title">
                    Competências Técnicas Solicitadas
                  </h2>
                  <div className="job-details-skills-list" data-testid="job-skills-list">
                    {jobSkills.map((skill) => (
                      <Badge key={skill} variant="tech" size="md">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </article>

            <aside className="job-details-sidebar" aria-label="Ações e Resumo da Oportunidade">
              <div className="job-sidebar-card">
                <h3 className="job-sidebar-title">Candidatura</h3>
                <div className="job-sidebar-actions">
                  <ApplyButton
                    jobId={job.id}
                    userRole={userRole}
                    hasApplied={hasApplied}
                    isJobActive={job.status === "ACTIVE"}
                  />
                </div>

                <hr className="job-sidebar-divider" />

                <div className="job-summary-list">
                  <div className="job-summary-item">
                    <span className="job-summary-label">Publicação</span>
                    <span className="job-summary-value">{formattedDate}</span>
                  </div>
                  <div className="job-summary-item">
                    <span className="job-summary-label">Modalidade</span>
                    <span className="job-summary-value">{job.modality || "Não especificada"}</span>
                  </div>
                  <div className="job-summary-item">
                    <span className="job-summary-label">Nível de Experiência</span>
                    <span className="job-summary-value">{job.level || "Não especificado"}</span>
                  </div>
                  {demoJob?.salaryRange && (
                    <div className="job-summary-item">
                      <span className="job-summary-label">Faixa Salarial</span>
                      <span className="job-summary-value" style={{ color: "var(--color-primary-base, #10b981)", fontWeight: 600 }}>
                        {demoJob.salaryRange}
                      </span>
                    </div>
                  )}
                  {demoJob?.contractType && (
                    <div className="job-summary-item">
                      <span className="job-summary-label">Tipo de Contrato</span>
                      <span className="job-summary-value">{demoJob.contractType}</span>
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
