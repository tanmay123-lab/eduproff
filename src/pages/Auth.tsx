import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, Mail, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).optional(),
});

type AuthMode = "login" | "signup";
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
      if (mode === "signup") {
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

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                {mode === "login" ? "Welcome Back!" : "Get Started"}
              </div>
              
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {mode === "login" ? "Welcome! Let's get you started 🌟" : "Create Your Account ✨"}
              </h1>
              <p className="text-muted-foreground">
                {mode === "login" 
                  ? "Log in to access your dashboard and verified certificates."
                  : "Join EduProof and start verifying your achievements today."}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50">
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
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
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
