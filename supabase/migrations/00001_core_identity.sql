-- Migration 00001: Core Identity

CREATE TYPE user_role AS ENUM ('CANDIDATE', 'COMPANY', 'ADMIN');

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    role user_role NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT email_lower_ck CHECK (email = LOWER(email))
);

-- Indices
CREATE INDEX idx_users_role ON public.users(role);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
