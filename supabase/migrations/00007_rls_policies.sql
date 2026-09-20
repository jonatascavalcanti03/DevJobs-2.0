-- Migration 00007: RLS Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- FUNÇÃO AUXILIAR: get_user_company_role
-- ==============================================================================
-- OBJETIVO: Obter o papel ('OWNER', 'ADMIN', 'MEMBER') do usuário autenticado na empresa.
-- POR QUE SECURITY DEFINER?: Necessário para evitar o erro de "infinite recursion"
-- ao checar políticas de RLS dentro da própria tabela `company_members` ou em tabelas
-- encadeadas. O bypass temporário de RLS provido pelo Security Definer permite a leitura
-- isolada e imutável.
-- SEGURANÇA:
-- 1. search_path forçado para public.
-- 2. Restrito ao auth.uid() da sessão (o usuário não consegue ler dados de terceiros,
--    mesmo passando company_id arbitrário).
-- 3. Retorna apenas uma string de role, não expondo a tabela company_members.
-- 4. Revogado acesso público.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_company_role(_company_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.company_members
    WHERE company_id = _company_id
    AND user_id = auth.uid()
    LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_company_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_company_role(UUID) TO authenticated;

-- ==============================================================================
-- POLICIES
-- ==============================================================================

-- 1. USERS
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);

-- 2. CANDIDATE PROFILES (Público Controlado)
CREATE POLICY "Auth users can view candidate profiles" ON public.candidate_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Candidates can insert own profile" ON public.candidate_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Candidates can update own profile" ON public.candidate_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. CANDIDATE PROFILE COMPONENTS
-- SELECT: only the owning candidate OR a company member with an active application from this candidate
-- INSERT/UPDATE/DELETE: owner only (unchanged)

CREATE POLICY "Owners and recruiters can view experiences" ON public.experiences FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
        WHERE cp.id = candidate_id
        AND public.get_user_company_role(j.company_id) IS NOT NULL
    )
);
CREATE POLICY "Candidates can manage own experiences" ON public.experiences FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

CREATE POLICY "Owners and recruiters can view educations" ON public.educations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
        WHERE cp.id = candidate_id
        AND public.get_user_company_role(j.company_id) IS NOT NULL
    )
);
CREATE POLICY "Candidates can manage own educations" ON public.educations FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

CREATE POLICY "Owners and recruiters can view certifications" ON public.certifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
        WHERE cp.id = candidate_id
        AND public.get_user_company_role(j.company_id) IS NOT NULL
    )
);
CREATE POLICY "Candidates can manage own certifications" ON public.certifications FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

CREATE POLICY "Owners and recruiters can view languages" ON public.languages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
        WHERE cp.id = candidate_id
        AND public.get_user_company_role(j.company_id) IS NOT NULL
    )
);
CREATE POLICY "Candidates can manage own languages" ON public.languages FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

CREATE POLICY "Owners and recruiters can view projects" ON public.projects FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
        WHERE cp.id = candidate_id
        AND public.get_user_company_role(j.company_id) IS NOT NULL
    )
);
CREATE POLICY "Candidates can manage own projects" ON public.projects FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

-- 4. SKILLS & CANDIDATE SKILLS
CREATE POLICY "Auth users can view skills" ON public.skills FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can view candidate skills" ON public.candidate_skills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Candidates can manage own candidate skills" ON public.candidate_skills FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

-- 5. RESUMES (Privado)
CREATE POLICY "Candidates can view own resumes" ON public.resumes FOR SELECT USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));
CREATE POLICY "Candidates can manage own resumes" ON public.resumes FOR ALL USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));

-- 6. COMPANY PROFILES
CREATE POLICY "Auth users can view company profiles" ON public.company_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update company" ON public.company_profiles FOR UPDATE USING (public.get_user_company_role(id) IN ('OWNER', 'ADMIN'));

-- 7. COMPANY MEMBERS
CREATE POLICY "Members can view company members" ON public.company_members FOR SELECT USING (public.get_user_company_role(company_id) IS NOT NULL);
-- Backend only for INSERT/UPDATE/DELETE to prevent privilege escalation.

-- 8. COMPANY VERIFICATIONS
CREATE POLICY "Members can view company verification" ON public.company_verifications FOR SELECT USING (public.get_user_company_role(company_id) IS NOT NULL);
-- Insert/Update/Delete = Backend Only

