import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { CompanyNewJobForm } from "@/components/company/CompanyNewJobForm";
import { CompanyJobsList, type CompanyJobItem } from "@/components/company/CompanyJobsList";
import { CompanyPipelineKanban, type CompanyApplicationItem } from "@/components/company/CompanyPipelineKanban";

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

  if (userData.role === "CANDIDATE") {
    redirect("/dashboard/candidato");
  }

  // Obter associação corporativa
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

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
      .select("id, title, status, modality, level, location, created_at")
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
    }
  }

  const companyDisplayName = companyProfile?.trading_name || companyProfile?.company_name || "Empresa Parceira";

  return (
    <div className="container dashboard-content">
      <div className="dashboard-welcome" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1>Olá, {companyDisplayName}</h1>
          <p>Gerencie as vagas abertas, acompanhe candidatos no pipeline e edite o perfil da empresa.</p>
        </div>

        {companyProfile && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span
              style={{
                fontSize: "0.8125rem",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: companyProfile.verification_status === "APPROVED" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                color: companyProfile.verification_status === "APPROVED" ? "#6EE7B7" : "#FCD34D",
                border: "1px solid currentColor",
              }}
            >
              {companyProfile.verification_status === "APPROVED" ? "Empresa Verificada" : "Verificação Pendente (RF16)"}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Seção 1: Gestão de Vagas (RF17 e RF18) */}
        <section aria-labelledby="company-jobs-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="company-jobs-heading">Vagas Publicadas ({companyJobs.length})</h2>
              <p style={{ margin: 0 }}>Crie, pause ou reabra oportunidades técnicas no catálogo.</p>
            </div>
            <CompanyNewJobForm />
          </div>

          <div style={{ marginTop: "var(--space-4)" }}>
            <CompanyJobsList jobs={companyJobs} />
          </div>
        </section>

        {/* Seção 2: Pipeline Seletivo Kanban (RF33) */}
        <section aria-labelledby="company-pipeline-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="company-pipeline-heading">Pipeline Seletivo ({applications.length} candidaturas)</h2>
              <p style={{ margin: 0 }}>Acompanhe os candidatos por etapa do processo seletivo.</p>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-4)" }}>
            <CompanyPipelineKanban applications={applications} />
          </div>
        </section>

        {/* Seção 3: Perfil da Empresa (RF15) */}
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
