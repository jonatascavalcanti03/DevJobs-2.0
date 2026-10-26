-- Migration 00010: RF33 — Pipeline de Candidaturas com Histórico Imutável de Etapas
--
-- PROBLEMA CORRIGIDO:
--   A implementação anterior realizava a atualização de `applications.status` e a
--   inserção em `application_stage_history` como duas operações independentes na
--   camada de aplicação (TypeScript). Se a segunda operação falhasse, o status já
--   teria sido alterado sem registro de histórico — violando o requisito de
--   imutabilidade e rastreabilidade do RF33.
--
-- SOLUÇÃO:
--   Função SECURITY DEFINER `advance_application_stage` que executa UPDATE +
--   INSERT em uma única transação PostgreSQL, com:
--     - Validação de autenticação (auth.uid())
--     - Validação de autorização (OWNER ou ADMIN da empresa responsável pela vaga)
--     - Bloqueio FOR UPDATE na linha da candidatura (evita race conditions)
--     - Validação de estados terminais no banco (não apenas na UI)
--     - `changed_by` derivado de auth.uid() — nunca confiado ao cliente
--     - Validação de tamanho de `notes` (máx 1.000 caracteres)
--     - search_path seguro: `pg_catalog, public` (pg_temp removido para impedir hijacking)
--     - Owner explícito: `postgres` com privilégios de bypass RLS controlados
--     - Privilégios mínimos: EXECUTE revogado de PUBLIC e anon, concedido apenas a `authenticated`
--     - Logging interno seguro com RAISE WARNING sem expor SQL, stack traces ou dados sensíveis
--     - Defesa em profundidade: REVOKE de mutações diretas em `applications` e `application_stage_history`
--       e políticas RLS AS RESTRICTIVE incondicionais (WITH CHECK (false) / USING (false)).
--
-- USO DE SECURITY DEFINER:
--   Necessário porque a função precisa:
--   1. Inserir em `application_stage_history`, onde mutações diretas por usuários
--      comuns são revogadas e bloqueadas por RLS AS RESTRICTIVE.
--   2. Atualizar `applications.status`, que também possui mutações diretas revogadas
--      para usuários comuns (a atualização de status de candidatura é exclusiva do backend).
--   A função atua como ponto único de controle auditável. O acesso ao auth.uid()
--   é estritamente verificado internamente, garantindo que o chamador só atue sobre
--   vagas da empresa em que possui papel OWNER ou ADMIN.

-- ==============================================================================
-- TRANSIÇÕES PERMITIDAS (Regra de Negócio — Decisão Registrada)
-- ==============================================================================
-- Estados TERMINAIS (nenhuma transição de SAÍDA permitida):
--   HIRED, REJECTED, WITHDRAWN, CLOSED
--
-- Transições PERMITIDAS entre estados não-terminais:
--
--   SUBMITTED   -> SCREENING, REJECTED, ADVANCING, CLOSED
--   SCREENING   -> INTERVIEW, REJECTED, ADVANCING, SUBMITTED, CLOSED
--   INTERVIEW   -> ADVANCING, REJECTED, SCREENING, CLOSED
--   ADVANCING   -> HIRED, REJECTED, INTERVIEW, CLOSED
--
-- DECISÃO TÉCNICA E IMPACTOS RELATIVOS AO STATUS 'CLOSED':
--   1. 'CLOSED' representa o encerramento do processo seletivo ou da oportunidade.
--   2. Anteriormente, havia uma inconsistência entre o comentário e a matriz de
--      transições, pois 'CLOSED' não constava como destino válido a partir dos
--      estados ativos.
--   3. DECISÃO REGISTRADA: Qualquer candidatura em estado ativo (SUBMITTED, SCREENING,
--      INTERVIEW, ADVANCING) pode ser movida para 'CLOSED' pela empresa gestora
--      (por exemplo, quando a vaga é encerrada sem preenchimento ou o processo seletivo
--      é cancelado).
--   4. IMPACTO: Uma vez transicionada para 'CLOSED', a candidatura torna-se terminal
--      (bloqueada em v_terminal_states) e não pode mais retornar a nenhum outro estado.

