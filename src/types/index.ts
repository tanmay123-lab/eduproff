import { User, Session } from "@supabase/supabase-js";

// User Roles
export type UserRole = "candidate" | "recruiter" | "institution";

// Auth Types
export interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
}

// Profile Types
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

// Institution Types
export interface Institution {
  id: string;
  user_id: string;
  institution_name: string;
  institution_id: string;
  official_email: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// Certificate Types
export type CertificateType = "degree" | "diploma" | "certificate" | "course" | "training";
export type CertificateStatus = "active" | "revoked" | "expired";
export type VerificationStatus = "pending" | "verified" | "failed";

export interface Certificate {
  id: string;
  institution_id?: string;
  candidate_id: string;
  certificate_type: CertificateType;
  title: string;
  description?: string;
  issue_date: string;
  expiry_date?: string | null;
  unique_id: string;
  metadata?: Record<string, unknown>;
  status: CertificateStatus;
  created_at: string;
  updated_at: string;
}

export interface IssuedCertificate {
  id: string;
  institution_id: string;
  candidate_email: string;
  certificate_type: CertificateType;
  title: string;
  description?: string;
  issue_date: string;
  expiry_date?: string | null;
  unique_id: string;
  verification_status: VerificationStatus;
  file_path?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Verification Types
export interface VerificationLog {
  id: string;
  certificate_id: string;
  verifier_id: string;
  verifier_role: UserRole;
  verification_date: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  total: number;
  pending?: number;
  verified?: number;
  failed?: number;
  active?: number;
  revoked?: number;
  expired?: number;
}

// Form Types
export interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  institutionName?: string;
  institutionId?: string;
  companyName?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface IssueCertificateFormData {
  candidateEmail: string;
  certificateType: CertificateType;
  title: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
}

// Component Props Types
export interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface DataTableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  cell?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  requiresRole?: UserRole[];
}
