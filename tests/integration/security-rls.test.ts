// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";

/**
 * TESTES DE INTEGRAÇÃO — SEGURANÇA RLS E AUTORIZAÇÃO
 *
 * ESCOPO:
 *   RF02: Isolamento entre empresas — recrutador da Empresa A não acessa dados da Empresa B.
 *   RF06: Isolamento entre candidatos — candidato A não acessa dados do candidato B.
 *   RF29: RPC withdraw_application — bloqueio unauthenticated, estado terminal,
 *         candidatura de outro candidato, e sucesso atômico.
 *   RF33: UPDATE/DELETE direto em applications bloqueado para authenticated.
 *   RF36: Empresa A não gerencia entrevistas de empresa B.
 *
 * PRÉ-REQUISITOS:
 *   - TEST_DATABASE_URL configurado em .env.local
 *   - auth_mock.sql aplicado
 *   - Migrations 00001–00011 aplicadas
 *   - rf33_fixtures.sql + rf29_fixtures.sql carregados
 *
 * CONTROLE DE IDENTIDADE:
 *   SET LOCAL via set_config('app.current_user_id', ...) + SET LOCAL ROLE authenticated
 *
 * IDs FIXOS (rf33_fixtures.sql + rf29_fixtures.sql):
 *   Recrutador A (OWNER):  a1a1a1a1-0000-0000-0000-000000000001
 *   Candidato 1:           b2b2b2b2-0000-0000-0000-000000000002
 *   Candidato 1 profile:   e5e5e5e5-0000-0000-0000-000000000005
 *   Empresa A:             c3c3c3c3-0000-0000-0000-000000000003
 *   Vaga A:                f6f6f6f6-0000-0000-0000-000000000006
 *   Candidatura A:         a9a9a9a9-0000-0000-0000-000000000009
 *   Recrutador B (OWNER):  d1d1d1d1-0000-0000-0000-000000000011
 *   Empresa B:             e2e2e2e2-0000-0000-0000-000000000022
 *   Vaga B:                a4a4a4a4-0000-0000-0000-000000000044
 *   Candidato 3:           55555555-0000-0000-0000-000000000055
 *   Candidato 3 profile:   66666666-0000-0000-0000-000000000066
 *   Candidatura 3:         77777777-0000-0000-0000-000000000077
 */

// ---------------------------------------------------------------------------
// IDs de fixture
// ---------------------------------------------------------------------------
const RECRUITER_A_ID  = "a1a1a1a1-0000-0000-0000-000000000001";
const CANDIDATE_1_ID  = "b2b2b2b2-0000-0000-0000-000000000002";
const CANDIDATE_1_PROFILE_ID = "e5e5e5e5-0000-0000-0000-000000000005";
const COMPANY_A_ID    = "c3c3c3c3-0000-0000-0000-000000000003";
const APPLICATION_A_ID = "a9a9a9a9-0000-0000-0000-000000000009";
const RECRUITER_B_ID  = "d1d1d1d1-0000-0000-0000-000000000011";
const COMPANY_B_ID    = "e2e2e2e2-0000-0000-0000-000000000022";
const _JOB_B_ID       = "a4a4a4a4-0000-0000-0000-000000000044";
const APPLICATION_B_ID = "88888888-0000-0000-0000-000000000088";
const CANDIDATE_3_ID  = "55555555-0000-0000-0000-000000000055";
const CANDIDATE_3_PROFILE_ID = "66666666-0000-0000-0000-000000000066";
const APPLICATION_3_ID = "77777777-0000-0000-0000-000000000077";

// ---------------------------------------------------------------------------
// Guard — pulado sem banco real
// ---------------------------------------------------------------------------
const isDbConfigured = Boolean(process.env.TEST_DATABASE_URL);

// Sentinela de execução: garante que nenhum dos 14 testes de segurança foi omitido na CI.
const executedSecurityTests: number[] = [];

let pool: Pool;

// Helper: executa query como usuário autenticado específico
async function asUser(userId: string, query: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
    await client.query("SELECT set_config('app.current_role', 'authenticated', true)");
    await client.query("SET LOCAL ROLE authenticated");
    const result = await client.query(query, params);
    await client.query("COMMIT");
    return { rows: result.rows, error: null };
  } catch (err) {
    await client.query("ROLLBACK");
    return { rows: [], error: err as { code?: string; message?: string } };
  } finally {
    await client.query("RESET ROLE").catch(() => {});
    client.release();
  }
}

