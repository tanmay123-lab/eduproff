import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BrandingPanel } from "@/components/auth/BrandingPanel";
import { AuthForm } from "@/components/auth/AuthForm";
import { Shield } from "lucide-react";

export default function Auth() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      switch (role) {
        case "candidate":
          navigate("/student");
          break;
        case "recruiter":
          navigate("/recruiter");
          break;
        case "institution":
          navigate("/institution");
          break;
      }
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-background">
      {/* Left: Branding */}
      <BrandingPanel />

      {/* Right: Auth form */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        <div className="relative z-10 w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              EduProff
            </span>
          </div>

          <AuthForm />
        </div>
      </div>
    </main>
  );
}
