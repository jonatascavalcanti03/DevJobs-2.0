import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CandidateProfileForm } from "@/components/candidate/CandidateProfileForm";
import { CandidateSubcomponents } from "@/components/candidate/CandidateSubcomponents";

interface ApplicationItem {
  id: string;
  status: string;
  created_at: string;
  jobs:
    | {
        id: string;
        title: string;
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
      }
    | {
        id: string;
        title: string;
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

  if (role === "COMPANY") {
    redirect("/dashboard/empresa");
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

  if (candidateProfile) {
    // 1. Candidaturas
    const { data: appData } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        jobs (
          id,
          title,
          location,
          modality,
          level,
          company_profiles (
            trading_name,
            company_name
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
  }

  const statusLabels: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: "Candidatura Enviada", className: "app-status-submitted" },
    SCREENING: { label: "Em Triagem", className: "app-status-screening" },
    INTERVIEW: { label: "Em Entrevista", className: "app-status-interview" },
    ADVANCING: { label: "Em Avanço", className: "app-status-advancing" },
    HIRED: { label: "Contratado", className: "app-status-hired" },
    REJECTED: { label: "Não Selecionado", className: "app-status-rejected" },
    WITHDRAWN: { label: "Desistência", className: "app-status-withdrawn" },
    CLOSED: { label: "Encerrada", className: "app-status-closed" },
  };

  return (
    <div className="container dashboard-content">
      <div className="dashboard-welcome">
        <h1>Olá, Candidato</h1>
        <p>Bem-vindo ao seu painel. Acompanhe suas candidaturas e construa seu perfil profissional técnico.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Seção 1: Perfil Básico e Subcomponentes (RF06) */}
        <section aria-labelledby="candidate-profile-heading" className="dashboard-card dashboard-card-wide">
          <h2 id="candidate-profile-heading">Perfil Profissional (RF06)</h2>
          <p>Organize suas informações básicas, experiências, formação, certificações e idiomas.</p>

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
            />
          </div>
        </section>

        {/* Seção 2: Acompanhamento de Candidaturas (RF29/RF33) */}
        <section aria-labelledby="candidate-apps-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <h2 id="candidate-apps-heading">Suas Candidaturas</h2>
            <span className="dashboard-badge-count">{applications.length}</span>
          </div>
          <p>Acompanhe em tempo real a evolução do processo seletivo em cada empresa.</p>

          {applications.length === 0 ? (
            <div className="dashboard-empty-state-card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
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
                const companyName = companyProfile?.trading_name || companyProfile?.company_name || "Empresa Confidencial";
                const statusInfo = statusLabels[app.status] || {
                  label: app.status,
                  className: "app-status-submitted",
                };

                return (
                  <div key={app.id} className="dashboard-app-item" role="listitem">
                    <div className="dashboard-app-main">
                      <h3 className="dashboard-app-title">
                        {job ? (
                          <Link href={`/vagas/${job.id}`} className="dashboard-app-link">
                            {job.title}
                          </Link>
                        ) : (
                          "Vaga Desconhecida"
                        )}
                      </h3>
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
                      <span className={`dashboard-app-status-badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <time className="dashboard-app-date" dateTime={app.created_at}>
                        {new Date(app.created_at).toLocaleDateString("pt-BR")}
                      </time>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
