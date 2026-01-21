import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Upload, Sparkles, FileCheck, AlertCircle, Loader2 } from "lucide-react";

const Verify = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleVerify = async () => {
    if (!file) return;

    setIsVerifying(true);

    // Simulate AI verification API call
    // In production, replace this with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Simulate random result (80% success rate for demo)
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      navigate("/upload-success");
    } else {
      navigate("/upload-failed");
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
              disabled={!file || isVerifying}
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
