import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "candidate" | "recruiter" | "institution" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "candidate" | "recruiter" | "institution") => Promise<{ error: Error | null; role?: UserRole }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (data?.role) {
        return data.role as UserRole;
      }

      // Check current session user metadata as immediate fallback
      const { data: sessionData } = await supabase.auth.getSession();
      const metaRole = sessionData.session?.user?.user_metadata?.role;
      if (metaRole) {
        return metaRole as UserRole;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then(setRole);
          }, 0);
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id).then(setRole);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, selectedRole: "candidate" | "recruiter" | "institution") => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: selectedRole,
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        if (data.session) {
          setSession(data.session);
        }
        setRole(selectedRole);

        // Create profile
        try {
          await supabase
            .from("profiles")
            .upsert({
              user_id: data.user.id,
              full_name: fullName,
            });
        } catch (profileError) {
          console.error("Error creating profile:", profileError);
        }

        // Upsert user role directly into user_roles table
        try {
          await supabase
            .from("user_roles")
            .upsert({ user_id: data.user.id, role: selectedRole });
        } catch {
          // Ignore if restricted by RLS
        }

        // Try edge function if available
        if (data.session) {
          try {
            await supabase.functions.invoke(
              'assign-role',
              { body: { requestedRole: selectedRole } }
            );
          } catch (fnError) {
            console.error("Could not reach assign-role function:", fnError);
          }
        }

        return { error: null, role: selectedRole };
      }

      return { error: null, role: selectedRole };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
        if (data.session) {
          setSession(data.session);
        }
        const userRole = await fetchUserRole(data.user.id);
        const effectiveRole = userRole || (data.user.user_metadata?.role as UserRole) || null;
        setRole(effectiveRole);
        return { error: null, role: effectiveRole };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
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
