-- ==============================================================================
-- DevJobs 2.0 / TechLink — Seed Oficial de Demonstração (Desenvolvimento Local)
-- ==============================================================================
-- Este arquivo é executado exclusivamente em ambiente de desenvolvimento local
-- pelo Supabase CLI (durante `supabase start` ou `supabase db reset`).
-- NUNCA é aplicado em ambientes de produção.
--
-- Senha padrão de teste para todas as contas de demonstração:
-- DevJobs@2026
-- (Hash bcrypt: $2a$10$wT0/y6iP2QvF7uP0C7B.e.QO6GvjFjVp9qM2A0D9Y3P6V2Z1k0L8u)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. IDENTIDADES NO SUPABASE AUTH (auth.users e auth.identities)
-- ------------------------------------------------------------------------------

INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
)
VALUES
    -- 1.1 Recrutador Empresa 1 (CloudScale)
    (
        '11111111-1111-4111-8111-111111111111'::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID,
        'authenticated',
        'authenticated',
        'recrutador@cloudscale.test',
        extensions.crypt('DevJobs@2026', extensions.gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::JSONB,
        '{"full_name": "Roberto Recrutador (CloudScale)"}'::JSONB,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    -- 1.2 Recrutador Empresa 2 (FinSecure)
    (
        '22222222-2222-4222-8222-222222222222'::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID,
        'authenticated',
        'authenticated',
        'talentos@finsecure.test',
        extensions.crypt('DevJobs@2026', extensions.gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::JSONB,
        '{"full_name": "Fernanda Talentos (FinSecure)"}'::JSONB,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    -- 1.3 Candidato 1 (Lucas Silva - Sênior)
    (
        '33333333-3333-4333-8333-333333333333'::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID,
        'authenticated',
        'authenticated',
        'lucas.candidato@techlink.test',
        extensions.crypt('DevJobs@2026', extensions.gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::JSONB,
        '{"full_name": "Lucas Silva"}'::JSONB,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    -- 1.4 Candidato 2 (Mariana Souza - Pleno)
    (
        '44444444-4444-4444-8444-444444444444'::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID,
        'authenticated',
        'authenticated',
        'mariana.dev@techlink.test',
        extensions.crypt('DevJobs@2026', extensions.gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::JSONB,
        '{"full_name": "Mariana Souza"}'::JSONB,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    -- 1.5 Administrador Geral
    (
        '99999999-9999-4999-8999-999999999999'::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID,
        'authenticated',
        'authenticated',
        'admin@techlink.test',
        extensions.crypt('DevJobs@2026', extensions.gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::JSONB,
        '{"full_name": "Administrador TechLink"}'::JSONB,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
ON CONFLICT (id) DO NOTHING;

-- Vínculos de identidade no GoTrue (necessário para autenticação via email/senha local no Supabase Auth)
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES
    (
        '11111111-1111-4111-8111-111111111111'::UUID,
        '11111111-1111-4111-8111-111111111111'::UUID,
        '11111111-1111-4111-8111-111111111111',
        '{"sub": "11111111-1111-4111-8111-111111111111", "email": "recrutador@cloudscale.test"}'::JSONB,
        'email',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '22222222-2222-4222-8222-222222222222'::UUID,
        '22222222-2222-4222-8222-222222222222'::UUID,
        '22222222-2222-4222-8222-222222222222',
        '{"sub": "22222222-2222-4222-8222-222222222222", "email": "talentos@finsecure.test"}'::JSONB,
        'email',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '33333333-3333-4333-8333-333333333333'::UUID,
        '33333333-3333-4333-8333-333333333333'::UUID,
        '33333333-3333-4333-8333-333333333333',
        '{"sub": "33333333-3333-4333-8333-333333333333", "email": "lucas.candidato@techlink.test"}'::JSONB,
        'email',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-8444-444444444444'::UUID,
        '44444444-4444-4444-8444-444444444444'::UUID,
        '44444444-4444-4444-8444-444444444444',
        '{"sub": "44444444-4444-4444-8444-444444444444", "email": "mariana.dev@techlink.test"}'::JSONB,
        'email',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        '99999999-9999-4999-8999-999999999999'::UUID,
        '99999999-9999-4999-8999-999999999999'::UUID,
        '99999999-9999-4999-8999-999999999999',
        '{"sub": "99999999-9999-4999-8999-999999999999", "email": "admin@techlink.test"}'::JSONB,
        'email',
        NOW(),
        NOW(),
        NOW()
    )
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. AJUSTE DE PAPÉIS EM public.users (O trigger 00008 insere inicialmente como CANDIDATE)
-- ------------------------------------------------------------------------------

-- Garantir inserção em public.users caso o trigger não tenha sido executado
INSERT INTO public.users (id, email, role)
VALUES
    ('11111111-1111-4111-8111-111111111111'::UUID, 'recrutador@cloudscale.test', 'COMPANY'),
    ('22222222-2222-4222-8222-222222222222'::UUID, 'talentos@finsecure.test', 'COMPANY'),
    ('33333333-3333-4333-8333-333333333333'::UUID, 'lucas.candidato@techlink.test', 'CANDIDATE'),
    ('44444444-4444-4444-8444-444444444444'::UUID, 'mariana.dev@techlink.test', 'CANDIDATE'),
    ('99999999-9999-4999-8999-999999999999'::UUID, 'admin@techlink.test', 'ADMIN')
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email;

-- ------------------------------------------------------------------------------
-- 3. EMPRESAS E RECRUTADORES (RF02, RF05, RF15, RF16)
-- ------------------------------------------------------------------------------

-- 3.1 Empresa 1: CloudScale Technologies
INSERT INTO public.company_profiles (
    id,
    cnpj,
    company_name,
    trading_name,
    website,
    description,
    verification_status
)
VALUES (
    'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    '11222333000181',
    'CloudScale Technologies Ltda',
    'CloudScale Tech',
    'https://cloudscale.test',
    'Especialistas em arquitetura de microsserviços, computação em nuvem e plataformas corporativas escaláveis.',
    'APPROVED'
)
ON CONFLICT (id) DO NOTHING;

-- 3.2 Empresa 2: FinSecure Soluções Financeiras
INSERT INTO public.company_profiles (
    id,
    cnpj,
    company_name,
    trading_name,
    website,
    description,
    verification_status
)
VALUES (
    'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'::UUID,
    '22333444000192',
    'FinSecure Soluções de Pagamento S.A.',
    'FinSecure',
    'https://finsecure.test',
    'Fintech de infraestrutura para meios de pagamento digitais e liquidação financeira em tempo real.',
    'APPROVED'
)
ON CONFLICT (id) DO NOTHING;

-- 3.3 Associação de membros (OWNER)
INSERT INTO public.company_members (company_id, user_id, role)
VALUES
    ('aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::UUID, '11111111-1111-4111-8111-111111111111'::UUID, 'OWNER'),
    ('bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'::UUID, '22222222-2222-4222-8222-222222222222'::UUID, 'OWNER')
ON CONFLICT (company_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- ------------------------------------------------------------------------------
-- 4. PERFIS DE CANDIDATOS E SUBCOMPONENTES (RF06)
-- ------------------------------------------------------------------------------

-- 4.1 Perfil Lucas Silva
INSERT INTO public.candidate_profiles (
    id,
    user_id,
    headline,
    short_summary,
    location
)
VALUES (
    'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
    '33333333-3333-4333-8333-333333333333'::UUID,
    'Engenheiro de Software Full Stack Sênior | Next.js, Node.js & Cloud',
    'Profissional com 6 anos de experiência em arquitetura web moderna, microsserviços distribuídos e PostgreSQL de alta volumetria.',
    'São Paulo, SP'
)
ON CONFLICT (user_id) DO NOTHING;

-- 4.2 Perfil Mariana Souza
INSERT INTO public.candidate_profiles (
    id,
    user_id,
    headline,
    short_summary,
    location
)
VALUES (
    'dddddddd-4444-4ddd-8ddd-dddddddddddd'::UUID,
    '44444444-4444-4444-8444-444444444444'::UUID,
    'Desenvolvedora Frontend Pleno | React, TypeScript & Design Systems',
    'Especialista na criação de interfaces fluidas, acessíveis (WCAG) e componentes reutilizáveis para produtos SaaS.',
    'Belo Horizonte, MG (Remoto)'
)
ON CONFLICT (user_id) DO NOTHING;

-- 4.3 Experiências de Lucas
INSERT INTO public.experiences (candidate_id, company_name, title, start_date, end_date, description)
VALUES
    (
        'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
        'Fintech Nexus',
        'Engenheiro Full Stack Pleno',
        '2021-02-01',
        '2024-06-30',
        'Desenvolvimento de APIs de alto desempenho em Node.js e dashboards analíticos em React/Next.js.'
    ),
    (
        'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
        'Agência Digital Alfa',
        'Desenvolvedor Web Júnior',
        '2018-08-01',
        '2021-01-31',
        'Manutenção e criação de plataformas e e-commerces com integrações REST.'
    )
ON CONFLICT DO NOTHING;

-- 4.4 Formação de Lucas
INSERT INTO public.educations (candidate_id, institution, degree, field_of_study, start_date, end_date)
VALUES (
    'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
    'Universidade de São Paulo (USP)',
    'Bacharelado',
    'Ciência da Computação',
    '2015-02-01',
    '2019-12-15'
)
ON CONFLICT DO NOTHING;

-- 4.5 Competências (Skills) e Vínculos
INSERT INTO public.skills (name)
VALUES
    ('TypeScript'),
    ('Next.js'),
    ('Node.js'),
    ('PostgreSQL'),
    ('Docker'),
    ('React'),
    ('Tailwind CSS'),
    ('Go (Golang)'),
    ('AWS'),
    ('Vitest')
ON CONFLICT (name) DO NOTHING;

-- Vincular competências aos perfis
INSERT INTO public.candidate_skills (candidate_id, skill_id)
SELECT 'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID, s.id
FROM public.skills s
WHERE s.name IN ('TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS')
ON CONFLICT DO NOTHING;

INSERT INTO public.candidate_skills (candidate_id, skill_id)
SELECT 'dddddddd-4444-4ddd-8ddd-dddddddddddd'::UUID, s.id
FROM public.skills s
WHERE s.name IN ('React', 'TypeScript', 'Tailwind CSS', 'Vitest')
ON CONFLICT DO NOTHING;

-- 4.6 Idiomas
INSERT INTO public.languages (candidate_id, language_name, proficiency_level)
VALUES
    ('cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID, 'Inglês', 'FLUENT'),
    ('cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID, 'Português', 'NATIVE'),
    ('dddddddd-4444-4ddd-8ddd-dddddddddddd'::UUID, 'Inglês', 'ADVANCED'),
    ('dddddddd-4444-4ddd-8ddd-dddddddddddd'::UUID, 'Português', 'NATIVE')
ON CONFLICT DO NOTHING;

-- 4.7 Projetos em Destaque
INSERT INTO public.projects (candidate_id, name, description, url)
VALUES (
    'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
    'Micro-Gateway Autônomo',
    'API Gateway leve desenvolvido em TypeScript com rate limiting e autenticação distribuída via Redis.',
    'https://github.com/lucassilva/micro-gateway'
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. OPORTUNIDADES / VAGAS (RF17, RF18, RF20, RF21)
-- ------------------------------------------------------------------------------

-- 5.1 Vaga 1 (CloudScale Tech) — Sênior Full Stack (ACTIVE)
INSERT INTO public.jobs (
    id,
    company_id,
    title,
    description,
    status,
    location,
    modality,
    level
)
VALUES (
    '11110000-0000-4000-8000-000000000001'::UUID,
    'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    'Engenheiro de Software Full Stack Sênior',
    'Procuramos desenvolvedor full stack sênior para atuar no núcleo de nossa plataforma SaaS multitenant. Responsabilidades incluem arquitetar soluções em Next.js/React, construir APIs de alto desempenho e garantir a confiabilidade de dados relacionais.',
    'ACTIVE',
    'Remoto (Brasil)',
    'REMOTE',
    'SENIOR'
)
ON CONFLICT (id) DO NOTHING;

-- 5.2 Vaga 2 (CloudScale Tech) — Pleno Backend Go (ACTIVE)
INSERT INTO public.jobs (
    id,
    company_id,
    title,
    description,
    status,
    location,
    modality,
    level
)
VALUES (
    '11110000-0000-4000-8000-000000000002'::UUID,
    'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    'Desenvolvedor Backend Go & PostgreSQL',
    'Oportunidade para atuar no time de ingestão de eventos e processamento assíncrono. Forte ênfase em concorrência em Go, otimização de consultas PostgreSQL e índices.',
    'ACTIVE',
    'São Paulo, SP',
    'HYBRID',
    'PLENO'
)
ON CONFLICT (id) DO NOTHING;

-- 5.3 Vaga 3 (CloudScale Tech) — Lead DevOps (PAUSED)
INSERT INTO public.jobs (
    id,
    company_id,
    title,
    description,
    status,
    location,
    modality,
    level
)
VALUES (
    '11110000-0000-4000-8000-000000000003'::UUID,
    'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    'Tech Lead de Infraestrutura & DevOps',
    'Liderança técnica da governança de clusters Kubernetes, automação de esteiras CI/CD e monitoramento de custos em nuvem AWS. Vaga temporariamente pausada.',
    'PAUSED',
    'Remoto',
    'REMOTE',
    'LEAD'
)
ON CONFLICT (id) DO NOTHING;

-- 5.4 Vaga 4 (FinSecure) — Pleno Frontend React (ACTIVE)
INSERT INTO public.jobs (
    id,
    company_id,
    title,
    description,
    status,
    location,
    modality,
    level
)
VALUES (
    '22220000-0000-4000-8000-000000000001'::UUID,
    'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'::UUID,
    'Engenheiro Frontend React & TypeScript',
    'Responsável por desenvolver a nova geração de interfaces de checkout e reconciliação financeira da FinSecure. Foco em performance, padrões de design e testes.',
    'ACTIVE',
    'Remoto (Brasil)',
    'REMOTE',
    'PLENO'
)
ON CONFLICT (id) DO NOTHING;

-- Competências das vagas (Job Skills)
INSERT INTO public.job_skills (job_id, skill_id)
SELECT '11110000-0000-4000-8000-000000000001'::UUID, s.id
FROM public.skills s
WHERE s.name IN ('Next.js', 'TypeScript', 'Node.js', 'PostgreSQL')
ON CONFLICT DO NOTHING;

INSERT INTO public.job_skills (job_id, skill_id)
SELECT '11110000-0000-4000-8000-000000000002'::UUID, s.id
FROM public.skills s
WHERE s.name IN ('Go (Golang)', 'PostgreSQL', 'Docker')
ON CONFLICT DO NOTHING;

INSERT INTO public.job_skills (job_id, skill_id)
SELECT '22220000-0000-4000-8000-000000000001'::UUID, s.id
FROM public.skills s
WHERE s.name IN ('React', 'TypeScript', 'Tailwind CSS', 'Vitest')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. CANDIDATURAS E HISTÓRICO ATÔMICO DE ESTÁGIOS (RF29, RF31, RF33)
-- ------------------------------------------------------------------------------

-- 6.1 Lucas na Vaga 1 (CloudScale Full Stack) — Estágio SCREENING (Triagem)
INSERT INTO public.applications (
    id,
    job_id,
    candidate_id,
    status,
    created_at,
    updated_at
)
VALUES (
    'aaaaaaaa-0001-4000-8000-000000000001'::UUID,
    '11110000-0000-4000-8000-000000000001'::UUID,
    'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
    'SCREENING',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (job_id, candidate_id) DO NOTHING;

INSERT INTO public.application_stage_history (
    application_id,
    previous_status,
    new_status,
    changed_by,
    notes,
    created_at
)
VALUES
    (
        'aaaaaaaa-0001-4000-8000-000000000001'::UUID,
        NULL,
        'SUBMITTED',
        '33333333-3333-4333-8333-333333333333'::UUID,
        'Candidatura submetida pelo candidato.',
        NOW() - INTERVAL '3 days'
    ),
    (
        'aaaaaaaa-0001-4000-8000-000000000001'::UUID,
        'SUBMITTED',
        'SCREENING',
        '11111111-1111-4111-8111-111111111111'::UUID,
        'Perfil aprovado na pré-triagem curricular. Experiência alinhada à stack.',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT DO NOTHING;

-- 6.2 Mariana na Vaga 1 (CloudScale Full Stack) — Estágio INTERVIEW (Entrevista Agendada)
INSERT INTO public.applications (
    id,
    job_id,
    candidate_id,
    status,
    created_at,
    updated_at
)
VALUES (
    'aaaaaaaa-0002-4000-8000-000000000002'::UUID,
    '11110000-0000-4000-8000-000000000001'::UUID,
    'dddddddd-4444-4ddd-8ddd-dddddddddddd'::UUID,
    'INTERVIEW',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '6 hours'
)
ON CONFLICT (job_id, candidate_id) DO NOTHING;

INSERT INTO public.application_stage_history (
    application_id,
    previous_status,
    new_status,
    changed_by,
    notes,
    created_at
)
VALUES
    (
        'aaaaaaaa-0002-4000-8000-000000000002'::UUID,
        NULL,
        'SUBMITTED',
        '44444444-4444-4444-8444-444444444444'::UUID,
        'Candidatura enviada via portal de vagas.',
        NOW() - INTERVAL '5 days'
    ),
    (
        'aaaaaaaa-0002-4000-8000-000000000002'::UUID,
        'SUBMITTED',
        'SCREENING',
        '11111111-1111-4111-8111-111111111111'::UUID,
        'Triagem realizada. Portfólio de design system aprovado.',
        NOW() - INTERVAL '2 days'
    ),
    (
        'aaaaaaaa-0002-4000-8000-000000000002'::UUID,
        'SCREENING',
        'INTERVIEW',
        '11111111-1111-4111-8111-111111111111'::UUID,
        'Entrevista técnica agendada para alinhamento de arquitetura frontend.',
        NOW() - INTERVAL '6 hours'
    )
ON CONFLICT DO NOTHING;

-- Entrevista agendada para Mariana (RF36)
INSERT INTO public.interviews (
    application_id,
    scheduled_at,
    duration_minutes,
    status
)
VALUES (
    'aaaaaaaa-0002-4000-8000-000000000002'::UUID,
    NOW() + INTERVAL '2 days',
    45,
    'SCHEDULED'
)
ON CONFLICT DO NOTHING;

-- 6.3 Mariana na Vaga 4 (FinSecure Frontend) — Estágio SUBMITTED (Recém-enviada)
INSERT INTO public.applications (
    id,
    job_id,
    candidate_id,
    status,
    created_at,
    updated_at
)
VALUES (
    'bbbbbbbb-0001-4000-8000-000000000001'::UUID,
    '22220000-0000-4000-8000-000000000001'::UUID,
    'dddddddd-4444-4ddd-8ddd-dddddddddddd'::UUID,
    'SUBMITTED',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
)
ON CONFLICT (job_id, candidate_id) DO NOTHING;

INSERT INTO public.application_stage_history (
    application_id,
    previous_status,
    new_status,
    changed_by,
    notes,
    created_at
)
VALUES (
    'bbbbbbbb-0001-4000-8000-000000000001'::UUID,
    NULL,
    'SUBMITTED',
    '44444444-4444-4444-8444-444444444444'::UUID,
    'Candidatura submetida.',
    NOW() - INTERVAL '4 hours'
)
ON CONFLICT DO NOTHING;

-- 6.4 Lucas na Vaga 4 (FinSecure Frontend) — Estágio WITHDRAWN (Desistência pelo candidato - RF29)
INSERT INTO public.applications (
    id,
    job_id,
    candidate_id,
    status,
    created_at,
    updated_at
)
VALUES (
    'bbbbbbbb-0002-4000-8000-000000000002'::UUID,
    '22220000-0000-4000-8000-000000000001'::UUID,
    'cccccccc-3333-4ccc-8ccc-cccccccccccc'::UUID,
    'WITHDRAWN',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (job_id, candidate_id) DO NOTHING;

INSERT INTO public.application_stage_history (
    application_id,
    previous_status,
    new_status,
    changed_by,
    notes,
    created_at
)
VALUES
    (
        'bbbbbbbb-0002-4000-8000-000000000002'::UUID,
        NULL,
        'SUBMITTED',
        '33333333-3333-4333-8333-333333333333'::UUID,
        'Candidatura enviada.',
        NOW() - INTERVAL '10 days'
    ),
    (
        'bbbbbbbb-0002-4000-8000-000000000002'::UUID,
        'SUBMITTED',
        'WITHDRAWN',
        '33333333-3333-4333-8333-333333333333'::UUID,
        'Candidatura retirada voluntariamente pelo candidato (RF29).',
        NOW() - INTERVAL '2 days'
    )
ON CONFLICT DO NOTHING;
