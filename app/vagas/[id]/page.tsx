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

  if (jobError || !job) {
    notFound();
  }

  // Obter sessão e role do usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: "CANDIDATE" | "COMPANY" | "ADMIN" | null = null;
  let hasApplied = false;
  let matchResult: MatchEvaluationResult | null = null;

  // Tratamento seguro de competências da vaga
  const jobSkills: string[] = (job.job_skills || [])
    .map((js: { skills: { id: string; name: string } | { id: string; name: string }[] | null }) => {
      const s = Array.isArray(js.skills) ? js.skills[0] : js.skills;
      return s?.name;
    })
    .filter((name): name is string => typeof name === "string" && name.length > 0);

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    userRole = (userData?.role as "CANDIDATE" | "COMPANY" | "ADMIN") || null;

    if (userRole === "CANDIDATE") {
      // Carregar perfil do candidato
      const { data: candidateProfile } = await supabase
        .from("candidate_profiles")
        .select("id, headline, location")
        .eq("user_id", user.id)
        .maybeSingle();

      if (candidateProfile) {
        // Verificar se o candidato já se candidatou
        const { data: existingApp } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", id)
          .eq("candidate_id", candidateProfile.id)
          .maybeSingle();

        if (existingApp) {
          hasApplied = true;
        }

        // Carregar competências do candidato para a engine determinística
        const { data: skillsData } = await supabase
          .from("candidate_skills")
          .select(`
            skill_id,
            skills (
              id,
              name
            )
          `)
          .eq("candidate_id", candidateProfile.id);

        const candidateSkills = (skillsData || [])
          .map((item) => {
            const s = Array.isArray(item.skills) ? item.skills[0] : item.skills;
            return s?.name;
          })
          .filter((name): name is string => typeof name === "string" && name.length > 0);

        // Carregar experiências para cálculo e inferência de senioridade
        const { data: expData } = await supabase
          .from("experiences")
          .select("title, start_date, end_date")
          .eq("candidate_id", candidateProfile.id);

        const candidateMatchingData: CandidateMatchingInput = {
          skills: candidateSkills,
          location: candidateProfile.location,
          headline: candidateProfile.headline,
          experiences: (expData || []).map((exp) => ({
            title: exp.title,
            start_date: exp.start_date,
            end_date: exp.end_date,
          })),
        };

        // Executar engine determinística oficial
        matchResult = calculateJobMatch(candidateMatchingData, {
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

  // Type safe handling for company_profiles relation
  const companyProfile = Array.isArray(job.company_profiles)
    ? job.company_profiles[0]
    : job.company_profiles;
  const companyName =
    companyProfile?.trading_name || companyProfile?.company_name || "Empresa Confidencial";

  return (
    <>
      <Header user={user ? { email: user.email, role: userRole } : null} />
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

              {/* Painel de Matching Explicável (Apenas para Candidatos Autenticados) */}
              {userRole === "CANDIDATE" && matchResult && (
                <JobMatchPanel matchResult={matchResult} />
              )}

              {/* Descrição Completa da Vaga */}
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

              {/* Competências Técnicas Exigidas */}
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

              {/* Informações da Empresa */}
              {companyProfile && (
                <section className="job-details-company-section" aria-labelledby="job-company-heading">
                  <h2 id="job-company-heading" className="job-details-section-title">
                    Sobre a Empresa Contratante
                  </h2>
                  <div className="job-details-company-info-card">
                    <div className="company-info-row">
                      <span className="company-info-label">Nome:</span>
                      <span className="company-info-val">
                        {companyProfile.trading_name || companyProfile.company_name}
                      </span>
                    </div>
                    {companyProfile.website && (
                      <div className="company-info-row">
                        <span className="company-info-label">Website:</span>
                        <a
                          href={
                            companyProfile.website.startsWith("http")
                              ? companyProfile.website
                              : `https://${companyProfile.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="company-info-val text-electric-blue"
                        >
                          {companyProfile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar com Ações de Candidatura */}
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
                  {job.location && (
                    <div className="job-meta-row">
                      <span className="job-meta-label">Localização:</span>
                      <span className="job-meta-value">{job.location}</span>
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
