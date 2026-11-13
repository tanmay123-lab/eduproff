import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SignupRole = "candidate" | "recruiter" | "institution";
export type UserRole = SignupRole | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  recovering: boolean;
  signUp: (email: string, password: string, fullName: string, role: SignupRole) => Promise<{ error: Error | null; confirmationRequired: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return error ? null : data?.role ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [recovering, setRecovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key === "eduproof_cached_session_user" || key === "eduproof_cached_session" ||
            key.startsWith("eduproof_cached_role_")) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Supabase manages its own session storage.
    }

    let pending: ReturnType<typeof setTimeout> | undefined;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (!currentSession) setRecovering(false);
      clearTimeout(pending);
      const currentRevision = ++revision;
      setSession(currentSession);
      setRole(null);
      setLoading(Boolean(currentSession));
      if (!currentSession) return;

      // Run the database request after Supabase releases its auth lock.
      pending = setTimeout(async () => {
        let nextRole: UserRole = null;
        try {
          nextRole = await fetchRole(currentSession.user.id);
        } catch {
          // Keep protected routes closed when role lookup fails.
        } finally {
          if (revision === currentRevision) {
            setRole(nextRole);
            setLoading(false);
          }
        }
      }, 0);
    });

    return () => {
      revision++;
      clearTimeout(pending);
      subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextType["signUp"] = async (email, password, fullName, selectedRole) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim(), signup_role: selectedRole } },
    });
    return { error, confirmationRequired: !error && !data.session };
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return { error: error ?? new Error("Sign-in failed"), role: null };
    return { error: null, role: await fetchRole(data.user.id) };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Could not sign out", description: "Please try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Signed out" });
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, role, loading, recovering, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
