import { Card, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.value;
        
        return (
          <Card
            key={role.value}
            className={cn(
              "cursor-pointer transition-all relative",
              isSelected
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            )}
            onClick={() => onRoleChange(role.value)}
          >
            <CardContent className="p-6 text-center space-y-2">
              <div className="flex justify-center items-center gap-2">
                <Icon className={cn(
                  "h-10 w-10",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{role.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <h3 className="font-semibold">{role.label}</h3>
              <p className="text-xs text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
