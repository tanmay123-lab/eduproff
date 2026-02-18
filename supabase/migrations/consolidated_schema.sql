-- =====================================================
-- EduProof Database Schema - Complete Migration
-- =====================================================
-- This file consolidates all required tables and policies
-- for the EduProof credential verification platform
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Create role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('candidate', 'recruiter', 'institution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CORE TABLES
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Institutions table (for institution-specific data)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    institution_name TEXT NOT NULL,
    institution_id TEXT UNIQUE NOT NULL,
    official_email TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. CERTIFICATES TABLES
-- =====================================================

-- Candidate-uploaded certificates (for verification)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    certificate_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verification_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Institution-issued certificates (official records)
CREATE TABLE IF NOT EXISTS public.issued_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    candidate_email TEXT NOT NULL,
    certificate_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    unique_id TEXT UNIQUE NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'active' CHECK (verification_status IN ('active', 'revoked', 'expired')),
    file_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. VERIFICATION & LOGGING TABLES
-- =====================================================

-- Verification logs (track who verified what)
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id UUID NOT NULL,
    verifier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verifier_role app_role NOT NULL,
    verification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_institutions_updated_at ON public.institutions;
CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_issued_certificates_updated_at ON public.issued_certificates;
CREATE TRIGGER update_issued_certificates_updated_at
BEFORE UPDATE ON public.issued_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Institutions indexes
CREATE INDEX IF NOT EXISTS idx_institutions_user_id ON public.institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_institution_id ON public.institutions(institution_id);

-- Certificates indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_status ON public.certificates(verification_status);

-- Issued certificates indexes
CREATE INDEX IF NOT EXISTS idx_issued_certificates_institution_id ON public.issued_certificates(institution_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_unique_id ON public.issued_certificates(unique_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_candidate_email ON public.issued_certificates(candidate_email);

-- Verification logs indexes
CREATE INDEX IF NOT EXISTS idx_verification_logs_certificate_id ON public.verification_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_verifier_id ON public.verification_logs(verifier_id);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY; -- System table

-- =====================================================
-- 9. RLS POLICIES - PROFILES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.profiles;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can view candidate profiles" 
ON public.profiles FOR SELECT 
USING (public.has_role(auth.uid(), 'recruiter'));

-- =====================================================
-- 10. RLS POLICIES - USER ROLES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

CREATE POLICY "Users can view own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" 
ON public.user_roles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 11. RLS POLICIES - INSTITUTIONS
-- =====================================================

DROP POLICY IF EXISTS "Institutions can view own data" ON public.institutions;
DROP POLICY IF EXISTS "Institutions can update own data" ON public.institutions;
DROP POLICY IF EXISTS "Institutions can insert own data" ON public.institutions;

CREATE POLICY "Institutions can view own data" 
ON public.institutions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Institutions can update own data" 
ON public.institutions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Institutions can insert own data" 
ON public.institutions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 12. RLS POLICIES - CERTIFICATES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can update own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Recruiters can view all certificates" ON public.certificates;

CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates"
ON public.certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates"
ON public.certificates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can view all certificates"
ON public.certificates FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter'));

-- =====================================================
-- 13. RLS POLICIES - ISSUED CERTIFICATES
-- =====================================================

DROP POLICY IF EXISTS "Institutions can insert certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Institutions can view own certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Recruiters can view all issued certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Public can verify certificates by unique_id" ON public.issued_certificates;

CREATE POLICY "Institutions can insert certificates"
ON public.issued_certificates FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.institutions
        WHERE institutions.id = issued_certificates.institution_id
        AND institutions.user_id = auth.uid()
    )
);

CREATE POLICY "Institutions can view own certificates"
ON public.issued_certificates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.institutions
        WHERE institutions.id = institution_id
        AND institutions.user_id = auth.uid()
    )
);

CREATE POLICY "Recruiters can view all issued certificates"
ON public.issued_certificates FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Candidates can view own certificates"
ON public.issued_certificates FOR SELECT
USING (
    auth.email() = candidate_email
    OR public.has_role(auth.uid(), 'candidate')
);

-- =====================================================
-- 14. RLS POLICIES - VERIFICATION LOGS
-- =====================================================

DROP POLICY IF EXISTS "Recruiters can insert verification logs" ON public.verification_logs;
DROP POLICY IF EXISTS "Users can view own verification logs" ON public.verification_logs;
DROP POLICY IF EXISTS "Institutions can view logs for their certificates" ON public.verification_logs;

CREATE POLICY "Recruiters can insert verification logs"
ON public.verification_logs FOR INSERT
WITH CHECK (
    auth.uid() = verifier_id
    AND public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Users can view own verification logs"
ON public.verification_logs FOR SELECT
USING (auth.uid() = verifier_id);

CREATE POLICY "Institutions can view logs for their certificates"
ON public.verification_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.issued_certificates ic
        JOIN public.institutions i ON i.id = ic.institution_id
        WHERE ic.id::text = verification_logs.certificate_id::text
        AND i.user_id = auth.uid()
    )
);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
