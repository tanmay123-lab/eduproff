import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, FileText, Award, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateCard } from "@/components/student/CertificateCard";
import { NotificationsPanel } from "@/components/student/NotificationsPanel";
import { toast } from "sonner";

const Student = () => {
  const { user } = useAuth();
  const { certificates, loading, deleteCertificate } = useCertificates();
  const userName = user?.email?.split("@")[0] || "Achiever";

  const verifiedCertificates = certificates.filter(c => c.verification_status === "verified");

  const handleDelete = async (id: string) => {
    const { error } = await deleteCertificate(id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Certificate deleted successfully");
    }
  };
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Candidate Dashboard
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Hello, {userName}! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Your verified certificates await ✨ See your achievements and generate your CV. Your potential is ready to shine!
              </p>
            </div>

            {/* Notifications Panel */}
            <NotificationsPanel certificates={certificates} />
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              to="/verify"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Upload Certificate
              </h3>
              <p className="text-muted-foreground text-sm">
                Add new certificates for instant verification
              </p>
            </Link>

            <Link
              to="#certificates"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                View Verified Certificates
              </h3>
              <p className="text-muted-foreground text-sm">
                Browse all your verified credentials
              </p>
            </Link>

            <Link
              to="/generate-cv"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-accent/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Generate CV
              </h3>
              <p className="text-muted-foreground text-sm">
                Create a professional CV from your achievements
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Certificates */}
      <section id="certificates" className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your Certificates
              </h2>
              <p className="text-muted-foreground">
                All your credentials in one place ({verifiedCertificates.length} verified)
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/verify">
                <Upload className="w-4 h-4" />
                Add New
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : certificates.length > 0 ? (
            <div className="grid gap-4">
              {certificates.map((cert) => (
                <CertificateCard 
                  key={cert.id} 
                  certificate={cert} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary/30 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No certificates yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload your first certificate to get started!
              </p>
              <Button variant="hero" asChild>
                <Link to="/verify">Upload Certificate</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Student;
