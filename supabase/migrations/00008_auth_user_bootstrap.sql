-- Cria o registro público de identidade junto com o usuário do Supabase Auth.
-- O papel inicial é deliberadamente restrito a CANDIDATE: o contrato de
-- cadastro de empresa (RF02) permanece pendente de aprovação específica.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, LOWER(NEW.email), 'CANDIDATE')
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;
