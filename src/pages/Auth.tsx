import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Briefcase, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Role = "candidate" | "recruiter" | "institution";

const roles: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: "candidate", label: "Student", icon: GraduationCap },
  { value: "recruiter", label: "Recruiter", icon: Briefcase },
  { value: "institution", label: "Institution", icon: Building2 },
];

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"signin" | "signup">(
    location.pathname === "/signup" ? "signup" : "signin"
  );

  useEffect(() => {
    setMode(location.pathname === "/signup" ? "signup" : "signin");
  }, [location.pathname]);
  const [selectedRole, setSelectedRole] = useState<Role>("candidate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, fullName, selectedRole);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "Please check your email to confirm your account." });
        navigate("/");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 items-center justify-center">
        <div className="text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">EduProof</h1>
          <p className="mt-2 text-blue-100">Verified Credential Trust System</p>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-semibold mb-4">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>

          {mode === "signup" && (
            <div className="mb-4">
              <Label className="mb-2 block text-sm font-medium">Select Role</Label>
              <div className="flex gap-2">
                {roles.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRole(value)}
                    className={`flex flex-col items-center gap-1 flex-1 p-3 rounded-lg border cursor-pointer transition-transform hover:scale-105 ${
                      selectedRole === value
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg h-12 hover:scale-105 transition-all"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
