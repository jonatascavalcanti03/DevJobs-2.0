-- Migration 00012: Moderação Administrativa Atômica com Auditoria Imutável (RF16 e RF18)
--
-- PROBLEMA IDENTIFICADO NA AUDITORIA DA ETAPA 5:
--   As operações administrativas `reviewCompanyVerification()` e `moderateJobStatus()`
--   realizavam a atualização operacional (em company_profiles ou jobs) e a escrita
--   em `audit_logs` como etapas separadas na camada de aplicação (TypeScript).
--   Em caso de falha transitória ou perda de conexão entre as duas chamadas, a alteração
--   operacional era persistida sem o correspondente registro de auditoria, violando o
--   princípio de auditabilidade e atomicidade (ACID).
--
-- SOLUÇÃO:
--   Criação de duas funções PostgreSQL transacionais com SECURITY DEFINER:
--     1. `admin_review_company_verification`: atualiza company_profiles, insere em
--        company_verifications e grava em audit_logs em uma única transação atômica.
--     2. `admin_moderate_job_status`: atualiza jobs e grava em audit_logs em uma
--        única transação atômica.
--
-- CONTROLES DE SEGURANÇA:
--   - Validação estrita de autorização: o chamador DEVE ter papel 'ADMIN' em public.users.
--   - `actor_user_id` derivado com segurança de auth.uid() — nunca confiado ao cliente.
--   - Bloqueio FOR UPDATE na linha afetada para prevenir race conditions e mutações concorrentes.
--   - search_path seguro: `pg_catalog, public` (pg_temp removido).
--   - Privilégios mínimos: EXECUTE revogado de PUBLIC e anon, concedido apenas a `authenticated`.
--   - Qualquer falha provoca ROLLBACK completo de todas as alterações.

