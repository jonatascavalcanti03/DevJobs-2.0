-- ci/setup/rf33_fixtures.sql
--
-- PROPÓSITO: Criar dados de teste mínimos e determinísticos para os
--            testes de integração do RF33 em um banco PostgreSQL descartável.
--
-- TODOS os UUIDs são fixos e sintéticos — nenhum dado real de produção.
-- Este arquivo deve ser executado APÓS todas as migrations (00001–00010).
--
-- ENTIDADES CRIADAS:
--   A. Usuário recrutador (OWNER da empresa)     — RECRUITER_USER_ID
--   B. Usuário candidato                         — CANDIDATE_USER_ID
--   C. Empresa                                   — COMPANY_ID
--   D. Membro OWNER na empresa                   — associa RECRUITER → COMPANY
--   E. Perfil de candidato                       — CANDIDATE_PROFILE_ID
--   F. Vaga ACTIVE                               — JOB_ID
--   G. Candidatura em SUBMITTED                  — APPLICATION_ID
--   H. Candidatura em SCREENING (para concorrência) — APPLICATION_ID_CONCURRENT
--
-- CONVENÇÃO DE NOMENCLATURA:
--   Os IDs são expostos como variáveis de configuração ao final,
--   para leitura pelos testes via current_setting().

-- ===========================================================================
-- A. Inserir usuários em auth.users (Supabase mock) e public.users
-- ===========================================================================
INSERT INTO auth.users (id, email)
VALUES
    ('a1a1a1a1-0000-0000-0000-000000000001'::UUID, 'recruiter@ci.test'),
    ('b2b2b2b2-0000-0000-0000-000000000002'::UUID, 'candidate@ci.test')
ON CONFLICT (id) DO NOTHING;

-- public.users (inserção direta pois não há trigger ativo na CI sem GoTrue)
INSERT INTO public.users (id, email, role)
VALUES
    ('a1a1a1a1-0000-0000-0000-000000000001'::UUID, 'recruiter@ci.test', 'COMPANY'),
    ('b2b2b2b2-0000-0000-0000-000000000002'::UUID, 'candidate@ci.test', 'CANDIDATE')
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- B. Empresa
-- ===========================================================================
INSERT INTO public.company_profiles (id, cnpj, company_name, verification_status)
VALUES (
    'c3c3c3c3-0000-0000-0000-000000000003'::UUID,
    '12345678000195',
    'CI Test Company',
    'APPROVED'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- C. Membro OWNER na empresa
-- ===========================================================================
INSERT INTO public.company_members (id, company_id, user_id, role)
VALUES (
    'd4d4d4d4-0000-0000-0000-000000000004'::UUID,
    'c3c3c3c3-0000-0000-0000-000000000003'::UUID,
    'a1a1a1a1-0000-0000-0000-000000000001'::UUID,
    'OWNER'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- D. Perfil de candidato
-- ===========================================================================
INSERT INTO public.candidate_profiles (id, user_id)
VALUES (
    'e5e5e5e5-0000-0000-0000-000000000005'::UUID,
    'b2b2b2b2-0000-0000-0000-000000000002'::UUID
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- E. Vaga ACTIVE
-- ===========================================================================
INSERT INTO public.jobs (id, company_id, title, description, status)
VALUES (
    'f6f6f6f6-0000-0000-0000-000000000006'::UUID,
    'c3c3c3c3-0000-0000-0000-000000000003'::UUID,
    'Engenheiro de Software CI',
    'Vaga criada pelo setup de CI para testes RF33.',
    'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- F. Candidatura principal em SUBMITTED (alvo dos testes 1-4)
-- ===========================================================================
INSERT INTO public.applications (id, job_id, candidate_id, status)
VALUES (
    'a9a9a9a9-0000-0000-0000-000000000009'::UUID,
    'f6f6f6f6-0000-0000-0000-000000000006'::UUID,
    'e5e5e5e5-0000-0000-0000-000000000005'::UUID,
    'SUBMITTED'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- G. Candidatura secundária em SCREENING (usada somente no teste 5 —
--    concorrência). Candidato diferente para contornar UNIQUE(job_id, candidate_id).
-- ===========================================================================

-- Usuário e candidato auxiliar para o teste de concorrência
INSERT INTO auth.users (id, email)
VALUES ('c9c9c9c9-0000-0000-0000-000000000099'::UUID, 'candidate2@ci.test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role)
VALUES ('c9c9c9c9-0000-0000-0000-000000000099'::UUID, 'candidate2@ci.test', 'CANDIDATE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.candidate_profiles (id, user_id)
VALUES ('c8c8c8c8-0000-0000-0000-000000000088'::UUID, 'c9c9c9c9-0000-0000-0000-000000000099'::UUID)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.applications (id, job_id, candidate_id, status)
VALUES (
    'b7b7b7b7-0000-0000-0000-000000000007'::UUID,
    'f6f6f6f6-0000-0000-0000-000000000006'::UUID,
    'c8c8c8c8-0000-0000-0000-000000000088'::UUID,
    'SCREENING'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- H. Exportar IDs como configurações de sessão acessíveis pelos testes
--    Uso: SELECT current_setting('ci.recruiter_user_id');
-- ===========================================================================
SELECT set_config('ci.recruiter_user_id',   'a1a1a1a1-0000-0000-0000-000000000001', false);
SELECT set_config('ci.candidate_user_id',   'b2b2b2b2-0000-0000-0000-000000000002', false);
SELECT set_config('ci.company_id',          'c3c3c3c3-0000-0000-0000-000000000003', false);
SELECT set_config('ci.job_id',              'f6f6f6f6-0000-0000-0000-000000000006', false);
SELECT set_config('ci.application_id',      'a9a9a9a9-0000-0000-0000-000000000009', false);
SELECT set_config('ci.application_id_concurrent', 'b7b7b7b7-0000-0000-0000-000000000007', false);
