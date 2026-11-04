import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { JobFilters } from "@/components/jobs/JobFilters";
import { PremiumJobCard, JobCardData } from "@/components/jobs/PremiumJobCard";
import { calculateJobMatch } from "@/lib/matching/engine";
import { CandidateMatchingInput, MatchEvaluationResult } from "@/lib/matching/types";
import { fetchExternalJobs } from "@/lib/jobs/external-adzuna";
import { searchDemoJobs } from "@/lib/jobs/demo-catalog";

export const metadata = {
  title: "Catálogo de Vagas | TechLink",
  description: "Explore oportunidades abertas para desenvolvedores de software no TechLink.",
};

interface VagasIndexPageProps {
  searchParams: Promise<{
    q?: string;
    modality?: string;
    level?: string;
    location?: string;
  }>;
}

export default async function VagasIndexPage({ searchParams }: VagasIndexPageProps) {
  const { q, modality, level, location } = await searchParams;

  let jobsData: JobCardData[] = [];
  let fetchError: string | null = null;
  let currentUser: { email: string | null; role: string | null } | null = null;
  let candidateData: CandidateMatchingInput | null = null;
  const matchResultsMap = new Map<string, MatchEvaluationResult>();

  try {
    const supabase = await createClient();

    // 1. Obter sessão atual de forma segura
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = userData?.role ?? null;
      currentUser = {
        email: user.email ?? null,
        role,
      };

      // Se for candidato, carregar dados para matching determinístico
      if (role === "CANDIDATE") {
        const { data: candidateProfile } = await supabase
          .from("candidate_profiles")
          .select("id, headline, location")
          .eq("user_id", user.id)
          .maybeSingle();

        if (candidateProfile) {
          const { data: candidateSkills } = await supabase
            .from("candidate_skills")
            .select(`
              skills (
                name
              )
            `)
            .eq("candidate_id", candidateProfile.id);

          const skillsList = (candidateSkills || [])
            .map((cs: { skills: { name: string } | { name: string }[] | null }) => {
              const s = Array.isArray(cs.skills) ? cs.skills[0] : cs.skills;
              return s?.name;
            })
            .filter((name): name is string => typeof name === "string" && name.length > 0);

          candidateData = {
            headline: candidateProfile.headline,
            location: candidateProfile.location,
            skills: skillsList,
          };
        }
      }
    }

    // 2. Consulta de vagas ativas no Supabase
    let query = supabase
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
        ),
        job_skills (
          skills (
            name
          )
        )
      `)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    if (modality && modality !== "ALL") {
      query = query.eq("modality", modality);
    }

    if (level && level !== "ALL") {
      query = query.eq("level", level);
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    const { data, error } = await query;

    if (error) {
      fetchError = error.message;
    } else if (data && data.length > 0) {
      jobsData = data.map((rawJob) => {
        const companyProfile = Array.isArray(rawJob.company_profiles)
          ? rawJob.company_profiles[0]
          : rawJob.company_profiles;
        const companyName =
          companyProfile?.trading_name || companyProfile?.company_name || "Empresa Confidencial";

        const skills = (rawJob.job_skills || [])
          .map((js: { skills: { name: string } | { name: string }[] | null }) => {
            const s = Array.isArray(js.skills) ? js.skills[0] : js.skills;
            return s?.name;
          })
          .filter((name): name is string => typeof name === "string" && name.length > 0);

        return {
          id: rawJob.id,
          title: rawJob.title,
          description: rawJob.description,
          status: rawJob.status,
          location: rawJob.location,
          modality: rawJob.modality,
          level: rawJob.level,
          created_at: rawJob.created_at,
          companyName,
          skills,
        };
      });
    }

    // Se não houver vagas reais cadastradas em produção (ou em ambiente local/preview),
    // carrega as 15 vagas completas do catálogo demonstrativo
    const demoJobs = searchDemoJobs(q, location, modality, level);

    if (jobsData.length === 0) {
      jobsData = demoJobs;
    } else {
      // Se houver poucas vagas na base (ex: 3 sementes do seed inicial),
      // mescla com as vagas demonstrativas sem duplicar IDs para entregar a experiência completa de 15+ vagas
      const existingIds = new Set(jobsData.map((j) => j.id));
      const supplementaryDemo = demoJobs.filter((dj) => !existingIds.has(dj.id));
      jobsData = [...jobsData, ...supplementaryDemo];
    }

    // 3. Execução do matching determinístico para candidato autenticado
    if (candidateData) {
      for (const job of jobsData) {
        const matchResult = calculateJobMatch(candidateData, {
          id: job.id,
          title: job.title,
          description: job.description,
          skills: job.skills,
          level: job.level,
          modality: job.modality,
          location: job.location,
        });
        matchResultsMap.set(job.id, matchResult);
      }
    }

    // 4. Integração opcional com API externa (Adzuna) se configurada
    try {
      const externalResult = await fetchExternalJobs({
        query: q,
        location,
      });
      if (externalResult.available && externalResult.jobs.length > 0) {
        jobsData = [...jobsData, ...externalResult.jobs];
      }
    } catch {
      // Falha externa nunca derruba o catálogo interno
    }
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : "Erro ao carregar vagas.";
  }

  const hasFiltersApplied = Boolean(
    q || (modality && modality !== "ALL") || (level && level !== "ALL") || location
  );

  const isCandidate = currentUser?.role === "CANDIDATE";

  return (
    <>
      <Header user={currentUser} />

      <main className="vagas-catalog-page" id="main-content">
        <div className="container">
          <header className="vagas-catalog-header">
            <h1 className="vagas-title">Oportunidades em Tecnologia</h1>
            <p className="vagas-subtitle">
              Vagas para desenvolvedores de software com stacks modernas, transparência de
              requisitos e avaliação orientada a competências.
            </p>
          </header>

          <JobFilters totalCount={jobsData.length} />

          {fetchError && jobsData.length === 0 && (
            <div className="vagas-error-notice" role="alert">
              Não foi possível carregar as vagas no momento. Tente novamente mais tarde.
            </div>
          )}

          {!fetchError && jobsData.length === 0 && (
            <div className="vagas-empty-container">
              <div
                className="dashboard-empty-state"
                style={{ minHeight: "180px", flexDirection: "column", gap: "1rem" }}
              >
                <p>Nenhuma oportunidade encontrada para os filtros selecionados.</p>
                {hasFiltersApplied && (
                  <Link href="/vagas" className="btn btn-secondary btn-sm">
                    Limpar todos os filtros
                  </Link>
                )}
              </div>
            </div>
          )}

          {jobsData.length > 0 && (
            <div className="vagas-grid" role="list">
              {jobsData.map((job) => (
                <PremiumJobCard
                  key={job.id}
                  job={job}
                  isCandidate={isCandidate}
                  matchResult={matchResultsMap.get(job.id) || null}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CtaFooterSection />
    </>
  );
}