-- 9. JOBS
CREATE POLICY "Auth users can view active jobs" ON public.jobs FOR SELECT USING (status = 'ACTIVE' OR public.get_user_company_role(company_id) IS NOT NULL);
CREATE POLICY "Admins can insert jobs" ON public.jobs FOR INSERT WITH CHECK (public.get_user_company_role(company_id) IN ('OWNER', 'ADMIN'));
CREATE POLICY "Admins can update jobs" ON public.jobs FOR UPDATE USING (public.get_user_company_role(company_id) IN ('OWNER', 'ADMIN'));
-- DELETE is intentionally omitted: RF18 lifecycle (DRAFT→ACTIVE→PAUSED→CLOSED) uses UPDATE, not hard delete.

-- 10. JOB SKILLS & JOB BENEFITS
CREATE POLICY "Auth users can view job skills" ON public.job_skills FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND (status = 'ACTIVE' OR public.get_user_company_role(company_id) IS NOT NULL)));
CREATE POLICY "Admins can manage job skills" ON public.job_skills FOR ALL USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.get_user_company_role(j.company_id) IN ('OWNER', 'ADMIN')));

CREATE POLICY "Auth users can view job benefits" ON public.job_benefits FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND (status = 'ACTIVE' OR public.get_user_company_role(company_id) IS NOT NULL)));
CREATE POLICY "Admins can manage job benefits" ON public.job_benefits FOR ALL USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.get_user_company_role(j.company_id) IN ('OWNER', 'ADMIN')));

-- 11. APPLICATIONS
CREATE POLICY "Candidates can view own applications" ON public.applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));
CREATE POLICY "Companies can view applications for their jobs" ON public.applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND public.get_user_company_role(j.company_id) IS NOT NULL));
CREATE POLICY "Candidates can insert own applications" ON public.applications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.candidate_profiles WHERE id = candidate_id AND user_id = auth.uid()));
-- UPDATE is Backend only to prevent mutation of candidate_id, job_id, or status by frontend. Withdraws go through backend.

-- 12. APPLICATION STAGE HISTORY
CREATE POLICY "Candidates can view own application history" ON public.application_stage_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.candidate_profiles cp ON a.candidate_id = cp.id WHERE a.id = application_id AND cp.user_id = auth.uid()));
CREATE POLICY "Companies can view application history for their jobs" ON public.application_stage_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.jobs j ON a.job_id = j.id WHERE a.id = application_id AND public.get_user_company_role(j.company_id) IS NOT NULL));

-- 13. INTERVIEWS
CREATE POLICY "Candidates can view own interviews" ON public.interviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.candidate_profiles cp ON a.candidate_id = cp.id WHERE a.id = application_id AND cp.user_id = auth.uid()));
CREATE POLICY "Companies can view interviews for their jobs" ON public.interviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.jobs j ON a.job_id = j.id WHERE a.id = application_id AND public.get_user_company_role(j.company_id) IS NOT NULL));
CREATE POLICY "Companies can manage interviews" ON public.interviews FOR ALL USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.jobs j ON a.job_id = j.id WHERE a.id = application_id AND public.get_user_company_role(j.company_id) IN ('OWNER', 'ADMIN')));

-- 14. INTERVIEW PARTICIPANTS
CREATE POLICY "Participants can view interview participants" ON public.interview_participants FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.interviews i JOIN public.applications a ON i.application_id = a.id JOIN public.jobs j ON a.job_id = j.id WHERE i.id = interview_id AND public.get_user_company_role(j.company_id) IS NOT NULL));
CREATE POLICY "Companies can manage interview participants" ON public.interview_participants FOR ALL USING (EXISTS (SELECT 1 FROM public.interviews i JOIN public.applications a ON i.application_id = a.id JOIN public.jobs j ON a.job_id = j.id WHERE i.id = interview_id AND public.get_user_company_role(j.company_id) IN ('OWNER', 'ADMIN')));

-- 15. INTERVIEW EVALUATIONS
CREATE POLICY "Companies can view interview evaluations" ON public.interview_evaluations FOR SELECT USING (EXISTS (SELECT 1 FROM public.interviews i JOIN public.applications a ON i.application_id = a.id JOIN public.jobs j ON a.job_id = j.id WHERE i.id = interview_id AND public.get_user_company_role(j.company_id) IS NOT NULL));
CREATE POLICY "Evaluators can manage their own evaluations" ON public.interview_evaluations FOR ALL USING (evaluator_id = auth.uid() AND EXISTS (SELECT 1 FROM public.interviews i JOIN public.applications a ON i.application_id = a.id JOIN public.jobs j ON a.job_id = j.id WHERE i.id = interview_id AND public.get_user_company_role(j.company_id) IS NOT NULL));

-- 16. AUDIT LOGS
-- Backend (Service Role) only. No policies for frontend.
