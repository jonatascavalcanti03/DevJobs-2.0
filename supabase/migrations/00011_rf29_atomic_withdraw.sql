-- Migration 00011: RF29 — Retirada de Candidatura Atômica com Histórico Imutável
--
-- PROBLEMA CORRIGIDO:
--   A implementação anterior de withdrawApplication (TypeScript) realizava:
--     1. UPDATE applications SET status = 'WITHDRAWN'
--     2. INSERT application_stage_history   ← operação separada, silenciosamente ignorada se falhar
--   Isso viola o princípio de rastreabilidade: o status pode mudar sem registro de histórico.
--
--   Adicionalmente, a migration 00010 revogou UPDATE direto em public.applications
--   para o role `authenticated`, tornando o UPDATE da Server Action falho em banco real.
--
-- SOLUÇÃO:
--   Função SECURITY DEFINER `withdraw_application` que executa UPDATE + INSERT
--   atomicamente em uma única transação PostgreSQL, com:
--     - Validação de autenticação (auth.uid())
--     - Validação de autorização: o candidato deve ser dono da candidatura
--     - Validação de propriedade via candidate_profiles.user_id = auth.uid()
--     - Validação de estados terminais (HIRED, REJECTED, CLOSED, WITHDRAWN)
--     - UPDATE + INSERT em única transação (atomicidade garantida)
--     - changed_by = auth.uid() — nunca controlado pelo cliente
--     - search_path seguro: pg_catalog, public
--     - Logging seguro sem expor dados pessoais ao cliente
--
-- CONSISTÊNCIA COM RF33:
--   Ambas as funções advance_application_stage e withdraw_application
--   seguem o mesmo padrão SECURITY DEFINER para mutações em applications
--   e application_stage_history, garantindo consistência arquitetural.

-- ==============================================================================
-- FUNÇÃO: withdraw_application
-- ==============================================================================
DROP FUNCTION IF EXISTS public.withdraw_application(UUID);

CREATE OR REPLACE FUNCTION public.withdraw_application(
    _application_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_caller_uid     UUID;
    v_app            RECORD;
    v_candidate_id   UUID;
    v_terminal_states TEXT[] := ARRAY['HIRED', 'REJECTED', 'WITHDRAWN', 'CLOSED'];
BEGIN
    -- -------------------------------------------------------------------------
    -- 1. Autenticação
    -- -------------------------------------------------------------------------
    v_caller_uid := auth.uid();

    IF v_caller_uid IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'UNAUTHENTICATED',
            'error_message', 'Autenticação obrigatória.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 2. Validação do parâmetro
    -- -------------------------------------------------------------------------
    IF _application_id IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_PARAMS',
            'error_message', 'ID da candidatura é obrigatório.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 3. Obter candidate_profile do usuário autenticado
    -- -------------------------------------------------------------------------
    SELECT id INTO v_candidate_id
    FROM public.candidate_profiles
    WHERE user_id = v_caller_uid
    LIMIT 1;

    IF v_candidate_id IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'FORBIDDEN',
            'error_message', 'Perfil de candidato não encontrado para este usuário.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 4. Obter candidatura com bloqueio FOR UPDATE
    -- -------------------------------------------------------------------------
    SELECT
        a.id,
        a.status::TEXT AS current_status,
        a.candidate_id
    INTO v_app
    FROM public.applications a
    WHERE a.id = _application_id
    FOR UPDATE OF a;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'NOT_FOUND',
            'error_message', 'Candidatura não encontrada.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 5. Autorização: confirmar que o candidato autenticado é o dono
    -- -------------------------------------------------------------------------
    IF v_app.candidate_id <> v_candidate_id THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'FORBIDDEN',
            'error_message', 'Você não tem permissão para retirar a candidatura de outro usuário.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 6. Validar estado terminal
    -- -------------------------------------------------------------------------
    IF v_app.current_status = ANY(v_terminal_states) THEN
        IF v_app.current_status = 'WITHDRAWN' THEN
            RETURN pg_catalog.jsonb_build_object(
                'success', false,
                'error_code', 'ALREADY_WITHDRAWN',
                'error_message', 'Esta candidatura já foi retirada anteriormente.'
            );
        END IF;
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'TERMINAL_STATE',
            'error_message', 'Não é possível retirar uma candidatura em processo já encerrado ou finalizado.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 7. UPDATE + INSERT atômicos
    -- -------------------------------------------------------------------------
    UPDATE public.applications
    SET
        status     = 'WITHDRAWN',
        updated_at = pg_catalog.now()
    WHERE id = _application_id;

    INSERT INTO public.application_stage_history (
        application_id,
        previous_status,
        new_status,
        changed_by,
        notes
    ) VALUES (
        _application_id,
        v_app.current_status::public.application_status,
        'WITHDRAWN',
        v_caller_uid,
        'Candidatura retirada pelo candidato (RF29)'
    );

    -- -------------------------------------------------------------------------
    -- 8. Sucesso
    -- -------------------------------------------------------------------------
    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'application_id', _application_id,
        'previous_status', v_app.current_status,
        'new_status', 'WITHDRAWN'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'withdraw_application failed [app_id: %]: % (SQLSTATE: %)',
            _application_id, SQLERRM, SQLSTATE;

        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INTERNAL_ERROR',
            'error_message', 'Erro interno ao processar a retirada de candidatura.'
        );
END;
$$;

-- ==============================================================================
-- PROPRIEDADE E PRIVILÉGIOS
-- ==============================================================================
ALTER FUNCTION public.withdraw_application(UUID) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.withdraw_application(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.withdraw_application(UUID) FROM anon;
GRANT  EXECUTE ON FUNCTION public.withdraw_application(UUID) TO authenticated;
