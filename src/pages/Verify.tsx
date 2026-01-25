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

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
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
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
    
    const { data } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const handleVerify = async () => {
    if (!file || !title || !issuer) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please log in to upload certificates");
      navigate("/auth");
      return;
    }

    setIsVerifying(true);

    try {
      // Convert file to base64 for AI analysis
      let imageBase64: string | null = null;
      if (file.type.startsWith("image/")) {
        imageBase64 = await fileToBase64(file);
      }

      // Call AI verification edge function
      const { data: verificationResult, error: verifyError } = await supabase.functions.invoke(
        "verify-certificate",
        {
          body: { title, issuer, imageBase64 },
        }
      );

      if (verifyError) {
        console.error("Verification error:", verifyError);
        toast.error("Verification service unavailable. Please try again.");
        setIsVerifying(false);
        return;
      }

      // Handle rate limits and payment errors
      if (verificationResult?.error) {
        toast.error(verificationResult.error);
        setIsVerifying(false);
        return;
      }

      // Add certificate to database with verification result
      const { data: certificate, error } = await addCertificate(
        verificationResult.extractedTitle || title,
        verificationResult.extractedIssuer || issuer,
        verificationResult.extractedDate || undefined
      );
      
      if (error || !certificate) {
        toast.error(error || "Failed to save certificate");
        setIsVerifying(false);
        return;
      }

      // Upload file to storage and get URL
      const fileUrl = await uploadCertificateFile(file, certificate.id);
      
      if (fileUrl) {
        // Update certificate with file URL
        await supabase
          .from('certificates')
          .update({ certificate_url: fileUrl })
          .eq('id', certificate.id);
      }

      // Update status based on AI verification
      const isVerified = verificationResult.verified && verificationResult.confidence >= 70;
      
      if (isVerified) {
        await updateCertificateStatus(
          certificate.id, 
          "verified", 
          verificationResult.details || "Certificate verified successfully"
        );
        navigate("/upload-success");
      } else {
        await updateCertificateStatus(
          certificate.id, 
          "failed", 
          verificationResult.details || "Could not verify certificate authenticity"
        );
        navigate("/upload-failed");
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
                accept=".pdf,.jpg,.jpeg,.png"
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
                      Drag and drop your certificate here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse (PDF, JPG, PNG)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Certificate Details Form */}
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Certificate Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Full Stack Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuing Organization *</Label>
                <Input
                  id="issuer"
                  placeholder="e.g., Coursera, AWS, Google"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Supported formats</p>
                  <p>
                    We accept PDF, JPG, and PNG files up to 10MB. Make sure your certificate 
                    is clearly visible and all text is readable.
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
              disabled={!file || !title || !issuer || isVerifying}
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
