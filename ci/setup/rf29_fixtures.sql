-- ci/setup/rf29_fixtures.sql
--
-- PROPÓSITO: Dados de teste determinísticos para testes de integração RF29 e RLS.
--
-- Reutiliza os usuários já definidos em rf33_fixtures.sql (ON CONFLICT DO NOTHING).
-- Adiciona entidades necessárias para:
--   - RF29: retirada de candidatura (withdraw_application RPC)
--   - Isolamento entre empresas (empresa A vs empresa B)
--   - Acesso de candidato a dados de outro candidato
--
-- EXECUTE APÓS: auth_mock.sql + todas as migrations (00001–00011) + rf33_fixtures.sql

-- ===========================================================================
-- Reutiliza fixtures RF33 (idempotente)
-- ===========================================================================

-- Recrutador Empresa A (já existe em rf33_fixtures.sql)
-- a1a1a1a1-0000-0000-0000-000000000001 → recruiter@ci.test → COMPANY
-- Candidato 1 (já existe)
-- b2b2b2b2-0000-0000-0000-000000000002 → candidate@ci.test → CANDIDATE
-- Empresa A (já existe)
-- c3c3c3c3-0000-0000-0000-000000000003
-- Candidatura principal (já existe — para reutilizar em RF29)
-- a9a9a9a9-0000-0000-0000-000000000009

-- ===========================================================================
-- EMPRESA B — para testes de isolamento entre empresas
-- ===========================================================================
INSERT INTO auth.users (id, email)
VALUES ('d1d1d1d1-0000-0000-0000-000000000011'::UUID, 'recruiter_b@ci.test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role)
VALUES ('d1d1d1d1-0000-0000-0000-000000000011'::UUID, 'recruiter_b@ci.test', 'COMPANY')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.company_profiles (id, cnpj, company_name, verification_status)
VALUES (
    'e2e2e2e2-0000-0000-0000-000000000022'::UUID,
    '98765432000198',
    'CI Test Company B',
    'APPROVED'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.company_members (id, company_id, user_id, role)
VALUES (
    'f3f3f3f3-0000-0000-0000-000000000033'::UUID,
    'e2e2e2e2-0000-0000-0000-000000000022'::UUID,
    'd1d1d1d1-0000-0000-0000-000000000011'::UUID,
    'OWNER'
)
ON CONFLICT (id) DO NOTHING;

-- Vaga da Empresa B
INSERT INTO public.jobs (id, company_id, title, description, status)
VALUES (
    'a4a4a4a4-0000-0000-0000-000000000044'::UUID,
    'e2e2e2e2-0000-0000-0000-000000000022'::UUID,
    'Engenheiro CI Empresa B',
    'Vaga da Empresa B para testes de isolamento.',
    'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- CANDIDATO 3 — para testes de isolamento entre candidatos
-- ===========================================================================
INSERT INTO auth.users (id, email)
VALUES ('55555555-0000-0000-0000-000000000055'::UUID, 'candidate3@ci.test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role)
VALUES ('55555555-0000-0000-0000-000000000055'::UUID, 'candidate3@ci.test', 'CANDIDATE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.candidate_profiles (id, user_id)
VALUES ('66666666-0000-0000-0000-000000000066'::UUID, '55555555-0000-0000-0000-000000000055'::UUID)
ON CONFLICT (id) DO NOTHING;

-- Candidatura do candidato 3 para a vaga da Empresa A (para teste de cross-candidate)
INSERT INTO public.applications (id, job_id, candidate_id, status)
VALUES (
    '77777777-0000-0000-0000-000000000077'::UUID,
    'f6f6f6f6-0000-0000-0000-000000000006'::UUID,
    '66666666-0000-0000-0000-000000000066'::UUID,
    'SUBMITTED'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- Exportar IDs como configurações de sessão
-- ===========================================================================
SELECT set_config('ci.recruiter_b_user_id',  'd1d1d1d1-0000-0000-0000-000000000011', false);
SELECT set_config('ci.company_b_id',         'e2e2e2e2-0000-0000-0000-000000000022', false);
SELECT set_config('ci.job_b_id',             'a4a4a4a4-0000-0000-0000-000000000044', false);
SELECT set_config('ci.candidate3_user_id',   '55555555-0000-0000-0000-000000000055', false);
SELECT set_config('ci.candidate3_profile_id','66666666-0000-0000-0000-000000000066', false);
SELECT set_config('ci.application_id_3',     '77777777-0000-0000-0000-000000000077', false);
