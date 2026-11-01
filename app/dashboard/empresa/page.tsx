import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { CompanyNewJobForm } from "@/components/company/CompanyNewJobForm";
import { CompanyJobsList, type CompanyJobItem } from "@/components/company/CompanyJobsList";
import { CompanyPipelineKanban, type ApplicationStageHistoryItem, type CompanyApplicationItem } from "@/components/company/CompanyPipelineKanban";
import { CompanyInterviewManager, type CompanyInterviewItem } from "@/components/company/CompanyInterviewManager";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";

export default async function CompanyDashboard() {
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

  if (userData.role !== "COMPANY") {
    redirect(userData.role === "ADMIN" ? "/admin" : "/dashboard/candidato");
  }

  // Obter associação corporativa (respeita o primeiro vínculo ativo de gestão)
  const { data: memberships } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id);

  const membership = memberships?.find((m) => ["OWNER", "ADMIN"].includes(m.role)) || memberships?.[0];

  let companyProfile: {
    id: string;
    company_name: string;
    trading_name: string | null;
    cnpj: string;
    website: string | null;
    description: string | null;
    verification_status: string;
  } | null = null;

  let companyJobs: CompanyJobItem[] = [];
  let applications: CompanyApplicationItem[] = [];
  let applicationHistory: ApplicationStageHistoryItem[] = [];
  let interviews: CompanyInterviewItem[] = [];

  if (membership?.company_id) {
    // 1. Dados da empresa (RF15)
    const { data: profile } = await supabase
      .from("company_profiles")
      .select("id, company_name, trading_name, cnpj, website, description, verification_status")
      .eq("id", membership.company_id)
      .maybeSingle();

    if (profile) {
      companyProfile = profile;
    }

    // 2. Vagas publicadas pela empresa (RF17 e RF18)
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title, description, status, modality, level, location, created_at")
      .eq("company_id", membership.company_id)
      .order("created_at", { ascending: false });

    if (jobsData) {
      companyJobs = jobsData;
    }

    // 3. Candidaturas para as vagas da empresa (RF33)
    const { data: appsData } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        candidate_profiles (
          headline,
          location,
          short_summary
        ),
        jobs!inner (
          id,
          title,
          company_id
        )
      `)
      .eq("jobs.company_id", membership.company_id)
      .order("created_at", { ascending: false });

    if (appsData) {
      applications = appsData as unknown as CompanyApplicationItem[];

      if (applications.length > 0) {
        const { data: historyData } = await supabase
          .from("application_stage_history")
          .select("id, application_id, previous_status, new_status, changed_by, created_at")
          .in("application_id", applications.map((application) => application.id))
          .order("created_at", { ascending: false });

        if (historyData) applicationHistory = historyData;

        // 4. Entrevistas das candidaturas da empresa (RF36)
        const { data: interviewData } = await supabase
          .from("interviews")
          .select(`
            id,
            application_id,
            scheduled_at,
            duration_minutes,
            status,
            meeting_link,
            applications!inner (
              id,
              candidate_profiles (
                headline
              ),
              jobs (
                title
              )
            )
          `)
          .in("application_id", applications.map((app) => app.id))
          .order("scheduled_at", { ascending: true });

        if (interviewData) {
          interviews = interviewData as unknown as CompanyInterviewItem[];
        }
      }
    }
  }

  // Métricas do Processo Seletivo (Cálculos sobre dados reais)
  const totalJobs = companyJobs.length;
  const activeJobs = companyJobs.filter((j) => j.status === "ACTIVE").length;
  const totalApplicants = applications.length;
  const activePipelineCandidates = applications.filter((app) =>
    ["SUBMITTED", "SCREENING", "INTERVIEW", "ADVANCING"].includes(app.status)
  ).length;

  const companyDisplayName = companyProfile?.trading_name || companyProfile?.company_name || "Empresa Parceira";
  const isApproved = companyProfile?.verification_status === "APPROVED";

  return (
    <div className="container dashboard-content">
      {/* 1. Header do Painel com Status e Ações */}
      <div className="dashboard-premium-welcome">
        <div className="dashboard-welcome-info">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
            <span className="section-tag">Painel Corporativo</span>
            {companyProfile && (
              <Badge variant={isApproved ? "success" : "warning"} size="sm" dot={isApproved}>
                {isApproved ? "Empresa Verificada" : "Verificação Pendente (RF16)"}
              </Badge>
            )}
          </div>
          <h1>Olá, {companyDisplayName}</h1>
          <p>
            {membership?.role ? `Papel: ${membership.role} · ` : ""}
            Gerencie suas oportunidades técnicas, avance candidatos nas 8 etapas oficiais e acompanhe entrevistas.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <CompanyNewJobForm />
          <Link href="/vagas" className="btn btn-secondary btn-sm">
            Ver Catálogo Público
          </Link>
        </div>
      </div>

      {/* 2. Indicadores Reais do Processo Seletivo (StatCards) */}
      <div className="dashboard-stats-grid" role="region" aria-label="Métricas da Empresa">
        <StatCard
          title="Vagas Ativas"
          value={activeJobs}
          subtitle={`${totalJobs} vaga(s) no total`}
          variant="cyan"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />
        <StatCard
          title="Total de Candidaturas"
          value={totalApplicants}
          subtitle="Recebidas em todas as vagas"
          variant="indigo"
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
          title="Pipeline Ativo"
          value={activePipelineCandidates}
          subtitle="Candidatos em avaliação"
          variant="amber"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
        />
        <StatCard
          title="Entrevistas Técnicas"
          value={interviews.length}
          subtitle="Agendadas ou realizadas"
          variant="emerald"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Seção 1: Gestão de Vagas (RF17 e RF18) */}
        <section aria-labelledby="company-jobs-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="company-jobs-heading">Vagas Publicadas ({companyJobs.length})</h2>
              <p style={{ margin: 0 }}>Crie, pause, edite ou encerre oportunidades técnicas no catálogo.</p>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-4)" }}>
            <CompanyJobsList jobs={companyJobs} />
          </div>
        </section>

        {/* Seção 2: Pipeline Seletivo Kanban com as 8 Etapas Oficiais (RF33) */}
        <section aria-labelledby="company-pipeline-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="company-pipeline-heading">Pipeline Seletivo ({applications.length} candidaturas)</h2>
              <p style={{ margin: 0 }}>
                Movimente candidatos pelas 8 etapas com histórico auditável e bloqueio de concorrência.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-4)" }}>
            <CompanyPipelineKanban applications={applications} history={applicationHistory} />
          </div>
        </section>

        {/* Seção 3: Gestão de Entrevistas Técnicas (RF36) */}
        <section aria-labelledby="company-interviews-heading" className="dashboard-card dashboard-card-wide">
          <CompanyInterviewManager
            interviews={interviews}
            applications={applications}
          />
        </section>

        {/* Seção 4: Perfil da Empresa (RF15) */}
        {companyProfile && (
          <section aria-labelledby="company-profile-heading" className="dashboard-card" style={{ maxWidth: "680px" }}>
            <h2 id="company-profile-heading">Perfil da Empresa (RF15)</h2>
            <p>Atualize a apresentação e presença institucional da sua marca técnica.</p>
            <CompanyProfileForm initialProfile={companyProfile} />
          </section>
        )}
      </div>
    </div>
  );
}
