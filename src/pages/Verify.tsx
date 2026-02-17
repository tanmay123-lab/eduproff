import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { Upload, Sparkles, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { useCertificates } from "@/hooks/useCertificates";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// PDF-only validation
const ALLOWED_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['pdf'];

const validateFileType = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    toast.error("Only PDF files are accepted. Please upload a PDF certificate.");
    return false;
  }
  return true;
};

const Verify = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCertificate, updateCertificateStatus } = useCertificates();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certificateCode, setCertificateCode] = useState("");
  
  // Validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TITLE_LENGTH = 200;
  const MAX_ISSUER_LENGTH = 200;
  const MAX_CODE_LENGTH = 100;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFileType(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFileType(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const uploadCertificateFile = async (file: File, certificateId: string): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${certificateId}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }
    
    // Return file path for private bucket - signed URLs will be generated on-demand when viewing
    return filePath;
  };

  const handleVerify = async () => {
    if (!file || !title.trim() || !issuer.trim() || !certificateCode.trim()) {
      toast.error("Please fill in all required fields including certificate code");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be less than 10MB");
      return;
    }

    // Validate title length
    if (title.trim().length > MAX_TITLE_LENGTH) {
      toast.error(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    // Validate issuer length
    if (issuer.trim().length > MAX_ISSUER_LENGTH) {
      toast.error(`Issuer must be less than ${MAX_ISSUER_LENGTH} characters`);
      return;
    }

    if (!user) {
      toast.error("Please log in to upload certificates");
      navigate("/auth");
      return;
    }

    setIsVerifying(true);

    try {
      // Call verification edge function
      const { data: verificationResult, error: verifyError } = await supabase.functions.invoke(
        "verify-certificate",
        {
          body: { certificate_id: certificateCode.trim() },
        }
      );

      if (verifyError) {
        console.error("Verification error:", verifyError);
        toast.error("Verification service unavailable");
        setIsVerifying(false);
        return;
      }

      // Add certificate to database
      const { data: certificate, error } = await addCertificate(
        verificationResult.course_name || title,
        verificationResult.student_name || issuer,
        verificationResult.issue_date || undefined
      );
      
      if (error || !certificate) {
        toast.error(error || "Failed to save certificate");
        setIsVerifying(false);
        return;
      }

      // Upload file to storage
      const fileUrl = await uploadCertificateFile(file, certificate.id);
      if (fileUrl) {
        await supabase
          .from('certificates')
          .update({ certificate_url: fileUrl })
          .eq('id', certificate.id);
      }

      // Map response to certificate status
      const resultState = {
        trustScore: verificationResult.trust_score,
        status: verificationResult.status,
        explanation: verificationResult.message,
        checks: [{ name: "Certificate ID Lookup", passed: verificationResult.status === "verified", score: verificationResult.trust_score, details: verificationResult.message }],
      };

      if (verificationResult.status === "verified") {
        await updateCertificateStatus(certificate.id, "verified", verificationResult.message);
        navigate("/upload-success", { state: resultState });
      } else {
        await updateCertificateStatus(certificate.id, "failed", verificationResult.message);
        navigate("/upload-failed", { state: resultState });
      }
    } catch (err) {
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Verification
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Verify Your Certificate
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your certificate, and we'll instantly verify it with our AI magic ✨
              The process is fast, secure, and accurate.
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-success bg-success/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                    <FileCheck className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Change file
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Drag and drop your certificate PDF here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse (PDF only)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Certificate Details Form */}
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Certificate Title * <span className="text-muted-foreground text-xs">({title.length}/{MAX_TITLE_LENGTH})</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., Full Stack Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                  maxLength={MAX_TITLE_LENGTH}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuing Organization * <span className="text-muted-foreground text-xs">({issuer.length}/{MAX_ISSUER_LENGTH})</span></Label>
                <Input
                  id="issuer"
                  placeholder="e.g., Coursera, AWS, Google"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value.slice(0, MAX_ISSUER_LENGTH))}
                  maxLength={MAX_ISSUER_LENGTH}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateCode">
                  Certificate ID * <span className="text-muted-foreground text-xs">({certificateCode.length}/{MAX_CODE_LENGTH})</span>
                </Label>
                <Input
                  id="certificateCode"
                  placeholder="e.g., EDU-2025-001"
                  value={certificateCode}
                  onChange={(e) => setCertificateCode(e.target.value.slice(0, MAX_CODE_LENGTH))}
                  maxLength={MAX_CODE_LENGTH}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the Certificate ID issued by your institution
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">PDF Only</p>
                  <p>
                    We accept PDF files up to 10MB. Please ensure your certificate 
                    is in PDF format for verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full mt-8"
              onClick={handleVerify}
              disabled={!file || !title || !issuer || !certificateCode || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Verify Certificate
                </>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-success" />
                Secure Upload
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Verify;
