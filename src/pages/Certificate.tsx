import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { getCertificateById } from "@/utils/certificateStorage";
import { Award, Building2, Calendar, CheckCircle, Clock, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const Certificate = () => {
  const { id } = useParams<{ id: string }>();
  const certificate = id ? getCertificateById(id) : null;

  if (!certificate) {
    return (
      <Layout>
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Certificate Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The certificate you are looking for does not exist.
            </p>
            <Button variant="outline" asChild>
              <Link to="/student">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const isVerified = certificate.status === "Verified";

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Button variant="outline" size="sm" asChild className="mb-6">
              <Link to="/student">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isVerified ? "bg-success/10" : "bg-warning/10"
                  }`}
                >
                  <Award
                    className={`w-8 h-8 ${isVerified ? "text-success" : "text-warning"}`}
                  />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {certificate.degree}
                  </h1>
                  {isVerified && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        Verified Certificate
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <Award className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Candidate Name</p>
                    <p className="font-medium text-foreground">{certificate.candidateName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="font-medium text-foreground">{certificate.institution}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="font-medium text-foreground">
                      {certificate.issueDate || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  {isVerified ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p
                      className={`font-medium ${
                        isVerified ? "text-success" : "text-warning"
                      }`}
                    >
                      {certificate.status}
                    </p>
                  </div>
                </div>

                {certificate.fileName && (
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">File</p>
                      <p className="font-medium text-foreground">{certificate.fileName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Certificate;
