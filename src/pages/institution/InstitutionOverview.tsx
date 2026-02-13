import { useInstitution } from "@/contexts/InstitutionContext";
import { useAuth } from "@/hooks/useAuth";
import { Award, FileText, ShieldCheck, TrendingUp } from "lucide-react";

const InstitutionOverview = () => {
  const { user } = useAuth();
  const { issuedCertificates, verificationLogs } = useInstitution();
  const userName = user?.email?.split("@")[0] || "Admin";

  const verified = verificationLogs.filter(l => l.status === "Verified").length;
  const invalid = verificationLogs.filter(l => l.status === "Invalid").length;

  const stats = [
    { label: "Certificates Issued", value: issuedCertificates.length, icon: FileText, color: "bg-primary/10 text-primary" },
    { label: "Verifications", value: verificationLogs.length, icon: ShieldCheck, color: "bg-success/10 text-success" },
    { label: "Verified", value: verified, icon: Award, color: "bg-accent/10 text-accent-foreground" },
    { label: "Invalid Attempts", value: invalid, icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Award className="w-4 h-4" />
          Institution Dashboard
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome, {userName}! 🏛️
        </h1>
        <p className="text-muted-foreground">
          Manage your institution's certificates and track verifications.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionOverview;
