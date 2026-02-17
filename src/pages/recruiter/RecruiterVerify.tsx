import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VerificationResult {
  status: string;
  trust_score: number;
  message: string;
  student_name?: string;
  course_name?: string;
  issue_date?: string;
}

const RecruiterVerify = () => {
  const { user } = useAuth();
  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a Certificate ID");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-certificate", {
        body: {
          certificate_id: certificateId.trim(),
          recruiter_id: user?.id,
        },
      });

      if (error) {
        console.error("Verification error:", error);
        toast.error("Verification service unavailable");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification service unavailable");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Verify Certificate
        </h1>
        <p className="text-muted-foreground">
          Enter a Certificate ID to verify its authenticity.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certId">Certificate ID</Label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="certId"
                  placeholder="e.g., EDU-2025-001"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="pl-10 h-11"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
              <Button onClick={handleVerify} disabled={isVerifying || !certificateId.trim()}>
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Verification Result
            </h2>
            {result.status === "verified" ? (
              <Badge className="bg-success/10 text-success border-success/20 text-sm px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-sm px-3 py-1">
                <XCircle className="w-4 h-4 mr-1.5" />
                Not Found
              </Badge>
            )}
          </div>

          {/* Trust Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trust Score</span>
              <span className="font-bold text-foreground">{result.trust_score}%</span>
            </div>
            <Progress
              value={result.trust_score}
              className={`h-3 ${result.trust_score === 100 ? "[&>div]:bg-success" : "[&>div]:bg-destructive"}`}
            />
          </div>

          {/* Message */}
          <p className="text-muted-foreground">{result.message}</p>

          {/* Certificate Details (if verified) */}
          {result.status === "verified" && (
            <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-foreground text-sm">Certificate Details</h3>
              <div className="grid gap-2 text-sm">
                {result.student_name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Student: <span className="text-foreground font-medium">{result.student_name}</span></span>
                  </div>
                )}
                {result.course_name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>Course: <span className="text-foreground font-medium">{result.course_name}</span></span>
                  </div>
                )}
                {result.issue_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: <span className="text-foreground font-medium">{new Date(result.issue_date).toLocaleDateString()}</span></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterVerify;
