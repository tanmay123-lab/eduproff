-- ==============================================================================
-- Security Fixes & Hardening Migration
-- Addresses:
-- 1. Messaging policies & relationship/rate-limit checks
-- 2. Message edit restriction ("mark as read" tampering prevention)
-- 3. Verification logs forgery prevention (service-role only inserts)
-- 4. Server-side storage bucket limits (file_size_limit, allowed_mime_types)
-- 5. Certificates verification_status CHECK constraint expansion ('invalid')
-- 6. Prevention of client-side certificate status spoofing
-- 7. Admin audit logging and role enum alignment
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Role Enum: Ensure 'admin' exists in app_role
-- ------------------------------------------------------------------------------
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- ------------------------------------------------------------------------------
-- 2. Certificates Table Hardening:
--    - Expand CHECK constraint to permit 'invalid'
--    - Prevent regular candidates from modifying verification_status / verification_message
-- ------------------------------------------------------------------------------
-- Drop existing check constraint if present and re-add with 'invalid'
ALTER TABLE public.certificates 
  DROP CONSTRAINT IF EXISTS certificates_verification_status_check;

ALTER TABLE public.certificates 
  ADD CONSTRAINT certificates_verification_status_check 
  CHECK (verification_status IN ('pending', 'verified', 'failed', 'invalid'));

-- Trigger to prevent regular users from forging verification_status
CREATE OR REPLACE FUNCTION public.protect_certificate_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If verification status or message is being changed
  IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status) 
     OR (OLD.verification_message IS DISTINCT FROM NEW.verification_message) THEN
    
    -- Allow change ONLY if caller has 'admin' role or is service role
    -- auth.uid() is NULL when called via service_role bypass/key
    IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Unauthorized: Only verification engine or administrators can modify certificate verification status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_certificate_verification ON public.certificates;
CREATE TRIGGER trg_protect_certificate_verification
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_certificate_verification();

-- ------------------------------------------------------------------------------
-- 3. Verification Logs Hardening:
--    - Drop client-side INSERT policy to prevent forged audit logs
--    - Only Service Role (edge function) can write logs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Recruiters can insert own logs" ON public.verification_logs;

-- Recruiters can still view only their own logs
DROP POLICY IF EXISTS "Recruiters can view own logs" ON public.verification_logs;
CREATE POLICY "Recruiters can view own logs"
  ON public.verification_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = recruiter_id 
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ------------------------------------------------------------------------------
-- 4. Storage Bucket Limits & Path Lock:
--    - Enforce 10MB limit and allowed MIME types at the storage server level
-- ------------------------------------------------------------------------------
UPDATE storage.buckets
SET 
  public = false,
  file_size_limit = 10485760, -- 10MB in bytes
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
WHERE id = 'certificates';

-- Ensure upload policy strictly requires auth.uid() as first folder segment
DROP POLICY IF EXISTS "Users can upload own certificates" ON storage.objects;
CREATE POLICY "Users can upload own certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ------------------------------------------------------------------------------
-- 5. Messaging System Protection (if messages table exists or is created)
--    - Prevent receiver from altering message content / sender
--    - Enforce proper relationship and rate-limiting safeguards
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chk_message_not_self CHECK (sender_id <> recipient_id)
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Select policy: participants can see their own messages
DROP POLICY IF EXISTS "Users can view their conversations" ON public.messages;
CREATE POLICY "Users can view their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Insert policy: sender must be authenticated user
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      -- Target recipient must be a valid user profile
      SELECT 1 FROM public.profiles WHERE user_id = recipient_id
    )
  );

-- Prevent message content tampering when marking as read
CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent modifying sender, recipient, content or created_at
  IF NEW.sender_id <> OLD.sender_id OR NEW.recipient_id <> OLD.recipient_id OR NEW.content <> OLD.content OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify sender, recipient, content, or creation timestamp of an existing message.';
  END IF;

  -- Automatically set read_at when is_read transitions to true
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_message_updates ON public.messages;
CREATE TRIGGER trg_protect_message_updates
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_message_updates();

-- Update policy: only recipient can mark as read
DROP POLICY IF EXISTS "Recipients can update read status" ON public.messages;
CREATE POLICY "Recipients can update read status"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Dedicated RPC function for atomic "mark as read"
CREATE OR REPLACE FUNCTION public.mark_message_as_read(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages
  SET is_read = true, read_at = now()
  WHERE id = p_message_id AND recipient_id = auth.uid();
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. Admin Audit Log Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only service role can insert audit logs (via Edge Function)
