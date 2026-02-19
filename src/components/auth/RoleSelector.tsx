import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { GraduationCap, Building2, Briefcase, Info } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const roles: { 
    value: UserRole; 
    label: string; 
    description: string; 
    tooltip: string;
    icon: typeof GraduationCap;
  }[] = [
    {
      value: "candidate",
      label: "Candidate",
      description: "I want to manage and verify my credentials",
      tooltip: "Students and job seekers who want to upload, store, and share their verified credentials with potential employers.",
      icon: GraduationCap,
    },
    {
      value: "recruiter",
      label: "Recruiter",
      description: "I want to verify candidate credentials",
      tooltip: "HR professionals and recruiters who need to verify the authenticity of candidate credentials during the hiring process.",
      icon: Briefcase,
    },
    {
      value: "institution",
      label: "Institution",
      description: "I want to issue and manage certificates",
      tooltip: "Educational institutions, training centers, and certification bodies that issue and manage official credentials.",
      icon: Building2,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.value;
        
        return (
          <div
            key={role.value}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
            onClick={() => onRoleChange(role.value)}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                isSelected ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn(
                  "h-6 w-6",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    "font-semibold text-base",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {role.label}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{role.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
