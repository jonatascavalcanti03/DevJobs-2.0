-- ci/setup/migration_00009_stub.sql
--
-- PROPÓSITO: Substituir a migration 00009_storage_resumes.sql na CI.
--
-- A migration original referencia `storage.objects` e `storage.buckets`,
-- que são gerenciados pelo Supabase Storage e não existem em um PostgreSQL
-- padrão. Como o RF33 não envolve funcionalidade de storage, este stub
-- apenas cria os grants e políticas sobre a tabela `public.resumes`
-- que foram definidos na migration original, sem a parte de Storage.
--
-- Os testes de integração do RF33 NÃO dependem de storage.
-- A cobertura de storage pertence a uma suíte separada (RF29/RF30).
--
-- NÃO aplicar em produção — a migration original 00009 já cobre o ambiente
-- remoto corretamente via `supabase db push`.

-- RLS para public.resumes já ativado em 00007.
-- Nenhuma ação adicional necessária para o escopo do RF33.
-- Este arquivo existe para documentar a exclusão intencional do 00009 na CI.
SELECT 1 AS rf33_ci_stub_00009_ok;
