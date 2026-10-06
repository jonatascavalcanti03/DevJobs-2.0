import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
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

  const role = userData?.role || user.user_metadata?.role || "CANDIDATE";

  if (role === "COMPANY") {
    redirect("/dashboard/empresa");
  } else {
    redirect("/dashboard/candidato");
  }
}
