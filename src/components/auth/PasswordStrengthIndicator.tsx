import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    
    // Has lowercase
    if (/[a-z]/.test(password)) score += 15;
    
    // Has uppercase
    if (/[A-Z]/.test(password)) score += 15;
    
    // Has numbers
    if (/\d/.test(password)) score += 15;
    
    // Has symbols
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    
    let label = "";
    let color = "";
    
    if (score < 40) {
      label = "Weak";
      color = "bg-red-500";
    } else if (score < 60) {
      label = "Fair";
      color = "bg-orange-500";
    } else if (score < 80) {
      label = "Good";
      color = "bg-yellow-500";
    } else {
      label = "Strong";
      color = "bg-green-500";
    }
    
    return { score, label, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={`font-medium ${
          strength.score < 40 ? "text-red-500" : 
          strength.score < 60 ? "text-orange-500" : 
          strength.score < 80 ? "text-yellow-600" : 
          "text-green-600"
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      {password.length > 0 && password.length < 8 && (
        <p className="text-xs text-red-500">At least 8 characters required</p>
      )}
      {password.length >= 8 && !/\d/.test(password) && (
        <p className="text-xs text-orange-500">Add numbers for better security</p>
      )}
      {password.length >= 8 && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
        <p className="text-xs text-orange-500">Add symbols for better security</p>
      )}
    </div>
  );
}
