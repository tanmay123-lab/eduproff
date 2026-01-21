import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { XCircle, RefreshCw, Headphones, AlertTriangle, ArrowRight } from "lucide-react";

const reasons = [
  "The certificate image quality may be too low",
  "The document format might not be recognized",
  "The certificate issuer may not be in our database yet",
  "The document may have been modified or tampered with",
];

const UploadFailed = () => {
  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            {/* Failed Animation */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto animate-scale-in">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Oops! 😕
            </h1>
            <p className="text-xl text-destructive font-medium mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Certificate verification failed ❌
            </p>
            <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Don't worry – this happens sometimes! There are a few reasons why verification might fail. 
              You can try again or reach out to our support team for help.
            </p>

            {/* Possible Reasons Card */}
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-8 text-left animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <h3 className="font-display font-semibold text-foreground">
                  Possible reasons for failure
                </h3>
              </div>
              <ul className="space-y-3">
                {reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      {index + 1}
                    </span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/verify">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/support">
                  <Headphones className="w-4 h-4" />
                  Contact Support
                </Link>
              </Button>
            </div>

            <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <Button variant="ghost" asChild>
                <Link to="/">
                  Back to Home
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UploadFailed;
