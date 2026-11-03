import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
    return null;
  }

  // Validação estrita do papel ADMIN em public.users
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    redirect("/login?error=account");
    return null;
  }

  if (userData.role !== "ADMIN") {
    redirect("/dashboard");
    return null;
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="container dashboard-header-container">
          <Link href="/" className="header-logo" aria-label="TechLink Início">
            <div className="header-logo-icon" aria-hidden="true">TL</div>
            <span>TechLink</span>
          </Link>

          <div className="dashboard-user-info">
            <ThemeToggle />
            <span
              className="dashboard-role-badge"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#EF4444",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
            >
              Administração
            </span>
            <span className="dashboard-email">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost btn-sm">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
