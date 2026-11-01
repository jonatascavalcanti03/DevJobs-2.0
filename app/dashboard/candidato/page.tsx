import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CandidateProfileForm } from "@/components/candidate/CandidateProfileForm";
import { CandidateSubcomponents } from "@/components/candidate/CandidateSubcomponents";
import { CandidateResumeManager } from "@/components/candidate/CandidateResumeManager";
import { WithdrawApplicationButton } from "@/components/candidate/WithdrawApplicationButton";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { calculateJobMatch } from "@/lib/matching/engine";
import { CandidateMatchingInput, MatchEvaluationResult } from "@/lib/matching/types";

interface ApplicationItem {
  id: string;
  status: string;
  created_at: string;
  jobs:
  | {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    modality: string | null;
    level: string | null;
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
    job_skills?: {
      skills: { name: string } | { name: string }[] | null;
    }[];
  }
  | {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    modality: string | null;
    level: string | null;
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
    job_skills?: {
      skills: { name: string } | { name: string }[] | null;
    }[];
  }[]
  | null;
}

export default async function CandidateDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    redirect("/login?error=account");
  }

  const role = userData.role;

  if (role !== "CANDIDATE") {
    redirect(role === "ADMIN" ? "/admin" : "/dashboard/empresa");
  }

  // Buscar perfil de candidato
  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("id, headline, short_summary, location")
    .eq("user_id", user.id)
    .maybeSingle();

  let applications: ApplicationItem[] = [];
  let experiences: Array<{
    id: string;
    company_name: string;
    title: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
  }> = [];
  let educations: Array<{
    id: string;
    institution: string;
    degree: string;
    field_of_study: string | null;
    start_date: string;
    end_date: string | null;
  }> = [];
  let certifications: Array<{
    id: string;
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date: string | null;
  }> = [];
  let languages: Array<{
    id: string;
    language_name: string;
    proficiency_level: string;
  }> = [];
  let resumes: Array<{
    id: string;
    file_name: string;
    is_primary: boolean;
    created_at: string;
  }> = [];
  let candidateSkills: Array<{
    id: string;
    name: string;
  }> = [];
  let candidateProjects: Array<{
    id: string;
    name: string;
    description: string | null;
    url: string | null;
  }> = [];

  const appMatchMap = new Map<string, MatchEvaluationResult>();

  if (candidateProfile) {
    // 0. Currículos (RF06)
    const { data: resumeData } = await supabase
      .from("resumes")
      .select("id, file_name, is_primary, created_at")
      .eq("candidate_id", candidateProfile.id)
      .order("created_at", { ascending: false });
    if (resumeData) resumes = resumeData;

    // 1. Candidaturas com detalhes das vagas e competências requeridas
    const { data: appData } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        jobs (
          id,
          title,
          description,
          location,
          modality,
          level,
          company_profiles (
            trading_name,
            company_name
          ),
          job_skills (
            skills (
              name
            )
          )
        )
      `)
      .eq("candidate_id", candidateProfile.id)
      .order("created_at", { ascending: false });

    if (appData) {
      applications = appData as unknown as ApplicationItem[];
    }

    // 2. Experiências (RF06)
    const { data: expData } = await supabase
      .from("experiences")
      .select("id, company_name, title, start_date, end_date, description")
      .eq("candidate_id", candidateProfile.id)
      .order("start_date", { ascending: false });
    if (expData) experiences = expData;

    // 3. Formações (RF06)
    const { data: eduData } = await supabase
      .from("educations")
      .select("id, institution, degree, field_of_study, start_date, end_date")
      .eq("candidate_id", candidateProfile.id)
      .order("start_date", { ascending: false });
    if (eduData) educations = eduData;

    // 4. Certificações (RF06)
    const { data: certData } = await supabase
      .from("certifications")
      .select("id, name, issuing_organization, issue_date, expiration_date")
      .eq("candidate_id", candidateProfile.id)
      .order("issue_date", { ascending: false });
    if (certData) certifications = certData;

    // 5. Idiomas (RF06)
    const { data: langData } = await supabase
      .from("languages")
      .select("id, language_name, proficiency_level")
      .eq("candidate_id", candidateProfile.id);
    if (langData) languages = langData;

    // 6. Competências (RF06)
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

    if (skillsData) {
      candidateSkills = skillsData
        .map((item) => {
          const s = Array.isArray(item.skills) ? item.skills[0] : item.skills;
          return s ? { id: item.skill_id, name: s.name } : null;
        })
        .filter(Boolean) as Array<{ id: string; name: string }>;
    }

    // 7. Projetos Profissionais (RF06)
    const { data: projectsData } = await supabase
      .from("projects")
      .select("id, name, description, url")
      .eq("candidate_id", candidateProfile.id)
      .order("created_at", { ascending: false });

    if (projectsData) {
      candidateProjects = projectsData;
    }

    // 8. Cálculo de matching determinístico para as vagas das candidaturas
    const candidateMatchingInput: CandidateMatchingInput = {
      skills: candidateSkills.map((s) => s.name),
      location: candidateProfile.location,
      headline: candidateProfile.headline,
      experiences: experiences.map((exp) => ({
        title: exp.title,
        start_date: exp.start_date,
        end_date: exp.end_date,
      })),
    };

    for (const app of applications) {
      const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
      if (job) {
        const jobSkills = (job.job_skills || [])
          .map((js) => {
            const s = Array.isArray(js.skills) ? js.skills[0] : js.skills;
            return s?.name;
          })
          .filter((name): name is string => typeof name === "string" && name.length > 0);

        const matchResult = calculateJobMatch(candidateMatchingInput, {
          id: job.id,
          title: job.title,
          description: job.description,
          skills: jobSkills,
          level: job.level,
          modality: job.modality,
          location: job.location,
        });
        appMatchMap.set(app.id, matchResult);
      }
    }
  }

  // Métricas reais de candidaturas
  const totalApps = applications.length;
  const activeApps = applications.filter((app) =>
    ["SUBMITTED", "SCREENING", "INTERVIEW", "ADVANCING"].includes(app.status)
  ).length;
  const interviewApps = applications.filter((app) => app.status === "INTERVIEW").length;
  const hiredApps = applications.filter((app) => app.status === "HIRED").length;

  const statusLabels: Record<string, { label: string; className: string; variant: "neutral" | "tech" | "accent" | "warning" | "success" | "error" }> = {
    SUBMITTED: { label: "Inscrito", className: "app-status-submitted", variant: "tech" },
    SCREENING: { label: "Em Triagem", className: "app-status-screening", variant: "accent" },
    INTERVIEW: { label: "Em Entrevista", className: "app-status-interview", variant: "warning" },
    ADVANCING: { label: "Em Avanço", className: "app-status-advancing", variant: "accent" },
    HIRED: { label: "Contratado", className: "app-status-hired", variant: "success" },
    REJECTED: { label: "Não Selecionado", className: "app-status-rejected", variant: "error" },
    WITHDRAWN: { label: "Desistência", className: "app-status-withdrawn", variant: "neutral" },
    CLOSED: { label: "Encerrada", className: "app-status-closed", variant: "neutral" },
  };

  const candidateDisplayName = candidateProfile?.headline || "Desenvolvedor Tech";

  return (
    <div className="container dashboard-content">
      {/* 1. Saudação e Resumo do Perfil */}
      <div className="dashboard-premium-welcome">
        <div className="dashboard-welcome-info">
          <span className="section-tag">Painel do Candidato</span>
          <h1>Olá, {candidateDisplayName}</h1>
          <p>
            {candidateProfile?.location ? `📍 ${candidateProfile.location} · ` : ""}
            Acompanhe suas candidaturas e mantenha seu perfil técnico atualizado.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <Link href="/vagas" className="btn btn-primary btn-sm" id="btn-explore-jobs-header">
            🔍 Explorar Vagas
          </Link>
          <a href="#perfil-tecnico" className="btn btn-secondary btn-sm">
            ⚙️ Editar Perfil
          </a>
        </div>
      </div>

      {/* 2. Indicadores Reais (StatCards) */}
      <div className="dashboard-stats-grid" role="region" aria-label="Métricas de Candidaturas">
        <StatCard
          title="Total de Candidaturas"
          value={totalApps}
          subtitle="Histórico de submissões"
          variant="indigo"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatCard
          title="Candidaturas Ativas"
          value={activeApps}
          subtitle="Em processo de avaliação"
          variant="cyan"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          title="Em Entrevista"
          value={interviewApps}
          subtitle="Conversas agendadas"
          variant="amber"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          title="Contratações"
          value={hiredApps}
          subtitle="Processos concluídos com sucesso"
          variant="emerald"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
      </div>

      {/* 3. Banner de Atalho para Explorar e Matching */}
      <div className="dashboard-quick-actions-banner">
        <div className="quick-actions-text">
          <h3>Descubra Oportunidades Alinhadas ao seu Perfil</h3>
          <p>
            {candidateSkills.length > 0
              ? `Com base nas suas ${candidateSkills.length} competências cadastradas, explore vagas com afinidade calculada em tempo real.`
              : "Cadastre suas competências técnicas para calcular seu score de afinidade com as vagas abertas."}
          </p>
        </div>
        <Link href="/vagas" className="btn btn-primary btn-sm">
          Acessar Catálogo de Vagas →
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Seção: Acompanhamento de Candidaturas (RF29/RF33) */}
        <section aria-labelledby="candidate-apps-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="candidate-apps-heading">Suas Candidaturas</h2>
              <p style={{ margin: 0 }}>Acompanhe em tempo real a evolução do processo seletivo em cada empresa.</p>
            </div>
            <span className="dashboard-badge-count">{applications.length}</span>
          </div>

          {applications.length === 0 ? (
            <div className="dashboard-empty-state-card">
              <p>Você ainda não se candidatou a nenhuma vaga.</p>
              <Link href="/vagas" className="btn btn-primary btn-sm mt-3" id="btn-explore-jobs-empty">
                Explorar catálogo de vagas
              </Link>
            </div>
          ) : (
            <div className="dashboard-applications-list" role="list">
              {applications.map((app) => {
                const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                const companyProfile =
                  job &&
                  (Array.isArray(job.company_profiles)
                    ? job.company_profiles[0]
                    : job.company_profiles);
                const companyName =
                  companyProfile?.trading_name || companyProfile?.company_name || "Empresa Confidencial";
                const statusInfo = statusLabels[app.status] || {
                  label: app.status,
                  className: "app-status-submitted",
                  variant: "neutral",
                };
                const matchResult = appMatchMap.get(app.id);

                return (
                  <div key={app.id} className="dashboard-app-item" role="listitem">
                    <div className="dashboard-app-main">
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <h3 className="dashboard-app-title">
                          {job ? (
                            <Link href={`/vagas/${job.id}`} className="dashboard-app-link">
                              {job.title}
                            </Link>
                          ) : (
                            "Vaga Desconhecida"
                          )}
                        </h3>
                        {matchResult && (
                          <span
                            className="dashboard-app-match-badge"
                            title={`Afinidade calculada: ${matchResult.score}% (${matchResult.summaryExplanation})`}
                          >
                            🎯 {matchResult.score}% match
                          </span>
                        )}
                      </div>

                      <p className="dashboard-app-company">{companyName}</p>

                      <div className="dashboard-app-meta">
                        {job?.modality && <span>{job.modality}</span>}
                        {job?.level && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>{job.level}</span>
                          </>
                        )}
                        {job?.location && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>{job.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="dashboard-app-status-col">
                      <Badge variant={statusInfo.variant} size="sm">
                        {statusInfo.label}
                      </Badge>
                      <time className="dashboard-app-date" dateTime={app.created_at}>
                        {new Date(app.created_at).toLocaleDateString("pt-BR")}
                      </time>
                      <WithdrawApplicationButton
                        applicationId={app.id}
                        currentStatus={app.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Seção: Perfil Profissional e Subcomponentes (RF06) */}
        <section id="perfil-tecnico" aria-labelledby="candidate-profile-heading" className="dashboard-card dashboard-card-wide">
          <h2 id="candidate-profile-heading">Perfil Profissional & Competências (RF06)</h2>
          <p>Organize suas informações básicas, competências, projetos, experiências, formação, certificações e idiomas.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>
            <CandidateProfileForm
              initialProfile={
                candidateProfile
                  ? {
                    headline: candidateProfile.headline,
                    location: candidateProfile.location,
                    shortSummary: candidateProfile.short_summary,
                  }
                  : null
              }
            />

            <CandidateSubcomponents
              experiences={experiences}
              educations={educations}
              certifications={certifications}
              languages={languages}
              skills={candidateSkills}
              projects={candidateProjects}
            />

            <CandidateResumeManager resumes={resumes} />
          </div>
        </section>
      </div>
    </div>
  );
}
