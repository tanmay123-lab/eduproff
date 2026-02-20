import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getCertificates, StoredCertificate } from "@/utils/certificateStorage";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  History,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const RecruiterOverview = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "there";
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<StoredCertificate[]>([]);

  useEffect(() => {
    setCertificates(getCertificates());
  }, []);

  const stats = {
    total: certificates.length,
    verified: certificates.filter(c => c.status === "Verified").length,
    pending: certificates.filter(c => c.status === "Pending").length,
    failed: certificates.filter(c => c.status === "Failed").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Hi {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          View verified certificates and verify new ones with confidence.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.verified}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/recruiter/verify"
          className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">Verify Certificate</h3>
          <p className="text-muted-foreground text-sm">Check a certificate's authenticity</p>
        </Link>
        <Link
          to="/recruiter/history"
          className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">Verification History</h3>
          <p className="text-muted-foreground text-sm">View past verification attempts</p>
        </Link>
      </div>

      {/* Recent Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Certificates</h2>
          <div className="space-y-3">
            {certificates.slice(0, 5).map(cert => (
              <div key={cert.id} className="bg-card rounded-xl p-4 shadow-soft border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{cert.degree}</p>
                    <p className="text-xs text-muted-foreground">{cert.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cert.status === "Verified" ? "bg-success/10 text-success border-success/20" : cert.status === "Failed" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}>
                    {cert.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/certificate/${cert.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterOverview;
