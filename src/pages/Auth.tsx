import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Users, Mail, Lock, User, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).optional(),
});

type AuthMode = "login" | "signup" | "forgot-password";
type SelectedRole = "candidate" | "recruiter" | null;

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, role, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      if (role === "candidate") {
        navigate("/student");
      } else if (role === "recruiter") {
        navigate("/recruiter");
      }
    }
  }, [user, role, navigate]);

  const validateForm = () => {
    try {
      const data = mode === "signup" 
        ? { email, password, fullName } 
        : { email, password };
      authSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (mode === "signup" && !selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're a Candidate or Recruiter",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Check your email 📧",
            description: "We've sent you a password reset link.",
          });
          setMode("login");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName, selectedRole!);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome to EduProof! 🎉",
            description: "Your account has been created successfully.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back! 🌟",
            description: "You have logged in successfully.",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const RoleSelector = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        type="button"
        onClick={() => setSelectedRole("candidate")}
        className={`p-6 rounded-xl border-2 transition-all text-left ${
          selectedRole === "candidate"
            ? "border-primary bg-primary/5 shadow-glow-primary"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-foreground mb-1">Candidate</h3>
        <p className="text-sm text-muted-foreground">Upload & verify your certificates</p>
      </button>
      
      <button
        type="button"
        onClick={() => setSelectedRole("recruiter")}
        className={`p-6 rounded-xl border-2 transition-all text-left ${
          selectedRole === "recruiter"
            ? "border-accent bg-accent/5 shadow-glow-accent"
            : "border-border hover:border-accent/50 hover:bg-secondary/50"
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
          <Users className="w-6 h-6 text-accent-foreground" />
        </div>
        <h3 className="font-display font-semibold text-foreground mb-1">Recruiter</h3>
        <p className="text-sm text-muted-foreground">Find verified talent quickly</p>
      </button>
    </div>
  );

  const getHeaderContent = () => {
    switch (mode) {
      case "forgot-password":
        return {
          badge: "Reset Password",
          title: "Forgot your password? 🔐",
          description: "Enter your email and we'll send you a reset link.",
        };
      case "signup":
        return {
          badge: "Get Started",
          title: "Create Your Account ✨",
          description: "Join EduProof and start verifying your achievements today.",
        };
      default:
        return {
          badge: "Welcome Back!",
          title: "Welcome! Let's get you started 🌟",
          description: "Log in to access your dashboard and verified certificates.",
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                {headerContent.badge}
              </div>
              
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {headerContent.title}
              </h1>
              <p className="text-muted-foreground">
                {headerContent.description}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50">
              {mode === "forgot-password" ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setErrors({}); }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </button>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selector for Signup */}
                    {mode === "signup" && (
                      <>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          I am a...
                        </label>
                        <RoleSelector />
                      </>
                    )}

                    {/* Full Name (Signup only) */}
                    {mode === "signup" && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                        )}
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">
                          Password
                        </label>
                        {mode === "login" && (
                          <button
                            type="button"
                            onClick={() => { setMode("forgot-password"); setErrors({}); }}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full" 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Please wait..." : (
                        <>
                          {mode === "login" ? "Log In" : "Create Account"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full" 
                    type="button"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Toggle Mode */}
                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "login" ? "signup" : "login");
                          setErrors({});
                        }}
                        className="text-primary font-medium ml-1 hover:underline"
                      >
                        {mode === "login" ? "Sign Up" : "Log In"}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
