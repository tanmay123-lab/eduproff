import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Building2, Calendar, FileCheck, Clock, XCircle, Trash2, Eye, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/hooks/useCertificates";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CertificateCardProps {
  certificate: Certificate;
  onDelete?: (id: string) => void;
}

export const CertificateCard = ({ certificate, onDelete }: CertificateCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  
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

  const copyVerificationLink = () => {
    const link = `${window.location.origin}/check?id=${certificate.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Verification link copied to clipboard!");
  };

  const isImage = certificate.certificate_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = certificate.certificate_url?.match(/\.pdf$/i);

  // Extract file path from the full URL for signed URL generation
  const getFilePath = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/storage/v1/object/public/certificates/');
      if (pathParts.length > 1) {
        return pathParts[1];
      }
      // Handle signed URL format as well
      const signedParts = urlObj.pathname.split('/storage/v1/object/sign/certificates/');
      if (signedParts.length > 1) {
        return signedParts[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  // Generate signed URL when component mounts or certificate URL changes
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (!certificate.certificate_url) return;
      
      const filePath = getFilePath(certificate.certificate_url);
      if (!filePath) {
        // If we can't extract path, try using the URL directly (legacy public URLs)
        setSignedUrl(certificate.certificate_url);
        return;
      }

      setLoadingUrl(true);
      try {
        const { data, error } = await supabase.storage
          .from('certificates')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
          console.error("Error generating signed URL:", error);
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        console.error("Failed to generate signed URL:", err);
        setSignedUrl(null);
      } finally {
        setLoadingUrl(false);
      }
    };

    generateSignedUrl();
  }, [certificate.certificate_url]);

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50 hover:shadow-medium transition-shadow">
      <div className="flex items-center gap-6">
        {/* Thumbnail or Icon */}
        {certificate.certificate_url && isImage ? (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <button className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border hover:border-primary transition-colors cursor-pointer">
                {loadingUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : signedUrl ? (
                  <img 
                    src={signedUrl} 
                    alt={certificate.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Award className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{certificate.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {signedUrl ? (
                  <img 
                    src={signedUrl} 
                    alt={certificate.title}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Unable to load certificate image</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground mb-1 truncate">
              <Link to={`/certificate/${certificate.id}`} className="hover:text-primary transition-colors">
                {certificate.title}
              </Link>
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
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {certificate.verification_message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.className}`}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
        {certificate.certificate_url && (
          <>
            {isImage && signedUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            )}
            {isPdf && signedUrl && (
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View PDF
                </a>
              </Button>
            )}
          </>
        )}
        
        {certificate.verification_status === "verified" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={copyVerificationLink}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy Verification Link
          </Button>
        )}
        
        <div className="flex-1" />
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(certificate.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
