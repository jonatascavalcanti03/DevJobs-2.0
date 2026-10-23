-- ci/setup/auth_mock.sql
--
-- PROPÓSITO: Simular o schema `auth` do Supabase GoTrue em um PostgreSQL padrão
--            para execução de testes de integração na CI.
--
-- O Supabase fornece nativamente:
--   - schema auth (isolado do schema public)
--   - auth.users (tabela gerenciada internamente)
--   - auth.uid()  — retorna o UUID do usuário da sessão JWT
--   - auth.role() — retorna 'authenticated', 'anon', 'service_role', etc.
--   - Roles: anon, authenticated, service_role
--
-- Este arquivo cria substitutos mínimos para que todas as migrations
-- 00001 a 00010 sejam aplicáveis em um banco PostgreSQL 15 padrão.
-- NÃO representa o comportamento completo do GoTrue.
--
-- CONTROLE DO CONTEXTO DE AUTENTICAÇÃO NOS TESTES:
--   Os testes controlam a identidade via parâmetros de sessão:
--     SET LOCAL app.current_user_id = '<uuid>';
--     SET LOCAL app.current_role    = 'authenticated';
--   As funções auth.uid() e auth.role() leem esses parâmetros.
--
-- USO EXCLUSIVO PARA CI — nunca aplicar em produção.

-- ===========================================================================
-- 1. Schema auth
-- ===========================================================================
CREATE SCHEMA IF NOT EXISTS auth;

-- ===========================================================================
-- 2. Roles Supabase (anon, authenticated, service_role)
--    O role 'postgres' já existe como superuser no serviço de CI.
-- ===========================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;

    -- Conceder associação ao superuser/usuário de conexão para permitir SET LOCAL ROLE
    GRANT anon TO postgres;
    GRANT authenticated TO postgres;
    GRANT service_role TO postgres;
END;
$$;

-- ===========================================================================
-- 3. auth.users — tabela mínima exigida por FK em public.users (00001)
--    e pelo trigger on_auth_user_created (00008)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS auth.users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT        UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================================
-- 4. auth.uid() — lê variável de sessão 'app.current_user_id'
--    Retorna NULL se não configurado (equivale a 'anon' / não autenticado).
-- ===========================================================================
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(
        pg_catalog.current_setting('app.current_user_id', true),
        ''
    )::UUID;
$$;

-- ===========================================================================
-- 5. auth.role() — lê variável de sessão 'app.current_role'
--    Retorna 'anon' se não configurado.
-- ===========================================================================
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        NULLIF(pg_catalog.current_setting('app.current_role', true), ''),
        'anon'
    );
$$;

-- ===========================================================================
-- 6. auth.email() — algumas RLS policies podem referenciar esta função
-- ===========================================================================
CREATE OR REPLACE FUNCTION auth.email()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT pg_catalog.current_setting('app.current_user_email', true);
$$;

-- ===========================================================================
-- 7. Grants mínimos para que o schema público possa referenciar auth
-- ===========================================================================
GRANT USAGE ON SCHEMA auth TO PUBLIC;
GRANT SELECT ON auth.users TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.uid()  TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.role() TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.email() TO PUBLIC;
