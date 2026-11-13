-- RLS policy callers need EXECUTE. Role checks are scoped to the caller.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (_user_id = auth.uid() OR auth.role() = 'service_role')
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Assign the public account type once, during registration.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE NEW.raw_user_meta_data ->> 'signup_role'
      WHEN 'recruiter' THEN 'recruiter'::public.app_role
      WHEN 'institution' THEN 'institution'::public.app_role
      ELSE 'candidate'::public.app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, left(NEW.raw_user_meta_data ->> 'full_name', 200))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Remove the legacy bypass if the optional auto-confirm script was applied.
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
