import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Upload, CheckCircle, Share2, Shield, Sparkles, Users, ArrowRight, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroBg from "@/assets/hero-bg.jpg";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Simply upload your certificate or achievement document in seconds.",
  },
  {
    icon: CheckCircle,
    title: "Verify",
    description: "Our AI-powered system instantly verifies the authenticity of your credentials.",
  },
  {
    icon: Share2,
    title: "Share & Generate CV",
    description: "Share your verified achievements and create a professional CV effortlessly.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Trusted Verification",
    description: "Industry-leading AI technology ensures 99.9% accuracy in certificate authentication.",
  },
  {
    icon: Sparkles,
    title: "Instant Results",
    description: "Get your certificates verified in seconds, not days. No more waiting around.",
  },
  {
    icon: Users,
    title: "Recruiter Access",
    description: "Connect with top recruiters who trust our verified candidate database.",
  },
];

const Index = () => {
  const { user, role } = useAuth();

  // Determine CTA based on auth state
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
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="EduProof Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Trusted by 10,000+ students worldwide
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your Verified Achievements,{" "}
              <span className="text-primary">Your True Potential</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              EduProof makes certificate verification simple, fast, and trustworthy. 
              Upload your credentials, get instant verification, and showcase your achievements to the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {primaryCta.label}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              {!user && (
                <Button variant="outline-hero" size="xl" asChild>
                  <Link to="/support">Contact Us</Link>
                </Button>
              )}
              {user && role === "candidate" && (
                <Button variant="outline-hero" size="xl" asChild>
                  <Link to="/verify">Verify Certificate</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full gradient-hero opacity-10 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full gradient-accent opacity-10 blur-3xl animate-float" />
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How EduProof Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to verify your credentials and unlock new opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-card rounded-2xl p-8 shadow-soft border border-border/50 text-center group hover:shadow-medium transition-shadow"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6 shadow-glow-primary group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose EduProof?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of students and recruiters who trust our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 hover:shadow-medium transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  About EduProof
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  EduProof is a cutting-edge platform that bridges the gap between education and employment. 
                  We use advanced AI technology to verify educational certificates, ensuring that every 
                  achievement is authentic and trustworthy.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our mission is to empower students to showcase their verified achievements and help 
                  recruiters find genuine talent quickly. With EduProof, your credentials speak for themselves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Showcase Your Achievements?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join EduProof today and take the first step towards verified success. 
              It's free to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to={primaryCta.to}>
                  {user ? "Go to Dashboard" : "Sign Up Now"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/support">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
