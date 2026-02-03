import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { 
  Upload, 
  CheckCircle, 
  Share2, 
  Shield, 
  Sparkles, 
  Users, 
  ArrowRight, 
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  UserCheck,
  FileText,
  Gauge
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";
import { Progress } from "@/components/ui/progress";

const workflowSteps = [
  {
    icon: UserCheck,
    title: "Identity & KYC Validation",
    description: "Secure identity verification ensures only legitimate users access the system.",
  },
  {
    icon: FileText,
    title: "Certificate & Code Upload",
    description: "Upload your certificate PDF with verification codes (Student ID, Certificate ID).",
  },
  {
    icon: Search,
    title: "Automated Verification",
    description: "AI-powered checks validate format, detect duplicates, and assess consistency.",
  },
  {
    icon: Gauge,
    title: "Trust Score Output",
    description: "Receive a transparent trust score with detailed verification breakdown.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Risk Reduction",
    description: "Eliminate credential fraud with automated verification that catches inconsistencies humans miss.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Trust",
    description: "From startups to enterprises, our system scales with your verification needs.",
  },
  {
    icon: Sparkles,
    title: "Instant Results",
    description: "Get verification results in seconds, not days. No manual review delays.",
  },
];

const audiences = [
  {
    icon: GraduationCap,
    title: "Students & Professionals",
    description: "Verify and showcase your credentials to stand out in competitive job markets.",
    cta: "Verify Your Credentials",
    to: "/auth",
  },
  {
    icon: Building2,
    title: "Educational Institutions",
    description: "Protect your institution's reputation with verified certificate issuance.",
    cta: "Partner With Us",
    to: "/support",
  },
  {
    icon: Briefcase,
    title: "Recruiters & Employers",
    description: "Make confident hiring decisions with verified candidate credentials.",
    cta: "Find Verified Talent",
    to: "/auth",
  },
];

const Index = () => {
  const { user, role } = useAuth();

  const primaryCta = user 
    ? { 
        to: role === "recruiter" ? "/recruiter" : "/student", 
        label: "Go to Dashboard" 
      }
    : { to: "/auth", label: "Get Started Free" };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="EduProof Hero Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              FinTech-Grade Credential Verification
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              EduProof — Verified Credential{" "}
              <span className="text-primary">Trust System</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Build trust in credential-based hiring and institutional decisions with{" "}
              <span className="text-foreground font-medium">secure verification</span> and{" "}
              <span className="text-foreground font-medium">risk signals</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {primaryCta.label}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline-hero" size="xl" asChild>
                <Link to="/how-it-works">
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Verification Accuracy</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-primary">&lt;3s</div>
                <div className="text-sm text-muted-foreground">Average Check Time</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Verified Credentials</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full gradient-hero opacity-10 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full gradient-accent opacity-10 blur-3xl animate-float" />
      </section>

      {/* Demo Verification Result */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              See Verification in Action
            </h2>
            <p className="text-muted-foreground text-lg">
              Our transparent verification system provides clear, actionable results.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-medium border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Certificate</div>
                  <div className="font-display font-semibold text-foreground">AWS Solutions Architect</div>
                  <div className="text-sm text-muted-foreground">Issued by Amazon Web Services</div>
                </div>
                <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Trust Score</span>
                  <span className="font-display font-bold text-xl text-primary">92%</span>
                </div>
                <Progress value={92} className="h-3" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">User/Candidate ID Check</span>
                  </div>
                  <span className="text-xs font-medium text-success bg-success/20 px-2 py-1 rounded-full">PASSED</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">Duplicate Check</span>
                  </div>
                  <span className="text-xs font-medium text-success bg-success/20 px-2 py-1 rounded-full">PASSED</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground mb-1">Verification Result</div>
                    <p className="text-sm text-muted-foreground">
                      GENUINE CERTIFICATE: Credential ID detected. AWS provides verification codes on their certificates. No duplicate certificates found.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How EduProof Works
            </h2>
            <p className="text-muted-foreground text-lg">
              A transparent, four-step verification process inspired by financial trust systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center group hover:shadow-medium transition-shadow"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/how-it-works">
                Learn More About Our Process
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Who It Helps */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who EduProof Helps
            </h2>
            <p className="text-muted-foreground text-lg">
              Building trust across the credential ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 hover:shadow-medium transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6 shadow-glow-primary">
                  <audience.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {audience.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {audience.description}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={audience.to}>
                    {audience.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why EduProof */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose EduProof?
            </h2>
            <p className="text-muted-foreground text-lg">
              FinTech-grade verification for the education sector.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 hover:shadow-medium transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Build Trust in Credentials?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join EduProof today and experience FinTech-grade verification for your credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {user ? "Go to Dashboard" : "Verify Credential"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/demo">View Demo Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;