-- =========================================================================
-- SECURITY REMEDIATION MIGRATION (Audit Fixes #1, #2, #4, #5, #7, #8, #10)
-- =========================================================================

-- 1. FIX #1: Prevent Role Manipulation on user_roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. FIX #2: Prevent Client-Side Certificate Status Tampering
CREATE OR REPLACE FUNCTION public.protect_certificate_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status) OR
       (OLD.verification_message IS DISTINCT FROM NEW.verification_message) THEN
      RAISE EXCEPTION 'Unauthorized: verification_status can only be modified by the verification service.';
    END IF;
    IF OLD.user_id <> NEW.user_id OR OLD.id <> NEW.id THEN
      RAISE EXCEPTION 'Unauthorized: user_id and certificate ID cannot be altered.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_certificate_verification_status ON public.certificates;
CREATE TRIGGER trg_protect_certificate_verification_status
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.protect_certificate_verification_status();

-- 3. FIX #4: Close Bulk PII Exposure on profiles & issued_certificates
-- Drop the overly permissive policy added in migration 20260210083858
DROP POLICY IF EXISTS "Authenticated users only" ON public.profiles;

-- Ensure users can only view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only verified recruiters can view candidate profiles
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.profiles;
CREATE POLICY "Recruiters can view candidate profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'recruiter'::app_role));

-- Ensure issued_certificates does not have public read
DROP POLICY IF EXISTS "Public can view issued certificates" ON public.issued_certificates;

-- 4. FIX #5: Secure Storage Buckets
UPDATE storage.buckets
SET public = false
WHERE id = 'certificates';

DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

-- 5. FIX #7: Prevent Non-Service-Role Modifying Sensitive Profile Identity
CREATE OR REPLACE FUNCTION public.protect_profile_system_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF OLD.user_id <> NEW.user_id OR OLD.id <> NEW.id THEN
      RAISE EXCEPTION 'Cannot alter profile identity or user_id.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_system_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_system_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_system_columns();

-- 6. FIX #8: Explicitly Grant EXECUTE on has_role
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon;

-- 7. FIX #10: Atomic Rate Limiter SQL Function (Fixes Race Condition)
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_key TEXT,
  p_window_ms BIGINT,
  p_max_requests INT
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INT,
  remaining INT,
  reset_time BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now BIGINT := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  v_window_start BIGINT := v_now - p_window_ms;
  v_record public.rate_limits%ROWTYPE;
BEGIN
  INSERT INTO public.rate_limits (key, count, window_start, updated_at)
  VALUES (p_key, 1, v_now, NOW())
  ON CONFLICT (key) DO UPDATE
  SET 
    count = CASE 
      WHEN rate_limits.window_start < v_window_start THEN 1 
      ELSE rate_limits.count + 1 
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < v_window_start THEN v_now 
      ELSE rate_limits.window_start 
    END,
    updated_at = NOW()
  RETURNING * INTO v_record;

  current_count := v_record.count;
  allowed := (v_record.count <= p_max_requests);
  remaining := GREATEST(0, p_max_requests - v_record.count);
  reset_time := v_record.window_start + p_window_ms;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, BIGINT, INT) TO service_role;
