import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { RoleSelector } from "./RoleSelector";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import type { UserRole } from "@/types";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError("Password must contain at least one number");
      return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setPasswordError("Password must contain at least one symbol");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName, selectedRole);

      if (error) {
        // Handle specific error cases
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          setEmailError("This email is already registered");
          toast({
            variant: "destructive",
            title: "Email already registered",
            description: "Please use a different email or try logging in.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: error.message,
          });
        }
      } else {
        toast({
          title: "Success! 🎉",
          description: "Account created successfully. Please check your email to verify your account.",
        });
        
        // Navigate based on role to new paths
        setTimeout(() => {
          if (selectedRole === "candidate") {
            navigate("/candidate/dashboard");
          } else if (selectedRole === "recruiter") {
            navigate("/recruiter/portal");
          } else if (selectedRole === "institution") {
            navigate("/institution/dashboard");
          }
        }, 100);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Role</Label>
        <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      </div>

      {selectedRole === "institution" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="institutionName">Institution Name</Label>
            <Input
              id="institutionName"
              type="text"
              placeholder="University of Example"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institutionId">Institution ID</Label>
            <Input
              id="institutionId"
              type="text"
              placeholder="INST-12345"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </>
      )}

      {selectedRole === "recruiter" && (
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Acme Corporation"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      )}

      {selectedRole === "candidate" && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">
          {selectedRole === "institution" ? "Official Email" : "Email"}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          required
          disabled={loading}
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && (
          <p className="text-xs text-red-500 mt-1">{emailError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            onBlur={(e) => validatePassword(e.target.value)}
            required
            disabled={loading}
            className={passwordError ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError && (
          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
        )}
        <PasswordStrengthIndicator password={password} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
