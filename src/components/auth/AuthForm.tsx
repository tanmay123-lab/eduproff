import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { RoleSelector } from "./RoleSelector";

type AuthMode = "signin" | "signup";
type Role = "candidate" | "recruiter" | "institution";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your full name.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created",
            description: "Check your email to confirm your account.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate("/");
        }
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Enter your credentials to access your account"
            : "Get started with EduProff in seconds"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Role selector - always visible for sign up */}
        {mode === "signup" && (
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
        )}

        {/* Full name - sign up only */}
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            {mode === "signin" && (
              <button type="button" className="text-xs font-medium text-[#4f46e5] hover:text-[#4338ca] transition-colors">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] text-sm font-semibold text-white shadow-lg shadow-[#4f46e5]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#4f46e5]/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/50 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">
          {mode === "signin" ? "New to EduProff?" : "Already have an account?"}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Toggle mode */}
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent hover:border-[#4f46e5]/30"
      >
        {mode === "signin" ? "Create a free account" : "Sign in instead"}
      </button>

      {/* Terms */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="/terms" className="font-medium text-[#4f46e5] underline-offset-4 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="font-medium text-[#4f46e5] underline-offset-4 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
