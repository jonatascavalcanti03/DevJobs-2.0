import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obter o role do banco de dados (public.users)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    redirect("/login?error=account");
  }

  const role = userData.role;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="container dashboard-header-container">
          <Link href="/" className="header-logo" aria-label="TechLink Início">
            <div className="header-logo-icon" aria-hidden="true">TL</div>
            <span>TechLink</span>
          </Link>
          
          <div className="dashboard-user-info">
            <span className="dashboard-role-badge">
              {role === "COMPANY" ? "Empresa" : "Candidato"}
            </span>
            <span className="dashboard-email">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost btn-sm">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
