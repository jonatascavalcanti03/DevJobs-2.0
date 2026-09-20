-- Migration 00003: Company

CREATE TYPE company_verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE public.company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    trading_name TEXT,
    website TEXT,
    description TEXT,
    verification_status company_verification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_cnpj_format CHECK (cnpj ~ '^\d{14}$')
);

CREATE TABLE public.company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, user_id),
    CONSTRAINT check_member_role CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'))
);

CREATE TABLE public.company_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    status company_verification_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_members_updated_at BEFORE UPDATE ON public.company_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_verifications_updated_at BEFORE UPDATE ON public.company_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indices
CREATE INDEX idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX idx_company_members_user_id ON public.company_members(user_id);
