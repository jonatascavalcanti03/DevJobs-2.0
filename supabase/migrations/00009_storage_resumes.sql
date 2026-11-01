-- Migration 00009: Storage bucket for candidate resumes and access policies
-- RF06: Armazenamento seguro de currículos em formato PDF.

-- 1. Criação do bucket privado 'resumes' caso não exista
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false,
    5242880, -- 5MB em bytes
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf'];

-- 2. Habilitação de RLS em storage.objects:
-- No Supabase, storage.objects é gerenciado pelo supabase_storage_admin e já possui
-- Row Level Security nativamente habilitado por padrão. Comandos ALTER TABLE diretos
-- falham com SQLSTATE 42501 (must be owner of table objects) ao rodar como role postgres.

-- 3. Políticas para o bucket 'resumes':
-- Formato do path do arquivo: candidate_<candidate_profile_id>/<resume_uuid>.pdf

-- 3.1. CANDIDATO: Upload de arquivo no próprio diretório
CREATE POLICY "Candidates can upload own resume storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
        SELECT 'candidate_' || id::text
        FROM public.candidate_profiles
        WHERE user_id = auth.uid()
    )
);

-- 3.2. CANDIDATO: Atualizar/substituir próprio arquivo
CREATE POLICY "Candidates can update own resume storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
        SELECT 'candidate_' || id::text
        FROM public.candidate_profiles
        WHERE user_id = auth.uid()
    )
);

-- 3.3. CANDIDATO: Excluir próprio arquivo
CREATE POLICY "Candidates can delete own resume storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
        SELECT 'candidate_' || id::text
        FROM public.candidate_profiles
        WHERE user_id = auth.uid()
    )
);

-- 3.4. LEITURA: Candidato proprietário OU Recrutador autorizado de empresa com candidatura ativa
CREATE POLICY "Candidates and authorized recruiters can read resume storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (
        -- O próprio candidato dono do arquivo
        (storage.foldername(name))[1] IN (
            SELECT 'candidate_' || id::text
            FROM public.candidate_profiles
            WHERE user_id = auth.uid()
        )
        OR
        -- Recrutador (OWNER ou ADMIN da empresa) onde o candidato possui candidatura ativa para vaga da empresa
        EXISTS (
            SELECT 1
            FROM public.applications a
            JOIN public.jobs j ON a.job_id = j.id
            JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
            WHERE ('candidate_' || cp.id::text) = (storage.foldername(storage.objects.name))[1]
            AND public.get_user_company_role(j.company_id) IS NOT NULL
        )
    )
);

-- 4. Atualização da política de SELECT em public.resumes para permitir leitura por recrutadores autorizados
DROP POLICY IF EXISTS "Candidates can view own resumes" ON public.resumes;

CREATE POLICY "Candidates and authorized recruiters can view resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.candidate_profiles
        WHERE id = candidate_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.candidate_profiles cp ON a.candidate_id = cp.id
        WHERE cp.id = candidate_id
        AND public.get_user_company_role(j.company_id) IS NOT NULL
    )
);
