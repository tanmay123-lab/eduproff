import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getLSCertificateById, LSCertificate } from "@/lib/certificates";
import { supabase } from "@/integrations/supabase/client";
import {
  Award,
  Building2,
  Calendar,
  FileCheck,
  Clock,
  XCircle,
  Shield,
  Copy,
  ExternalLink,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const CertificateView = () => {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<LSCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Try localStorage first (fastest, works offline)
    const lsCert = getLSCertificateById(id);
    if (lsCert) {
      setCertificate(lsCert);
      setLoading(false);
      return;
    }

    // Fall back to Supabase
    supabase
      .from("certificates")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setCertificate(data as LSCertificate);
        setLoading(false);
      });
  }, [id]);

  const copyVerificationLink = () => {
    if (!certificate) return;
    const link = `${window.location.origin}/check?id=${certificate.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Verification link copied to clipboard!");
  };

  const statusConfig = {
    verified: {
      icon: FileCheck,
      label: "Verified",
      className: "bg-success/10 text-success",
      barClass: "bg-success",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-warning/10 text-warning",
      barClass: "bg-warning",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "bg-destructive/10 text-destructive",
      barClass: "bg-destructive",
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!certificate) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Certificate Not Found
              </h1>
              <p className="text-muted-foreground mb-6">
                No certificate exists with this ID.
              </p>
              <Button variant="outline" asChild>
                <Link to="/student">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const status = statusConfig[certificate.verification_status];
  const StatusIcon = status.icon;
  const trustScore = certificate.verification_status === "verified" ? 100 : certificate.verification_status === "failed" ? 0 : 50;

  const formattedDate = certificate.issue_date
    ? format(new Date(certificate.issue_date), "MMMM yyyy")
    : format(new Date(certificate.created_at), "MMMM yyyy");

  const isPdf = certificate.certificate_url?.match(/\.pdf$/i);

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto">
            {/* Back */}
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link to="/student">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-4">
              <Shield className="w-3.5 h-3.5" />
              Certificate Details
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              {certificate.title}
            </h1>

            {/* Main details card */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  certificate.verification_status === "verified"
                    ? "bg-success/10"
                    : certificate.verification_status === "pending"
                    ? "bg-warning/10"
                    : "bg-destructive/10"
                }`}>
                  <Award className={`w-7 h-7 ${
                    certificate.verification_status === "verified"
                      ? "text-success"
                      : certificate.verification_status === "pending"
                      ? "text-warning"
                      : "text-destructive"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
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
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ${status.className}`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              </div>

              {/* Trust Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className={`font-display text-2xl font-bold ${
                    trustScore >= 70 ? "text-success" : trustScore >= 50 ? "text-warning" : "text-destructive"
                  }`}>
                    {trustScore}<span className="text-base text-muted-foreground font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${status.barClass}`}
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
              </div>

              {certificate.verification_message && (
                <p className="text-sm text-muted-foreground">
                  {certificate.verification_message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {isPdf && certificate.certificate_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={certificate.certificate_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View PDF
                  </a>
                </Button>
              )}
              {certificate.verification_status === "verified" && (
                <Button variant="outline" size="sm" onClick={copyVerificationLink}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Verification Link
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CertificateView;
