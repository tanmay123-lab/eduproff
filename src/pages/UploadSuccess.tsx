import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Share2, ArrowRight, Shield, CheckCheck, Search, FileCheck } from "lucide-react";

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

const UploadSuccess = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  const trustScore = state?.trustScore ?? 85;
  const checks = state?.checks ?? [
    { name: "Code Format Validation", passed: true, score: 90, details: "Verification code format recognized" },
    { name: "Duplicate Check", passed: true, score: 100, details: "No duplicate certificates found" },
    { name: "Consistency Checks", passed: true, score: 85, details: "Title and issuer are consistent" },
  ];
  const explanation = state?.explanation ?? "All verification checks passed successfully.";

  const getCheckIcon = (name: string) => {
    switch (name) {
      case "Code Format Validation":
        return Shield;
      case "Duplicate Check":
        return Search;
      case "Consistency Checks":
        return FileCheck;
      default:
        return CheckCheck;
    }
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full gradient-success flex items-center justify-center mx-auto shadow-glow-success animate-scale-in">
                <CheckCircle className="w-12 h-12 text-success-foreground" />
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-success/20 mx-auto animate-ping" style={{ animationDuration: "2s" }} />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Congrats! 🎉
            </h1>
            <p className="text-xl text-success font-medium mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your certificate is verified ✅
            </p>
            <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Your achievement has been authenticated and added to your profile.
            </p>

            {/* Trust Score Card */}
            <Card className="mb-6 shadow-medium border-success/20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Trust Score</span>
                  <span className="text-2xl font-bold text-success">{trustScore}%</span>
                </div>
                <Progress value={trustScore} className="h-3 mb-4" />
                <p className="text-sm text-muted-foreground text-left">{explanation}</p>
              </CardContent>
            </Card>

            {/* Verification Checks Card */}
            <Card className="mb-8 shadow-soft animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4 text-left">Verification Checks</h3>
                <div className="space-y-3">
                  {checks.map((check, index) => {
                    const Icon = getCheckIcon(check.name);
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          check.passed ? 'bg-success/5' : 'bg-warning/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          check.passed ? 'bg-success/10' : 'bg-warning/10'
                        }`}>
                          <Icon className={`w-4 h-4 ${check.passed ? 'text-success' : 'text-warning'}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-foreground">{check.name}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              check.passed 
                                ? 'bg-success/10 text-success' 
                                : 'bg-warning/10 text-warning'
                            }`}>
                              {check.score}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                        </div>
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                          check.passed ? 'text-success' : 'text-warning'
                        }`} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/student">
                  View Your CV
                  <FileText className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4" />
                Share Certificate
              </Button>
            </div>

            <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Button variant="ghost" asChild>
                <Link to="/verify">
                  Verify Another Certificate
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

export default UploadSuccess;
