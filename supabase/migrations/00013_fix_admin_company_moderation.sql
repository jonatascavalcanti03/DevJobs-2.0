-- Migration 00013: Correção de Construto SQL em admin_review_company_verification
--
-- Substitui a chamada incorreta de pg_catalog.coalesce (COALESCE é construto sintático SQL nativo,
-- não uma função de catálogo em pg_proc) pela sintaxe nativa COALESCE.
-- Preserva integralmente:
--   - SECURITY DEFINER
--   - search_path = pg_catalog, public
--   - Bloqueio FOR UPDATE
--   - Validação rigorosa de role 'ADMIN' em public.users
--   - Gravação atômica em company_profiles, company_verifications e audit_logs
--   - Revogação de PUBLIC/anon e concessão a authenticated

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
        COALESCE(_notes, CASE WHEN _action = 'APPROVE' THEN 'Aprovado pela moderação administrativa.' ELSE 'Rejeitado pela moderação administrativa.' END)
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

