import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ApplicationItem {
  id: string;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    location: string | null;
    modality: string | null;
    level: string | null;
    company_profiles: {
      trading_name: string | null;
      company_name: string;
    } | {
      trading_name: string | null;
      company_name: string;
    }[] | null;
  } | {
    id: string;
    title: string;
    location: string | null;
    modality: string | null;
    level: string | null;
    company_profiles: {
      trading_name: string | null;
      company_name: string;
    } | {
      trading_name: string | null;
      company_name: string;
    }[] | null;
  }[] | null;
}

export default async function CandidateDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role || user.user_metadata?.role;

  if (role === "COMPANY") {
    redirect("/dashboard/empresa");
  }

  // Buscar perfil de candidato
  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let applications: ApplicationItem[] = [];

  if (candidateProfile) {
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
  }

  // Mapeamento semântico dos status existentes de application_status enum
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
        <p>Bem-vindo ao seu painel. Acompanhe suas candidaturas e oportunidades em tempo real.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Seu Perfil</h2>
          <p>O perfil profissional será gerenciado aqui nas próximas fases.</p>
          <div className="dashboard-empty-state">Funcionalidade futura</div>
        </div>

        <div className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <h2>Suas Candidaturas</h2>
            <span className="dashboard-badge-count">{applications.length}</span>
          </div>
          <p>Acompanhe o status das vagas às quais você se candidatou.</p>

          {applications.length === 0 ? (
            <div className="dashboard-empty-state-card">
              <p>Você ainda não se candidatou a nenhuma vaga.</p>
              <Link href="/vagas" className="btn btn-primary btn-sm mt-3" id="btn-explore-jobs-empty">
                Explorar vagas
              </Link>
            </div>
          ) : (
            <div className="dashboard-applications-list" role="list">
              {applications.map((app) => {
                const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                const companyProfile = job && (Array.isArray(job.company_profiles)
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
        </div>

        <div className="dashboard-card">
          <h2>Vagas Salvas</h2>
          <p>Sua lista de vagas marcadas para ver depois.</p>
          <div className="dashboard-empty-state">Nenhuma vaga salva</div>
        </div>
      </div>
    </div>
  );
}
