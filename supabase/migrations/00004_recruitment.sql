-- Migration 00004: Recruitment

CREATE TYPE job_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE application_status AS ENUM ('SUBMITTED', 'SCREENING', 'INTERVIEW', 'ADVANCING', 'HIRED', 'REJECTED', 'WITHDRAWN', 'CLOSED');

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status job_status NOT NULL DEFAULT 'DRAFT',
    location TEXT,
    modality TEXT,
    level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.job_skills (
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE public.job_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE RESTRICT,
    status application_status NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, candidate_id) -- Prevenção de Duplicidade (RF31)
);

CREATE TABLE public.application_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
    previous_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indices
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_application_stage_history_app_id ON public.application_stage_history(application_id);
