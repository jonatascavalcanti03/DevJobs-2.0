import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  } else {
    redirect("/dashboard/candidato");
  }
}
