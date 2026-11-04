import { createClient } from "@/lib/supabase/server";
import { FeaturedJobsClient, type JobItem } from "./FeaturedJobsClient";
import { FeaturedJobsCinematicScene } from "./FeaturedJobsCinematicScene";
import { DEMO_JOBS } from "@/lib/jobs/demo-catalog";

async function fetchFeaturedJobs(): Promise<{ jobs: JobItem[]; error: string | null }> {
  const fallbackDemoJobs: JobItem[] = DEMO_JOBS.slice(0, 8).map((dj) => ({
    id: dj.id,
    title: dj.title,
    modality: dj.modality,
    level: dj.level,
    location: dj.location,
    created_at: dj.created_at,
    isRecent: true,
    isFeatured: true,
    companyName: dj.companyName,
  }));

  // Se as variáveis de ambiente do Supabase não estiverem definidas,
  // retorna as vagas demonstrativas para exibição de vitrine
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { jobs: fallbackDemoJobs, error: null };
  }

  try {
    const supabase = await createClient();

    // Consulta no máximo 8 vagas ativas ordenadas pela data mais recente
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        status,
        location,
        modality,
        level,
        created_at,
        company_profiles (
          company_name,
          trading_name
        )
      `)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      // Em caso de falha de consulta no banco, apresenta o catálogo demonstrativo
      return { jobs: fallbackDemoJobs, error: null };
    }

    if (!data || data.length === 0) {
      // Se o banco remoto ainda estiver sem vagas, apresenta o catálogo demonstrativo identificado
      return { jobs: fallbackDemoJobs, error: null };
    }

    const now = new Date().getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    const seenIds = new Set<string>();
    const formattedJobs: JobItem[] = [];

    for (const item of data) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        const itemTime = new Date(item.created_at).getTime();
        const isRecent = now - itemTime < SEVEN_DAYS_MS;

        const cp = Array.isArray(item.company_profiles)
          ? item.company_profiles[0]
          : item.company_profiles;
        const companyName = cp?.trading_name || cp?.company_name || "TechLink Parceira";

        formattedJobs.push({
          id: item.id,
          title: item.title,
          modality: item.modality,
          level: item.level,
          location: item.location,
          created_at: item.created_at,
          isRecent,
          isFeatured: false,
          companyName,
        });
      }
    }

    return { jobs: formattedJobs, error: null };
  } catch {
    return { jobs: fallbackDemoJobs, error: null };
  }
}

export async function FeaturedJobsSection() {
  const { jobs, error } = await fetchFeaturedJobs();

  return (
    <section id="vagas" className="featured-jobs-section" aria-labelledby="featured-jobs-title">
      <FeaturedJobsCinematicScene />
      <div className="container">
        <FeaturedJobsClient jobs={jobs} error={error} />
      </div>
    </section>
  );
}
