import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, RefreshCw, Headphones, ArrowRight, Shield, Search, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";

interface VerificationCheck {
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

interface LocationState {
  trustScore?: number;
  checks?: VerificationCheck[];
  explanation?: string;
}

const UploadFailed = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  const trustScore = state?.trustScore ?? 20;
  const checks = state?.checks ?? [
    { name: "Certificate Code Validation", passed: false, score: 20, details: "Certificate code not found in registry" },
  ];
  const explanation = state?.explanation ?? "Certificate code could not be verified. Please check the code and try again.";

  const getCheckIcon = (name: string) => {
    if (name.includes("Code") || name.includes("Validation")) return Shield;
    if (name.includes("Duplicate")) return Search;
    return FileCheck;
  };

  const failedChecks = checks.filter(c => !c.passed);

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
              Don't worry – this happens sometimes! Review the checks below to understand why.
            </p>

            {/* Trust Score Card */}
            <Card className="mb-6 shadow-medium border-destructive/20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Trust Score</span>
                  <span className={`text-2xl font-bold ${
                    trustScore >= 70 ? 'text-success' : trustScore >= 50 ? 'text-warning' : 'text-destructive'
                  }`}>{trustScore}%</span>
                </div>
                <Progress 
                  value={trustScore} 
                  className={`h-3 mb-4 ${trustScore < 50 ? '[&>div]:bg-destructive' : ''}`}
                />
                <p className="text-sm text-muted-foreground text-left">{explanation}</p>
              </CardContent>
            </Card>

            {/* Verification Checks Card */}
            <Card className="mb-8 shadow-soft animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4 text-left flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Verification Checks ({failedChecks.length} failed)
                </h3>
                <div className="space-y-3">
                  {checks.map((check, index) => {
                    const Icon = getCheckIcon(check.name);
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          check.passed ? 'bg-success/5' : 'bg-destructive/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          check.passed ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          <Icon className={`w-4 h-4 ${check.passed ? 'text-success' : 'text-destructive'}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-foreground">{check.name}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              check.passed 
                                ? 'bg-success/10 text-success' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {check.score}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                        </div>
                        {check.passed ? (
                          <CheckCircle className="w-5 h-5 flex-shrink-0 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 flex-shrink-0 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
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

            <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
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
