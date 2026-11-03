import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/landing/Header";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { JobFilters } from "@/components/jobs/JobFilters";
import { PremiumJobCard, JobCardData } from "@/components/jobs/PremiumJobCard";
import { calculateJobMatch } from "@/lib/matching/engine";
import { CandidateMatchingInput, MatchEvaluationResult } from "@/lib/matching/types";
import { fetchExternalJobs } from "@/lib/jobs/external-adzuna";

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
          // Carregar competências do candidato
          const { data: skillsData } = await supabase
            .from("candidate_skills")
            .select(`
              skill_id,
              skills (
                id,
                name
              )
            `)
            .eq("candidate_id", candidateProfile.id);

          const skills = (skillsData || [])
            .map((item) => {
              const s = Array.isArray(item.skills) ? item.skills[0] : item.skills;
              return s?.name;
            })
            .filter((name): name is string => typeof name === "string" && name.length > 0);

          // Carregar experiências para inferência de senioridade caso necessário
          const { data: expData } = await supabase
            .from("experiences")
            .select("title, start_date, end_date")
            .eq("candidate_id", candidateProfile.id);

          candidateData = {
            skills,
            location: candidateProfile.location,
            headline: candidateProfile.headline,
            experiences: (expData || []).map((exp) => ({
              title: exp.title,
              start_date: exp.start_date,
              end_date: exp.end_date,
            })),
          };
        }
      }
    }

    // 2. Consulta de vagas ativas com suporte aos filtros (RF20 e RF21)
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
      .eq("status", "ACTIVE");

    // Filtro por termo textual (RF20)
    if (q && q.trim().length > 0) {
      const cleanQ = q.trim();
      query = query.or(`title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`);
    }

    // Filtro por modalidade (RF21)
    if (modality && modality !== "ALL") {
      query = query.eq("modality", modality);
    }

    // Filtro por senioridade (RF21)
    if (level && level !== "ALL") {
      query = query.eq("level", level);
    }

    // Filtro por localização (RF21)
    if (location && location.trim().length > 0) {
      query = query.ilike("location", `%${location.trim()}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      fetchError = error.message;
    } else if (data) {
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

      // 4. Integração com API externa (Adzuna) se credenciais configuradas
      try {
        const externalResult = await fetchExternalJobs({
          query: q,
          location,
        });
        if (externalResult.available && externalResult.jobs.length > 0) {
          jobsData = [...jobsData, ...externalResult.jobs];
        }
      } catch {
        // Falha na API externa nunca derruba o catálogo interno institucional
      }
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
            <span className="section-tag">Oportunidades Abertas</span>
            <h1 className="section-title">
              Catálogo de Vagas <span className="gradient-text">Tech</span>
            </h1>
            <p className="section-subtitle">
              Encontre sua próxima posição técnica em empresas inovadoras. Vagas 100% reais e validadas.
            </p>
          </header>

          {/* Barra de Busca e Filtros (RF20 e RF21) */}
          <JobFilters totalCount={jobsData.length} />

          {fetchError && (
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
                <p>
                  {hasFiltersApplied
                    ? "Nenhuma vaga encontrada para os filtros selecionados."
                    : "Nenhuma vaga ativa encontrada no momento."}
                </p>
                {hasFiltersApplied && (
                  <Link href="/vagas" className="btn btn-secondary btn-sm">
                    Limpar filtros e ver todas as vagas
                  </Link>
                )}
              </div>
            </div>
          )}

          {!fetchError && jobsData.length > 0 && (
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
