import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { GraduationCap, Building2, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const roles: { value: UserRole; label: string; description: string; icon: typeof GraduationCap }[] = [
    {
      value: "candidate",
      label: "Candidate",
      description: "I want to manage and verify my credentials",
      icon: GraduationCap,
    },
    {
      value: "recruiter",
      label: "Recruiter",
      description: "I want to verify candidate credentials",
      icon: Briefcase,
    },
    {
      value: "institution",
      label: "Institution",
      description: "I want to issue and manage certificates",
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
              "cursor-pointer transition-all",
              isSelected
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            )}
            onClick={() => onRoleChange(role.value)}
          >
            <CardContent className="p-6 text-center space-y-2">
              <div className="flex justify-center">
                <Icon className={cn(
                  "h-10 w-10",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
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