-- ==============================================================================
-- FUNÇÃO: advance_application_stage
-- ==============================================================================
DROP FUNCTION IF EXISTS public.advance_application_stage(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.advance_application_stage(
    _application_id  UUID,
    _new_status      TEXT,
    _notes           TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_caller_uid        UUID;
    v_company_role      TEXT;
    v_app               RECORD;
    v_company_id        UUID;
    v_terminal_states   TEXT[] := ARRAY['HIRED', 'REJECTED', 'WITHDRAWN', 'CLOSED'];
    v_valid_statuses    TEXT[] := ARRAY['SUBMITTED', 'SCREENING', 'INTERVIEW', 'ADVANCING', 'HIRED', 'REJECTED', 'WITHDRAWN', 'CLOSED'];
    v_allowed_transitions JSONB := '{
        "SUBMITTED":  ["SCREENING", "REJECTED", "ADVANCING", "CLOSED"],
        "SCREENING":  ["INTERVIEW", "REJECTED", "ADVANCING", "SUBMITTED", "CLOSED"],
        "INTERVIEW":  ["ADVANCING", "REJECTED", "SCREENING", "CLOSED"],
        "ADVANCING":  ["HIRED", "REJECTED", "INTERVIEW", "CLOSED"]
    }'::JSONB;
BEGIN
    -- -------------------------------------------------------------------------
    -- 1. Autenticação: obter auth.uid() do contexto da sessão
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
    -- 2. Validação básica de parâmetros de entrada
    -- -------------------------------------------------------------------------
    IF _application_id IS NULL THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_PARAMS',
            'error_message', 'ID da candidatura é obrigatório.'
        );
    END IF;

    IF NOT (_new_status = ANY(v_valid_statuses)) THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_STATUS',
            'error_message', 'Status de candidatura inválido.'
        );
    END IF;

    IF _notes IS NOT NULL AND pg_catalog.length(_notes) > 1000 THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'NOTES_TOO_LONG',
            'error_message', 'O campo de observações não pode ultrapassar 1.000 caracteres.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 3. Obter candidatura com bloqueio FOR UPDATE (previne race conditions)
    --    Obter também o company_id via JOIN com jobs
    -- -------------------------------------------------------------------------
    SELECT
        a.id,
        a.status::TEXT       AS current_status,
        a.job_id,
        j.company_id
    INTO v_app
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = _application_id
    FOR UPDATE OF a;

    IF NOT FOUND THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'NOT_FOUND',
            'error_message', 'Candidatura não encontrada.'
        );
    END IF;

    v_company_id := v_app.company_id;

    -- -------------------------------------------------------------------------
    -- 4. Autorização: verificar papel do caller na empresa responsável pela vaga
    --    Reutiliza get_user_company_role que já é SECURITY DEFINER com search_path
    -- -------------------------------------------------------------------------
    v_company_role := public.get_user_company_role(v_company_id);

    IF v_company_role IS NULL OR v_company_role NOT IN ('OWNER', 'ADMIN') THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'FORBIDDEN',
            'error_message', 'Permissão insuficiente. Apenas proprietários ou administradores podem executar esta ação.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 5. Validar estado terminal: se já está em estado terminal, rejeitar
    -- -------------------------------------------------------------------------
    IF v_app.current_status = ANY(v_terminal_states) THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'TERMINAL_STATE',
            'error_message', 'Esta candidatura está em um estado terminal e não pode ser alterada.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 6. Validar transição permitida
    -- -------------------------------------------------------------------------
    IF NOT (
        v_allowed_transitions ? v_app.current_status
        AND (v_allowed_transitions -> v_app.current_status) @> pg_catalog.to_jsonb(_new_status)
    ) THEN
        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_TRANSITION',
            'error_message', 'Transição de estado não permitida: ' || v_app.current_status || ' para ' || _new_status || '.'
        );
    END IF;

    -- -------------------------------------------------------------------------
    -- 7. Atualizar status da candidatura
    --    (Ambas as operações abaixo estão na mesma transação PostgreSQL.
    --     Se qualquer EXCEPTION ocorrer, o ROLLBACK é automático.)
    -- -------------------------------------------------------------------------
    UPDATE public.applications
    SET
        status     = _new_status::public.application_status,
        updated_at = pg_catalog.now()
    WHERE id = _application_id;

    -- -------------------------------------------------------------------------
    -- 8. Inserir registro de histórico imutável
    --    changed_by = auth.uid() — nunca controlado pelo cliente
    -- -------------------------------------------------------------------------
    INSERT INTO public.application_stage_history (
        application_id,
        previous_status,
        new_status,
        changed_by,
        notes
    ) VALUES (
        _application_id,
        v_app.current_status::public.application_status,
        _new_status::public.application_status,
        v_caller_uid,
        NULLIF(pg_catalog.btrim(_notes), '')
    );

    -- -------------------------------------------------------------------------
    -- 9. Retornar sucesso
    -- -------------------------------------------------------------------------
    RETURN pg_catalog.jsonb_build_object(
        'success', true,
        'application_id', _application_id,
        'previous_status', v_app.current_status,
        'new_status', _new_status
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Logging seguro interno no servidor PostgreSQL (não expõe SQL nem dados pessoais ao cliente)
        RAISE WARNING 'advance_application_stage failed [app_id: %, new_status: %]: % (SQLSTATE: %)',
            _application_id, _new_status, SQLERRM, SQLSTATE;

        RETURN pg_catalog.jsonb_build_object(
            'success', false,
            'error_code', 'INTERNAL_ERROR',
            'error_message', 'Erro interno ao processar a transição de candidatura.'
        );
END;
$$;

-- ==============================================================================
-- PROPRIEDADE E PRIVILÉGIOS DA FUNÇÃO
-- ==============================================================================
ALTER FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.advance_application_stage(UUID, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- BLINDAGEM DE PRIVILÉGIOS SQL E RLS: applications e application_stage_history
--
-- DEFESA EM PROFUNDIDADE:
-- 1. Nível de Grants SQL:
--    - Revogamos explicitamente privilégios diretos de UPDATE, DELETE e TRUNCATE em
--      `applications` para PUBLIC, anon e authenticated.
--    - Revogamos explicitamente privilégios diretos de INSERT, UPDATE, DELETE e TRUNCATE
--      em `application_stage_history` para PUBLIC, anon e authenticated.
--    - Usuários autenticados retêm apenas SELECT em `application_stage_history` e
--      SELECT/INSERT em `applications` (necessário para o fluxo de candidatura RF29).
-- 2. Nível de Políticas RLS:
--    - Políticas com 'AS RESTRICTIVE' usam conjunção lógica (AND).
--    - Políticas RESTRICTIVE com 'USING (false)' e 'WITH CHECK (false)' garantem
--      que nenhuma mutação direta de histórico ocorra via API, independente de
--      qualquer política permissiva presente ou futura.
-- ==============================================================================

-- Revogação de escrita direta em public.applications
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.applications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.applications TO authenticated;

-- Revogação de escrita direta em public.application_stage_history
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.application_stage_history FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.application_stage_history TO authenticated;

-- Políticas RLS RESTRICTIVE incondicionais contra mutação direta no histórico
DROP POLICY IF EXISTS "Block authenticated insert on application history" ON public.application_stage_history;
CREATE POLICY "Block authenticated insert on application history"
ON public.application_stage_history
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block authenticated update on application history" ON public.application_stage_history;
CREATE POLICY "Block authenticated update on application history"
ON public.application_stage_history
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false);

DROP POLICY IF EXISTS "Block authenticated delete on application history" ON public.application_stage_history;
CREATE POLICY "Block authenticated delete on application history"
ON public.application_stage_history
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);
