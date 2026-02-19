import { GraduationCap, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "candidate" | "recruiter" | "institution";

const roles: { value: Role; label: string; description: string; icon: typeof GraduationCap }[] = [
  {
    value: "candidate",
    label: "Candidate",
    description: "Upload & verify credentials",
    icon: GraduationCap,
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Verify & hire talent",
    icon: Briefcase,
  },
  {
    value: "institution",
    label: "Institution",
    description: "Issue & manage certificates",
    icon: Building2,
  },
];

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        I am a
      </label>
      <div className="grid grid-cols-3 gap-3">
        {roles.map((role) => {
          const isSelected = selectedRole === role.value;
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onRoleChange(role.value)}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200",
                "hover:border-[#4f46e5]/40 hover:bg-[#4f46e5]/[0.03]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/50 focus-visible:ring-offset-2",
                isSelected
                  ? "border-[#4f46e5] bg-[#4f46e5]/[0.05] shadow-[0_0_0_1px_rgba(79,70,229,0.1)]"
                  : "border-border bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
                  isSelected
                    ? "bg-[#4f46e5]/10 text-[#4f46e5]"
                    : "bg-muted text-muted-foreground group-hover:bg-[#4f46e5]/10 group-hover:text-[#4f46e5]"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? "text-foreground" : "text-foreground"
                  )}
                >
                  {role.label}
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {role.description}
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#4f46e5]">
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
