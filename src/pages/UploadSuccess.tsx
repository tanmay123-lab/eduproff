import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { CheckCircle, FileText, Share2, ArrowRight, Download } from "lucide-react";

const UploadSuccess = () => {
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
              You can now share it with recruiters or add it to your CV.
            </p>

            {/* Certificate Preview Card */}
            <div className="bg-card rounded-2xl p-6 shadow-medium border border-success/20 mb-8 text-left animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    Certificate Verified
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Verified on {new Date().toLocaleDateString()}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Authenticated
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
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

            <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
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
