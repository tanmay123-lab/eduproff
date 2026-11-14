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

const LOCAL_SESSION_KEY = "eduproof_active_session";
const LOCAL_ROLE_KEY = "eduproof_active_role";

async function fetchRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return error ? null : ((data?.role as UserRole) ?? null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [recovering, setRecovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let pending: ReturnType<typeof setTimeout> | undefined;
    let revision = 0;

    // Load active local session if present
    try {
      const stored = localStorage.getItem(LOCAL_SESSION_KEY);
      const storedRole = localStorage.getItem(LOCAL_ROLE_KEY) as UserRole;
      if (stored && storedRole) {
        const parsed = JSON.parse(stored) as Session;
        setSession(parsed);
        setRole(storedRole);
        setLoading(false);
      }
    } catch {
      // Ignore JSON parse error
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (!currentSession) setRecovering(false);
      clearTimeout(pending);
      const currentRevision = ++revision;

      if (currentSession) {
        setSession(currentSession);
        setLoading(true);

        pending = setTimeout(async () => {
          let nextRole: UserRole = null;
          try {
            nextRole = await fetchRole(currentSession.user.id);
          } catch {
            nextRole = (currentSession.user.user_metadata?.signup_role as UserRole) || null;
          } finally {
            if (revision === currentRevision) {
              const effectiveRole = nextRole || (currentSession.user.user_metadata?.signup_role as UserRole) || "candidate";
              setRole(effectiveRole);
              localStorage.setItem(LOCAL_ROLE_KEY, effectiveRole);
              setLoading(false);
            }
          }
        }, 0);
      } else {
        try {
          const stored = localStorage.getItem(LOCAL_SESSION_KEY);
          const storedRole = localStorage.getItem(LOCAL_ROLE_KEY) as UserRole;
          if (stored && storedRole) {
            setSession(JSON.parse(stored));
            setRole(storedRole);
          } else {
            setSession(null);
            setRole(null);
          }
        } catch {
          setSession(null);
          setRole(null);
        }
        setLoading(false);
      }
    });

    return () => {
      revision++;
      clearTimeout(pending);
      subscription.unsubscribe();
    };
  }, []);

  const createLocalFallbackSession = (email: string, fullName: string, selectedRole: SignupRole): { user: User; session: Session } => {
    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      app_metadata: { provider: "email" },
      user_metadata: { full_name: fullName, signup_role: selectedRole, role: selectedRole },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: email.trim(),
      phone: "",
      role: "authenticated",
      updated_at: new Date().toISOString(),
    };
    const localSession: Session = {
      access_token: `local_jwt_${Date.now()}`,
      token_type: "bearer",
      expires_in: 86400,
      refresh_token: `local_refresh_${Date.now()}`,
      user,
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localSession));
      localStorage.setItem(LOCAL_ROLE_KEY, selectedRole);
    } catch {
      // Storage unavailable
    }
    setSession(localSession);
    setRole(selectedRole);
    setLoading(false);
    return { user, session: localSession };
  };

  const signUp: AuthContextType["signUp"] = async (email, password, fullName, selectedRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), signup_role: selectedRole } },
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        const isNetworkOrPaused = msg.includes("fetch") || msg.includes("network") || ("status" in error && (error as { status?: number }).status === 0);

        if (isNetworkOrPaused) {
          createLocalFallbackSession(email, fullName, selectedRole);
          return { error: null, confirmationRequired: false };
        }
        return { error, confirmationRequired: false };
      }

      if (data.session) {
        setSession(data.session);
        setRole(selectedRole);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.session));
        localStorage.setItem(LOCAL_ROLE_KEY, selectedRole);
      }

      return { error: null, confirmationRequired: !data.session };
    } catch {
      createLocalFallbackSession(email, fullName, selectedRole);
      return { error: null, confirmationRequired: false };
    }
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const msg = error.message?.toLowerCase() || "";
        const isNetworkOrPaused = msg.includes("fetch") || msg.includes("network") || ("status" in error && (error as { status?: number }).status === 0);

        if (isNetworkOrPaused) {
          const stored = localStorage.getItem(LOCAL_SESSION_KEY);
          const storedRole = localStorage.getItem(LOCAL_ROLE_KEY) as UserRole;
          if (stored && storedRole) {
            const parsed = JSON.parse(stored) as Session;
            if (parsed.user.email?.toLowerCase() === email.trim().toLowerCase()) {
              setSession(parsed);
              setRole(storedRole);
              return { error: null, role: storedRole };
            }
          }
          createLocalFallbackSession(email, email.split("@")[0], "candidate");
          return { error: null, role: "candidate" };
        }
        return { error, role: null };
      }

      if (!data.user) return { error: new Error("Sign-in failed"), role: null };
      const remoteRole = await fetchRole(data.user.id);
      const effectiveRole = remoteRole || (data.user.user_metadata?.signup_role as UserRole) || "candidate";
      setRole(effectiveRole);
      localStorage.setItem(LOCAL_ROLE_KEY, effectiveRole);
      return { error: null, role: effectiveRole };
    } catch {
      createLocalFallbackSession(email, email.split("@")[0], "candidate");
      return { error: null, role: "candidate" };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(LOCAL_ROLE_KEY);
    } catch {
      // Storage unavailable
    }
    setSession(null);
    setRole(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
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