-- ==============================================================================
-- 1. FUNÇÃO: admin_review_company_verification (RF16)
-- ==============================================================================
DROP FUNCTION IF EXISTS public.admin_review_company_verification(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.admin_review_company_verification(
    _company_id  UUID,
    _action      TEXT,
    _notes       TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_caller_uid        UUID;
    v_caller_role       TEXT;
    v_company           RECORD;
    v_new_status        public.company_verification_status;
BEGIN
    -- 1. Obter auth.uid() da sessão
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'UNAUTHENTICATED',
            'error_message', 'Autenticação obrigatória.'
        );
    END IF;

    -- 2. Validar que o chamador é ADMIN em public.users
    SELECT role::TEXT INTO v_caller_role
    FROM public.users
    WHERE id = v_caller_uid;

    IF v_caller_role IS NULL OR v_caller_role <> 'ADMIN' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'FORBIDDEN',
            'error_message', 'Acesso negado. Apenas administradores podem moderar empresas.'
        );
    END IF;

    -- 3. Validação dos parâmetros
    IF _company_id IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_PARAMS',
            'error_message', 'Identificador de empresa é obrigatório.'
        );
    END IF;

    IF _action NOT IN ('APPROVE', 'REJECT') THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_ACTION',
            'error_message', 'Ação de verificação inválida. Use APPROVE ou REJECT.'
        );
    END IF;

    IF _notes IS NOT NULL AND pg_catalog.length(_notes) > 500 THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'NOTES_TOO_LONG',
            'error_message', 'As observações não podem exceder 500 caracteres.'
        );
    END IF;

    -- 4. Bloquear linha da empresa com FOR UPDATE para evitar corrida
    SELECT id, verification_status
    INTO v_company
    FROM public.company_profiles
    WHERE id = _company_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'NOT_FOUND',
            'error_message', 'Empresa não encontrada.'
        );
    END IF;

    v_new_status := CASE WHEN _action = 'APPROVE' THEN 'APPROVED'::public.company_verification_status ELSE 'REJECTED'::public.company_verification_status END;

    -- 5. Atualização operacional em company_profiles
    UPDATE public.company_profiles
    SET verification_status = v_new_status,
        updated_at = pg_catalog.now()
    WHERE id = _company_id;

    -- 6. Inserção no histórico institucional de verificações (RF16)
    INSERT INTO public.company_verifications (
        company_id,
        status,
        reviewed_by,
        reviewed_at,
        notes
    ) VALUES (
        _company_id,
        v_new_status,
        v_caller_uid,
        pg_catalog.now(),
        pg_catalog.coalesce(_notes, CASE WHEN _action = 'APPROVE' THEN 'Aprovado pela moderação administrativa.' ELSE 'Rejeitado pela moderação administrativa.' END)
    );

    -- 7. Gravação atômica na trilha de auditoria imutável
    INSERT INTO public.audit_logs (
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        v_caller_uid,
        'COMPANY_VERIFICATION_' || v_new_status::TEXT,
        'company_profiles',
        _company_id,
        pg_catalog.jsonb_build_object(
            'action', _action,
            'notes', _notes,
            'previous_status', v_company.verification_status,
            'new_status', v_new_status
        )
    );

    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'company_id', _company_id,
        'new_status', v_new_status
    );
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[ADMIN_REVIEW_COMPANY] Erro na transação atômica: %', SQLERRM;
    RETURN pg_catalog.jsonb_build_object(
        'success', false,
        'error_code', 'INTERNAL_ERROR',
        'error_message', 'Erro interno ao processar moderação institucional.'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_review_company_verification(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_company_verification(UUID, TEXT, TEXT) TO authenticated;


-- ==============================================================================
-- 2. FUNÇÃO: admin_moderate_job_status (RF18)
-- ==============================================================================
DROP FUNCTION IF EXISTS public.admin_moderate_job_status(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.admin_moderate_job_status(
    _job_id     UUID,
    _new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_caller_uid        UUID;
    v_caller_role       TEXT;
    v_job               RECORD;
    v_parsed_status     public.job_status;
    v_valid_statuses    TEXT[] := ARRAY['ACTIVE', 'PAUSED', 'CLOSED'];
BEGIN
    -- 1. Obter auth.uid() da sessão
    v_caller_uid := auth.uid();
    IF v_caller_uid IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'UNAUTHENTICATED',
            'error_message', 'Autenticação obrigatória.'
        );
    END IF;

    -- 2. Validar que o chamador é ADMIN em public.users
    SELECT role::TEXT INTO v_caller_role
    FROM public.users
    WHERE id = v_caller_uid;

    IF v_caller_role IS NULL OR v_caller_role <> 'ADMIN' THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'FORBIDDEN',
            'error_message', 'Acesso negado. Apenas administradores podem moderar vagas.'
        );
    END IF;

    -- 3. Validação dos parâmetros
    IF _job_id IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_PARAMS',
            'error_message', 'Identificador de vaga é obrigatório.'
        );
    END IF;

    IF NOT (_new_status = ANY(v_valid_statuses)) THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_STATUS',
            'error_message', 'Status de moderação inválido.'
        );
    END IF;

    v_parsed_status := _new_status::public.job_status;

    -- 4. Bloquear linha da vaga com FOR UPDATE para evitar corrida
    SELECT id, status, company_id
    INTO v_job
    FROM public.jobs
    WHERE id = _job_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'NOT_FOUND',
            'error_message', 'Vaga não encontrada.'
        );
    END IF;

    -- 5. Atualização operacional em jobs
    UPDATE public.jobs
    SET status = v_parsed_status,
        updated_at = pg_catalog.now()
    WHERE id = _job_id;

    -- 6. Gravação atômica na trilha de auditoria imutável
    INSERT INTO public.audit_logs (
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        v_caller_uid,
        'JOB_MODERATION_' || _new_status,
        'jobs',
        _job_id,
        pg_catalog.jsonb_build_object(
            'previous_status', v_job.status,
            'new_status', _new_status,
            'company_id', v_job.company_id,
            'is_reopening', (v_job.status = 'CLOSED' AND _new_status = 'ACTIVE')
        )
    );

    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'job_id', _job_id,
        'new_status', _new_status
    );
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[ADMIN_MODERATE_JOB] Erro na transação atômica: %', SQLERRM;
    RETURN pg_catalog.jsonb_build_object(
        'success', false,
        'error_code', 'INTERNAL_ERROR',
        'error_message', 'Erro interno ao processar moderação de vaga.'
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_moderate_job_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_job_status(UUID, TEXT) TO authenticated;

