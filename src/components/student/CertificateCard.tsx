import { Award, Building2, Calendar, FileCheck, Clock, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/hooks/useCertificates";
import { format } from "date-fns";

interface CertificateCardProps {
  certificate: Certificate;
  onDelete?: (id: string) => void;
}

export const CertificateCard = ({ certificate, onDelete }: CertificateCardProps) => {
  const statusConfig = {
    verified: {
      icon: FileCheck,
      label: "Verified",
      className: "bg-success/10 text-success",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-warning/10 text-warning",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const status = statusConfig[certificate.verification_status];
  const StatusIcon = status.icon;

  const formattedDate = certificate.issue_date 
    ? format(new Date(certificate.issue_date), "MMMM yyyy")
    : format(new Date(certificate.created_at), "MMMM yyyy");

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 flex items-center gap-6 hover:shadow-medium transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        certificate.verification_status === "verified" 
          ? "bg-success/10" 
          : certificate.verification_status === "pending"
          ? "bg-warning/10"
          : "bg-destructive/10"
      }`}>
        <Award className={`w-6 h-6 ${
          certificate.verification_status === "verified"
            ? "text-success"
            : certificate.verification_status === "pending"
            ? "text-warning"
            : "text-destructive"
        }`} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-foreground mb-1 truncate">
          {certificate.title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {certificate.issuer}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
        </div>
        {certificate.verification_message && (
          <p className="text-sm text-muted-foreground mt-1">
            {certificate.verification_message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.className}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(certificate.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
