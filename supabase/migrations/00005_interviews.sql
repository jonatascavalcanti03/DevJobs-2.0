-- Migration 00005: Interviews

CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW');

CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status interview_status NOT NULL DEFAULT 'SCHEDULED',
    meeting_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_duration CHECK (duration_minutes > 0)
);

CREATE TABLE public.interview_participants (
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    PRIMARY KEY (interview_id, user_id)
);

CREATE TABLE public.interview_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE RESTRICT,
    evaluator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    feedback TEXT NOT NULL,
    score NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_evaluations_updated_at BEFORE UPDATE ON public.interview_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indices
CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);
