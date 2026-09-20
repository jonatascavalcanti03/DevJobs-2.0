-- Migration 00002: Candidate

CREATE TABLE public.candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT,
    headline TEXT,
    short_summary TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_exp_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE public.educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_edu_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    language_name TEXT NOT NULL,
    proficiency_level TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.candidate_skills (
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    PRIMARY KEY (candidate_id, skill_id)
);

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON public.candidate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educations_updated_at BEFORE UPDATE ON public.educations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indices
CREATE UNIQUE INDEX idx_resumes_primary ON public.resumes(candidate_id) WHERE is_primary = true;
