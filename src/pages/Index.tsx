import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { 
  CheckCircle, 
  Shield, 
  Users, 
  ArrowRight, 
  FileCheck,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  UserCheck,
  FileText,
  Gauge,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const workflowSteps = [
  {
    icon: UserCheck,
    title: "Identity Validation",
    description: "Secure identity verification ensures only legitimate users access the system.",
  },
  {
    icon: FileText,
    title: "Certificate Upload",
    description: "Upload your certificate PDF with the institution-issued Certificate ID.",
  },
  {
    icon: Search,
    title: "Automated Verification",
    description: "Database-driven checks validate the certificate against institutional records.",
  },
  {
    icon: Gauge,
    title: "Trust Score",
    description: "Receive a transparent trust score with clear verified or not-found status.",
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
    icon: Zap,
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
      <section className="relative py-28 lg:py-40 bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-10 shadow-sm border border-primary/20 transition-transform duration-200 hover:scale-105">
              <Shield className="w-4 h-4" />
              Credential Verification Platform
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight text-balance">
              Verified Credential{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Trust System</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 max-w-2xl">
              Build trust in credential-based hiring and institutional decisions with secure verification and transparent risk signals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {primaryCta.label}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline-hero" size="xl" asChild>
                <Link to="/how-it-works">
                  How It Works
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-12 mt-20 pt-10 border-t border-border/50">
              <div className="transition-transform duration-200 hover:scale-105">
                <div className="font-display text-4xl md:text-5xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground mt-2">Verification Accuracy</div>
              </div>
              <div className="transition-transform duration-200 hover:scale-105">
                <div className="font-display text-4xl md:text-5xl font-bold text-foreground">&lt;3s</div>
                <div className="text-sm text-muted-foreground mt-2">Average Check Time</div>
              </div>
              <div className="transition-transform duration-200 hover:scale-105">
                <div className="font-display text-4xl md:text-5xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground mt-2">Verified Credentials</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Verification Result */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              See Verification in Action
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our transparent system provides clear, actionable results.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl p-10 shadow-2xl border-2 border-border transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Certificate</p>
                  <p className="font-display font-bold text-foreground text-2xl">AWS Solutions Architect</p>
                  <p className="text-base text-muted-foreground mt-1">Amazon Web Services</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">Trust Score</span>
                  <span className="font-display font-bold text-2xl text-success">100%</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-success/5 border-2 border-success/20 transition-all duration-200 hover:bg-success/10">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-success" />
                    <span className="text-sm font-semibold text-foreground">Certificate ID Lookup</span>
                  </div>
                  <span className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-full">PASSED</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-success/5 border-2 border-success/20 transition-all duration-200 hover:bg-success/10">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-success" />
                    <span className="text-sm font-semibold text-foreground">Database Match</span>
                  </div>
                  <span className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-full">PASSED</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Verified.</span> Certificate found in institutional database. No issues detected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
              How EduProof Works
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A transparent, four-step verification process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 mt-2 shadow-sm">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild className="shadow-md hover:shadow-xl">
              <Link to="/how-it-works">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Who It Helps */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
              Who EduProof Helps
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Building trust across the credential ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="bg-card rounded-3xl p-10 shadow-xl border-2 border-border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-sm">
                  <audience.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {audience.title}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-8">
                  {audience.description}
                </p>
                <Button variant="outline" size="default" asChild className="w-full shadow-md hover:shadow-lg">
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
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
              Why Choose EduProof?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Enterprise-grade verification for the education sector.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card rounded-3xl p-10 shadow-xl border-2 border-border hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-sm">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 md:py-40 bg-gradient-to-br from-primary/5 via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Ready to Build Trust in Credentials?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join EduProof today and experience enterprise-grade verification for your credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {user ? "Go to Dashboard" : "Verify Credential"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline-hero" size="xl" asChild>
                <Link to="/demo">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
