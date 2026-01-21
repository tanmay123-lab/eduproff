import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { Search, FileText, Headphones, Users, Award, MapPin, Briefcase } from "lucide-react";

// Placeholder candidate data
const candidates = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Full Stack Developer",
    location: "San Francisco, CA",
    certifications: 5,
    skills: ["React", "Node.js", "Python"],
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Data Scientist",
    location: "New York, NY",
    certifications: 4,
    skills: ["Python", "TensorFlow", "SQL"],
  },
  {
    id: 3,
    name: "Emily Davis",
    title: "Cloud Engineer",
    location: "Seattle, WA",
    certifications: 6,
    skills: ["AWS", "Kubernetes", "Terraform"],
  },
];

const Recruiter = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Recruiter Dashboard
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hi there! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Find verified talent in seconds. Browse candidates with authenticated credentials and connect with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              to="#search"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Search Candidates
              </h3>
              <p className="text-muted-foreground text-sm">
                Find talent with verified credentials
              </p>
            </Link>

            <Link
              to="#candidates"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                View Candidate CVs
              </h3>
              <p className="text-muted-foreground text-sm">
                Browse complete verified profiles
              </p>
            </Link>

            <Link
              to="/support"
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium hover:border-accent/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Headphones className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Contact Support
              </h3>
              <p className="text-muted-foreground text-sm">
                Get help with your recruiting needs
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Search Verified Candidates
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by skill, job title, or certification..."
                  className="h-12"
                />
              </div>
              <Button variant="hero" size="lg">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Candidates List */}
      <section id="candidates" className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Featured Candidates
              </h2>
              <p className="text-muted-foreground">
                Top verified professionals ready for opportunities
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-medium transition-shadow"
              >
                {/* Avatar placeholder */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {candidate.name}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {candidate.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Award className="w-4 h-4" />
                    {candidate.certifications} Verified Certificates
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  View Full Profile
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Recruiter;
