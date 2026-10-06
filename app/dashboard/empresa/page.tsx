import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CompanyDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role || user.user_metadata?.role;

  if (role === "CANDIDATE") {
    redirect("/dashboard/candidato");
  }

  return (
    <div className="container dashboard-content">
      <div className="dashboard-welcome">
        <h1>Olá, Empresa parceira</h1>
        <p>Bem-vindo ao painel corporativo. Esta é a estrutura inicial da sua área autenticada.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Perfil da Empresa</h2>
          <p>Informações, logo e apresentação institucional.</p>
          <div className="dashboard-empty-state">Funcionalidade futura</div>
        </div>

        <div className="dashboard-card">
          <h2>Suas Vagas</h2>
          <p>Publique e gerencie oportunidades em aberto.</p>
          <div className="dashboard-empty-state">Nenhuma vaga publicada</div>
        </div>
        
        <div className="dashboard-card">
          <h2>Candidatos</h2>
          <p>Acompanhe currículos e processos seletivos.</p>
          <div className="dashboard-empty-state">Nenhum candidato no pipeline</div>
        </div>
      </div>
    </div>
  );
}
