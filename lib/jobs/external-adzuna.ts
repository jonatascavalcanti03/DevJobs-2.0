import { JobCardData } from "@/components/jobs/PremiumJobCard";

export interface AdzunaSearchParams {
  query?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface AdzunaFetchResult {
  available: boolean;
  source: string;
  jobs: JobCardData[];
  totalCount: number;
  reason?: "CREDENTIALS_MISSING" | "API_ERROR" | "SUCCESS";
  error?: string;
}

interface RawAdzunaJob {
  id: string | number;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
    area?: string[];
  };
  contract_time?: string;
  salary_min?: number;
  salary_max?: number;
}

interface RawAdzunaResponse {
  count: number;
  results: RawAdzunaJob[];
}

export function stripHtml(input: string): string {
  if (!input) return "";
  return input.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

/**
 * Consulta a API externa da Adzuna respeitando resiliência e integridade do catálogo interno.
 * - Caso as credenciais não estejam configuradas em variáveis de ambiente, retorna lista vazia sem dados falsos.
 * - Preserva cache server-side via Next.js fetch revalidation.
 * - Normaliza resultados externos distinguindo-os das vagas institucionais da plataforma.
 */
export async function fetchExternalJobs(
  params: AdzunaSearchParams = {}
): Promise<AdzunaFetchResult> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const country = process.env.ADZUNA_COUNTRY || "br";

  // Se credenciais não estiverem configuradas, não inventa dados artificiais
  if (!appId || !appKey) {
    return {
      available: false,
      source: "Adzuna",
      jobs: [],
      totalCount: 0,
      reason: "CREDENTIALS_MISSING",
    };
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 20) : 10;
  const what = params.query ? encodeURIComponent(params.query) : "desenvolvedor";
  const where = params.location ? `&where=${encodeURIComponent(params.location)}` : "";

  const endpoint = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}&what=${what}${where}&content-type=application/json`;

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return {
        available: false,
        source: "Adzuna",
        jobs: [],
        totalCount: 0,
        reason: "API_ERROR",
        error: `HTTP ${response.status}`,
      };
    }

    const data: RawAdzunaResponse = await response.json();

    const normalizedJobs: JobCardData[] = (data.results || []).map((raw) => {
      const cleanTitle = stripHtml(raw.title);
      const cleanDescription = stripHtml(raw.description);
      const companyName = raw.company?.display_name || "Empresa Externa";
      const locationName = raw.location?.display_name || "Brasil";

      return {
        id: `ext-adzuna-${raw.id}`,
        title: cleanTitle,
        description: cleanDescription,
        status: "ACTIVE",
        location: locationName,
        modality: "EXTERNAL",
        level: "MID",
        created_at: raw.created || new Date().toISOString(),
        companyName,
        skills: ["Vaga Externa"],
        isExternal: true,
        externalUrl: raw.redirect_url,
        source: "Adzuna",
      };
    });

    return {
      available: true,
      source: "Adzuna",
      jobs: normalizedJobs,
      totalCount: data.count || normalizedJobs.length,
      reason: "SUCCESS",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Falha na comunicação com a API Adzuna";
    return {
      available: false,
      source: "Adzuna",
      jobs: [],
      totalCount: 0,
      reason: "API_ERROR",
      error: errorMsg,
    };
  }
}

