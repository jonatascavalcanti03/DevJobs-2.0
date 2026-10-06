import { createClient } from "@/lib/supabase/server";
import { FeaturedJobsClient, type JobItem } from "./FeaturedJobsClient";
import { FeaturedJobsCinematicScene } from "./FeaturedJobsCinematicScene";

async function fetchFeaturedJobs(): Promise<{ jobs: JobItem[]; error: string | null }> {
  // Se as variáveis de ambiente do Supabase não estiverem definidas,
  // retorna lista vazia segura (sem simulação falsa de vagas)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { jobs: [], error: null };
  }

  try {
    const supabase = await createClient();

    // Consulta no máximo 8 vagas ativas (DEC-LP04-01) ordenadas pela data mais recente
    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, description, status, location, modality, level, created_at")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      return { jobs: [], error: error.message };
    }

    if (!data || data.length === 0) {
      return { jobs: [], error: null };
    }

    const now = new Date().getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Deduplicação estrita e verificação de recência (< 7 dias)
    const seenIds = new Set<string>();
    const formattedJobs: JobItem[] = [];

    for (const item of data) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        const itemTime = new Date(item.created_at).getTime();
        const isRecent = now - itemTime < SEVEN_DAYS_MS;

        formattedJobs.push({
          id: item.id,
          title: item.title,
          modality: item.modality,
          level: item.level,
          location: item.location,
          created_at: item.created_at,
          isRecent,
          isFeatured: false,
        });
      }
    }

    return { jobs: formattedJobs, error: null };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return { jobs: [], error: errorMessage };
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