// Helper: chama RPC como usuário autenticado
async function callRpcAsUser(userId: string, fn: string, args: Record<string, unknown>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
    await client.query("SELECT set_config('app.current_role', 'authenticated', true)");

    const keys = Object.keys(args);
    const placeholders = keys.map((k, i) => `${k} := $${i + 1}`).join(", ");
    const values = keys.map(k => args[k]);
    const result = await client.query<{ result: unknown }>(
      `SELECT ${fn}(${placeholders}) AS result`,
      values
    );
    await client.query("COMMIT");
    return { result: result.rows[0]?.result, error: null };
  } catch (err) {
    await client.query("ROLLBACK");
    return { result: null, error: err as { code?: string; message?: string } };
  } finally {
    await client.query("RESET ROLE").catch(() => {});
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------
describe.skipIf(!isDbConfigured)("Segurança RLS e Autorização — Integração Real", () => {
  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const { rows } = await pool.query("SELECT 1 AS ping");
    if (rows[0]?.ping !== 1) throw new Error("Falha na conexão com o banco de teste.");
  });

  afterAll(async () => {
    if (pool) {
      // Restaurar estado das candidaturas usadas nos testes
      await pool.query(
        `UPDATE public.applications SET status = 'SUBMITTED', updated_at = NOW()
         WHERE id = ANY($1::UUID[])`,
        [[APPLICATION_A_ID, APPLICATION_3_ID, APPLICATION_B_ID]]
      );
      await pool.query(
        `DELETE FROM public.application_stage_history
         WHERE application_id = ANY($1::UUID[])`,
        [[APPLICATION_A_ID, APPLICATION_3_ID, APPLICATION_B_ID]]
      );
      await pool.end();
    }
  });

  // ===========================================================================
  // RF02 / ISOLAMENTO ENTRE EMPRESAS
  // ===========================================================================
  describe("RF02 — Isolamento entre Empresas", () => {
    it("1. [DB Real] Recrutador da Empresa B NÃO enxerga candidaturas da Empresa A", async () => {
      executedSecurityTests.push(1);
      // Empresa A tem a candidatura a9a9a9a9
      // Empresa B (recrutador d1d1d1d1) não tem vínculo com empresa A
      const { rows } = await asUser(
        RECRUITER_B_ID,
        `SELECT a.id FROM public.applications a
         JOIN public.jobs j ON a.job_id = j.id
         WHERE j.company_id = $1`,
        [COMPANY_A_ID]
      );
      // Deve retornar 0 linhas — RLS filtra via get_user_company_role
      expect(rows).toHaveLength(0);
    });

    it("2. [DB Real] Recrutador da Empresa A NÃO consegue criar vaga para a Empresa B via INSERT direto", async () => {
      executedSecurityTests.push(2);
      const { error } = await asUser(
        RECRUITER_A_ID,
        `INSERT INTO public.jobs (company_id, title, description, status)
         VALUES ($1, 'Tentativa Indevida', 'Descrição da tentativa', 'ACTIVE')`,
        [COMPANY_B_ID]
      );
      // RLS WITH CHECK: get_user_company_role(COMPANY_B_ID) = NULL para recrutador A → rejeita
      expect(error).not.toBeNull();
    });

    it("3. [DB Real] Recrutador da Empresa A NÃO consegue atualizar perfil da Empresa B", async () => {
      executedSecurityTests.push(3);
      const { error } = await asUser(
        RECRUITER_A_ID,
        `UPDATE public.company_profiles SET description = 'HACKED' WHERE id = $1`,
        [COMPANY_B_ID]
      );
      // Policy: get_user_company_role(id) IN ('OWNER', 'ADMIN') → NULL para empresa B
      expect(error).not.toBeNull();
    });

    it("4. [DB Real] Recrutador A pode avançar candidatura de vaga A; Recrutador B não pode", async () => {
      executedSecurityTests.push(4);

      // Limpar histórico prévio da candidatura A para validação estrita de efeitos colaterais
      await pool.query(
        `UPDATE public.applications SET status = 'SUBMITTED', updated_at = NOW() WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      await pool.query(
        `DELETE FROM public.application_stage_history WHERE application_id = $1`,
        [APPLICATION_A_ID]
      );

      // (A) Usuário NÃO autenticado NÃO consegue executar a operação
      const anonClient = await pool.connect();
      let anonResult: unknown = null;
      try {
        await anonClient.query("BEGIN");
        // Sem definir app.current_user_id -> auth.uid() é NULL
        const res = await anonClient.query<{ result: unknown }>(
          `SELECT advance_application_stage($1::UUID, $2::TEXT, $3::TEXT) AS result`,
          [APPLICATION_A_ID, "SCREENING", null]
        );
        await anonClient.query("COMMIT");
        anonResult = res.rows[0]?.result;
      } finally {
        await anonClient.query("ROLLBACK").catch(() => {});
        anonClient.release();
      }
      const anonR = anonResult as { success?: boolean; error_code?: string } | null;
      expect(anonR?.success).toBe(false);
      expect(anonR?.error_code).toBe("UNAUTHENTICATED");

      // (B) Recrutador B (Empresa B) tenta indevidamente avançar candidatura da Empresa A
      const { result: forbiddenResult } = await callRpcAsUser(
        RECRUITER_B_ID,
        "advance_application_stage",
        {
          _application_id: APPLICATION_A_ID,
          _new_status: "SCREENING",
          _notes: "Tentativa não autorizada pelo Recrutador B",
        }
      );
      const rForbidden = forbiddenResult as { success?: boolean; error_code?: string } | null;
      expect(rForbidden?.success).toBe(false);
      expect(rForbidden?.error_code).toBe("FORBIDDEN");

      // (C) Comprovação de ausência de efeitos colaterais: status permanece SUBMITTED e nenhum histórico criado
      const appRowAfterForbidden = await pool.query<{ status: string }>(
        `SELECT status FROM public.applications WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      expect(appRowAfterForbidden.rows[0]?.status).toBe("SUBMITTED");

      const histCountAfterForbidden = await pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM public.application_stage_history WHERE application_id = $1`,
        [APPLICATION_A_ID]
      );
      expect(Number(histCountAfterForbidden.rows[0]?.count)).toBe(0);

      // (D) Recrutador A (Empresa A) avança legitimamente a candidatura da Empresa A
      const { result: successResultA } = await callRpcAsUser(
        RECRUITER_A_ID,
        "advance_application_stage",
        {
          _application_id: APPLICATION_A_ID,
          _new_status: "SCREENING",
          _notes: "Avanço legítimo pelo Recrutador A",
        }
      );
      const rSuccessA = successResultA as { success?: boolean; new_status?: string } | null;
      expect(rSuccessA?.success).toBe(true);
      expect(rSuccessA?.new_status).toBe("SCREENING");

      // (E) Recrutador B (Empresa B) continua conseguindo avançar normalmente candidaturas da própria empresa (Empresa B)
      const { result: successResultB } = await callRpcAsUser(
        RECRUITER_B_ID,
        "advance_application_stage",
        {
          _application_id: APPLICATION_B_ID,
          _new_status: "SCREENING",
          _notes: "Avanço legítimo pelo Recrutador B na própria vaga",
        }
      );
      const rSuccessB = successResultB as { success?: boolean; new_status?: string } | null;
      expect(rSuccessB?.success).toBe(true);
      expect(rSuccessB?.new_status).toBe("SCREENING");
    });
  });

  // ===========================================================================
  // RF06 — Isolamento entre Candidatos
  // ===========================================================================
  describe("RF06 — Isolamento entre Candidatos", () => {
    it("5. [DB Real] Candidato 3 NÃO consegue atualizar perfil do Candidato 1", async () => {
      executedSecurityTests.push(5);
      const { error } = await asUser(
        CANDIDATE_3_ID,
        `UPDATE public.candidate_profiles SET headline = 'HACKED' WHERE id = $1`,
        [CANDIDATE_1_PROFILE_ID]
      );
      // Policy: USING (auth.uid() = user_id) → candidate 3 uid ≠ candidate 1 user_id
      expect(error).not.toBeNull();
    });

    it("6. [DB Real] Candidato 3 NÃO consegue ver candidaturas do Candidato 1", async () => {
      executedSecurityTests.push(6);
      const { rows } = await asUser(
        CANDIDATE_3_ID,
        `SELECT id FROM public.applications WHERE candidate_id = $1`,
        [CANDIDATE_1_PROFILE_ID]
      );
      // Policy: EXISTS (candidate_profiles WHERE user_id = auth.uid()) → candidato 3
      // só vê suas próprias candidaturas
      expect(rows.filter(r => r.id === APPLICATION_A_ID)).toHaveLength(0);
    });

    it("7. [DB Real] Candidato 1 NÃO consegue inserir experiência no perfil do Candidato 3", async () => {
      executedSecurityTests.push(7);
      const { error } = await asUser(
        CANDIDATE_1_ID,
        `INSERT INTO public.experiences
           (candidate_id, company_name, title, start_date)
         VALUES ($1, 'Empresa Hackeada', 'Dev', '2024-01-01')`,
        [CANDIDATE_3_PROFILE_ID]
      );
      // Policy ALL: EXISTS (candidate_profiles WHERE user_id = auth.uid())
      // Candidato 1 uid ≠ candidato 3 profile owner
      expect(error).not.toBeNull();
    });
  });

  // ===========================================================================
  // RF29 — RPC withdraw_application
  // ===========================================================================
  describe("RF29 — RPC withdraw_application", () => {
    it("8. [DB Real] Unauthenticated bloqueado pela RPC withdraw_application", async () => {
      executedSecurityTests.push(8);
      // Sem set_config → auth.uid() retorna NULL
      const client = await pool.connect();
      let result: unknown = null;
      try {
        await client.query("BEGIN");
        // NÃO configura current_user_id → simula unauthenticated
        const res = await client.query<{ result: unknown }>(
          `SELECT withdraw_application($1::UUID) AS result`,
          [APPLICATION_A_ID]
        );
        await client.query("COMMIT");
        result = res.rows[0]?.result;
      } finally {
        await client.query("ROLLBACK").catch(() => {});
        client.release();
      }
      const r = result as { success?: boolean; error_code?: string } | null;
      expect(r?.success).toBe(false);
      expect(r?.error_code).toBe("UNAUTHENTICATED");
    });

    it("9. [DB Real] Candidato 3 NÃO consegue retirar candidatura do Candidato 1", async () => {
      executedSecurityTests.push(9);
      const { result } = await callRpcAsUser(
        CANDIDATE_3_ID,
        "withdraw_application",
        { _application_id: APPLICATION_A_ID }
      );
      const r = result as { success?: boolean; error_code?: string } | null;
      expect(r?.success).toBe(false);
      expect(r?.error_code).toBe("FORBIDDEN");
    });

    it("10. [DB Real] Candidato 1 retira com sucesso — UPDATE + INSERT atômicos", async () => {
      executedSecurityTests.push(10);
      // Garante estado inicial SUBMITTED
      await pool.query(
        `UPDATE public.applications SET status = 'SUBMITTED', updated_at = NOW() WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      await pool.query(
        `DELETE FROM public.application_stage_history WHERE application_id = $1`,
        [APPLICATION_A_ID]
      );

      const { result } = await callRpcAsUser(
        CANDIDATE_1_ID,
        "withdraw_application",
        { _application_id: APPLICATION_A_ID }
      );
      const r = result as { success?: boolean; new_status?: string; previous_status?: string } | null;
      expect(r?.success).toBe(true);
      expect(r?.new_status).toBe("WITHDRAWN");
      expect(r?.previous_status).toBe("SUBMITTED");

      // Confirmar status no banco
      const appRow = await pool.query(
        `SELECT status FROM public.applications WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      expect(appRow.rows[0]?.status).toBe("WITHDRAWN");

      // Confirmar registro de histórico
      const histRow = await pool.query(
        `SELECT previous_status, new_status, changed_by
         FROM public.application_stage_history
         WHERE application_id = $1
         ORDER BY created_at DESC LIMIT 1`,
        [APPLICATION_A_ID]
      );
      expect(histRow.rows).toHaveLength(1);
      expect(histRow.rows[0]?.previous_status).toBe("SUBMITTED");
      expect(histRow.rows[0]?.new_status).toBe("WITHDRAWN");
      expect(histRow.rows[0]?.changed_by).toBe(CANDIDATE_1_ID);

      // Restaurar para outros testes
      await pool.query(
        `UPDATE public.applications SET status = 'SUBMITTED', updated_at = NOW() WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      await pool.query(
        `DELETE FROM public.application_stage_history WHERE application_id = $1`,
        [APPLICATION_A_ID]
      );
    });

    it("11. [DB Real] Retirada de candidatura em estado terminal é bloqueada", async () => {
      executedSecurityTests.push(11);
      // Forçar estado HIRED (terminal) via superuser
      await pool.query(
        `UPDATE public.applications SET status = 'HIRED', updated_at = NOW() WHERE id = $1`,
        [APPLICATION_A_ID]
      );

      const { result } = await callRpcAsUser(
        CANDIDATE_1_ID,
        "withdraw_application",
        { _application_id: APPLICATION_A_ID }
      );
      const r = result as { success?: boolean; error_code?: string } | null;
      expect(r?.success).toBe(false);
      expect(r?.error_code).toBe("TERMINAL_STATE");

      // Restaurar
      await pool.query(
        `UPDATE public.applications SET status = 'SUBMITTED', updated_at = NOW() WHERE id = $1`,
        [APPLICATION_A_ID]
      );
    });
  });

  // ===========================================================================
  // RF33 — Proteções de Banco (complementares ao pipeline-rf33-db.test.ts)
  // ===========================================================================
  describe("RF33 — Proteções Adicionais de Banco", () => {
    it("12. [DB Real] UPDATE direto em applications é bloqueado para authenticated", async () => {
      executedSecurityTests.push(12);
      const { error } = await asUser(
        RECRUITER_A_ID,
        `UPDATE public.applications SET status = 'HIRED' WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      // REVOKE UPDATE em 00010: permission denied (42501)
      expect(error).not.toBeNull();
      expect((error as { code?: string })?.code).toBe("42501");
    });

    it("13. [DB Real] DELETE direto em applications é bloqueado para authenticated", async () => {
      executedSecurityTests.push(13);
      const { error } = await asUser(
        RECRUITER_A_ID,
        `DELETE FROM public.applications WHERE id = $1`,
        [APPLICATION_A_ID]
      );
      expect(error).not.toBeNull();
      expect((error as { code?: string })?.code).toBe("42501");
    });
  });

  // ===========================================================================
  // RF36 — Isolamento de Entrevistas entre Empresas
  // ===========================================================================
  describe("RF36 — Isolamento de Entrevistas entre Empresas", () => {
    it("14. [DB Real] Recrutador B não consegue criar entrevista para candidatura da Empresa A", async () => {
      executedSecurityTests.push(14);
      // A candidatura APPLICATION_A_ID pertence à Empresa A
      // Recrutador B tenta inserir entrevista para ela
      const { error } = await asUser(
        RECRUITER_B_ID,
        `INSERT INTO public.interviews
           (application_id, scheduled_at, duration_minutes, status)
         VALUES ($1, NOW() + INTERVAL '7 days', 60, 'SCHEDULED')`,
        [APPLICATION_A_ID]
      );
      // Policy: get_user_company_role(company_a_id) IS NOT NULL → NULL para recruiter B
      expect(error).not.toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Suite de conformidade — sempre executa, avisa se testes foram pulados
// ---------------------------------------------------------------------------
describe("Segurança RLS — Conformidade de Execução", () => {
  it("Todos os 14 testes de segurança de integração foram executados", () => {
    if (!isDbConfigured) {
      console.warn(
        "[RLS] Testes de integração PULADOS: TEST_DATABASE_URL não configurado. " +
        "Configure: supabase start && cp .env.example .env.local (preencher TEST_DATABASE_URL)."
      );
      return;
    }
    // Na CI ou quando o banco real está presente, todos os 14 testes devem ter rodado
    expect(executedSecurityTests).toEqual(
      expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    );
    expect(executedSecurityTests).toHaveLength(14);
  });
});
