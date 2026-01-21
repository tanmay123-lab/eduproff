import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileCheck, FileText, Award, Calendar, Building2 } from "lucide-react";

// Placeholder verified certificates data
const certificates = [
  {
    id: 1,
    title: "Full Stack Web Development",
    issuer: "Coursera",
    date: "January 2024",
    status: "verified",
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    issuer: "edX",
    date: "December 2023",
    status: "verified",
  },
  {
    id: 3,
    title: "Cloud Computing Certification",
    issuer: "AWS",
    date: "November 2023",
    status: "verified",
  },
];

const Student = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Student Dashboard
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hello, Achiever! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              See your verified certificates and generate your CV. Your achievements are ready to shine!
            </p>
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
                Your Verified Certificates
              </h2>
              <p className="text-muted-foreground">
                All your authenticated credentials in one place
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/verify">
                <Upload className="w-4 h-4" />
                Add New
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-card rounded-xl p-6 shadow-soft border border-border/50 flex items-center gap-6 hover:shadow-medium transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-success" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground mb-1 truncate">
                    {cert.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {cert.issuer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {cert.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                    <FileCheck className="w-4 h-4" />
                    Verified
                  </span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state - shown when no certificates */}
          {certificates.length === 0 && (
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
