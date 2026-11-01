import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { AdminCompaniesList } from "@/components/admin/AdminCompaniesList";
import { AdminJobsList } from "@/components/admin/AdminJobsList";

export const metadata = {
  title: "Painel Administrativo | TechLink",
  description: "Governança, moderação institucional e métricas gerais da plataforma.",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
    return null;
  }

  // Verificação rigorosa do papel ADMIN em public.users
  const { data: account, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !account) {
    redirect("/login?error=account");
    return null;
  }
  if (account.role !== "ADMIN") {
    redirect("/dashboard");
    return null;
  }

  // Usuário autenticado e com permissão comprovada de ADMIN no servidor.
  // Utiliza o cliente administrativo autorizado para consultas de governança global.
  const adminClient = createAdminClient();

  // 1. Métricas Globais da Plataforma
  const { data: allUsers } = await adminClient
    .from("users")
    .select("id, role, email, created_at")
    .order("created_at", { ascending: false });

  const { data: allCompanies } = await adminClient
    .from("company_profiles")
    .select("id, cnpj, company_name, trading_name, website, verification_status, created_at")
    .order("created_at", { ascending: false });

  const { data: allJobs } = await adminClient
    .from("jobs")
    .select(`
      id,
      title,
      status,
      modality,
      level,
      location,
      created_at,
      company_profiles (
        trading_name,
        company_name
      )
    `)
    .order("created_at", { ascending: false });

  const { data: auditEntries } = await adminClient
    .from("audit_logs")
    .select("id, action, entity, entity_id, actor_user_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const usersList = allUsers || [];
  const companiesList = allCompanies || [];
  const jobsRaw = allJobs || [];
  const auditLogs = auditEntries || [];

  const candidatesCount = usersList.filter((u) => u.role === "CANDIDATE").length;
  const companiesUserCount = usersList.filter((u) => u.role === "COMPANY").length;
  const pendingVerifications = companiesList.filter((c) => c.verification_status === "PENDING").length;
  const activeJobsCount = jobsRaw.filter((j) => j.status === "ACTIVE").length;

  const formattedJobs = jobsRaw.map((j) => {
    const cp = Array.isArray(j.company_profiles) ? j.company_profiles[0] : j.company_profiles;
    return {
      id: j.id,
      title: j.title,
      status: j.status,
      modality: j.modality,
      level: j.level,
      location: j.location,
      created_at: j.created_at,
      companyName: cp?.trading_name || cp?.company_name || "Empresa Confidencial",
    };
  });

  return (
    <div className="container dashboard-content">
      {/* 1. Header Administrativo */}
      <div className="dashboard-premium-welcome">
        <div className="dashboard-welcome-info">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
            <span className="section-tag" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#FCA5A5", borderColor: "rgba(239, 68, 68, 0.3)" }}>
              Acesso Restrito
            </span>
            <Badge variant="accent" size="sm">
              Administrador Geral
            </Badge>
          </div>
          <h1>Painel Administrativo</h1>
          <p>
            Governança da plataforma, verificação de contas institucionais, moderação de vagas e auditoria.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <Link href="/vagas" className="btn btn-secondary btn-sm" target="_blank">
            Ver Catálogo Público ↗
          </Link>
        </div>
      </div>

      {/* 2. Indicadores Globais Reais */}
      <div className="dashboard-stats-grid" role="region" aria-label="Indicadores da Plataforma">
        <StatCard
          title="Total de Usuários"
          value={usersList.length}
          subtitle={`${candidatesCount} candidatos · ${companiesUserCount} empresas`}
          variant="indigo"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
        />
        <StatCard
          title="Verificações Pendentes"
          value={pendingVerifications}
          subtitle={`${companiesList.length} empresa(s) registradas`}
          variant="amber"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <StatCard
          title="Vagas Ativas"
          value={activeJobsCount}
          subtitle={`${jobsRaw.length} vagas no catálogo geral`}
          variant="cyan"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />
        <StatCard
          title="Registros de Auditoria"
          value={auditLogs.length}
          subtitle="Ações imutáveis registradas"
          variant="emerald"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Seção 1: Moderação e Verificação de Empresas (RF16) */}
        <section aria-labelledby="admin-companies-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="admin-companies-heading">Verificação de Empresas ({companiesList.length})</h2>
              <p style={{ margin: 0 }}>Analise cadastros corporativos, aprove ou rejeite solicitações institucionais (RF16).</p>
            </div>
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <AdminCompaniesList companies={companiesList} />
          </div>
        </section>

        {/* Seção 2: Moderação de Vagas (RF18) */}
        <section aria-labelledby="admin-jobs-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="admin-jobs-heading">Moderação Geral de Vagas ({formattedJobs.length})</h2>
              <p style={{ margin: 0 }}>Supervisione conteúdos publicados, pause ou encerre vagas inadequadas.</p>
            </div>
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <AdminJobsList jobs={formattedJobs} />
          </div>
        </section>

        {/* Seção 3: Consulta de Usuários do Sistema */}
        <section aria-labelledby="admin-users-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="admin-users-heading">Contas de Usuários ({usersList.length})</h2>
              <p style={{ margin: 0 }}>Consulta de identidades e respectivos papéis cadastrados.</p>
            </div>
          </div>
          <div className="admin-table-wrap" style={{ marginTop: "var(--space-4)" }}>
            <table className="admin-table" aria-label="Contas de Usuários">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {usersList.slice(0, 15).map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.email}</strong>
                      <span className="admin-subtext">ID: {u.id.slice(0, 8)}...</span>
                    </td>
                    <td>
                      <Badge
                        variant={u.role === "ADMIN" ? "accent" : u.role === "COMPANY" ? "tech" : "level"}
                        size="sm"
                      >
                        {u.role === "ADMIN" ? "Admin" : u.role === "COMPANY" ? "Empresa" : "Candidato"}
                      </Badge>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Seção 4: Trilha de Auditoria Administrativa */}
        <section aria-labelledby="admin-audit-heading" className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header-flex">
            <div>
              <h2 id="admin-audit-heading">Trilha de Auditoria (Logs Imutáveis)</h2>
              <p style={{ margin: 0 }}>Registros de segurança invioláveis (operações administrativas e transições).</p>
            </div>
          </div>
          {auditLogs.length === 0 ? (
            <div className="dashboard-empty-state" style={{ minHeight: "120px", marginTop: "var(--space-4)" }}>
              Nenhum evento registrado na trilha de auditoria até o momento.
            </div>
          ) : (
            <div className="admin-table-wrap" style={{ marginTop: "var(--space-4)" }}>
              <table className="admin-table" aria-label="Trilha de Auditoria">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>ID da Entidade</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString("pt-BR")}</td>
                      <td>
                        <span className="admin-badge-status status-audit">{log.action}</span>
                      </td>
                      <td>{log.entity}</td>
                      <td>
                        <code>{log.entity_id}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
