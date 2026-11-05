import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchRecruiterTalentPool,
  getShortlistedIds,
  toggleShortlistId,
  StudentCandidate,
} from "@/services/recruiterTalentService";
import { toast } from "sonner";
import {
  Search,
  Building2,
  GraduationCap,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck2,
} from "lucide-react";

const RecruiterStudents = () => {
  const [candidates, setCandidates] = useState<StudentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "verifying">("all");
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<StudentCandidate | null>(null);

  useEffect(() => {
    loadData();
    setShortlistedIds(getShortlistedIds());
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchRecruiterTalentPool();
    setCandidates(data);
    setLoading(false);
  };

  const handleToggleShortlist = (id: string, name: string) => {
    const isNow = toggleShortlistId(id);
    setShortlistedIds(getShortlistedIds());
    if (isNow) {
      toast.success(`${name} added to shortlist`);
    } else {
      toast.info(`${name} removed from shortlist`);
    }
  };

  const filtered = candidates.filter((c) => {
    if (statusFilter === "verified" && c.verificationStatus !== "verified") return false;
    if (statusFilter === "verifying" && c.verificationStatus !== "verifying") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.degree.toLowerCase().includes(q) ||
        c.institution.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          Student Candidate Directory
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Verified Students & Candidates
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse students who have verified or are currently validating credentials in the EduProof portal.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, college, degree, or skill..."
            className="pl-11 h-11 rounded-full border-border/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Candidates ({candidates.length})
          </button>
          <button
            onClick={() => setStatusFilter("verified")}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === "verified"
                ? "bg-success text-success-foreground shadow"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified ({candidates.filter((c) => c.verificationStatus === "verified").length})
          </button>
          <button
            onClick={() => setStatusFilter("verifying")}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === "verifying"
                ? "bg-amber-500 text-white shadow"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            In Verification ({candidates.filter((c) => c.verificationStatus === "verifying").length})
          </button>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((candidate) => {
          const isShortlisted = shortlistedIds.includes(candidate.id);
          const isVerified = candidate.verificationStatus === "verified";

          return (
            <div
              key={candidate.id}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-hero text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm">
                      {candidate.avatarInitials}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {candidate.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleShortlist(candidate.id, candidate.name)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isShortlisted
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  >
                    {isShortlisted ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="bg-secondary/40 rounded-2xl p-4 border border-border/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                    <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{candidate.degree}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{candidate.institution}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      Verifying
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    <Sparkles className="w-3 h-3" />
                    {candidate.trustScore}% Trust
                  </span>

                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    CGPA: {candidate.cgpa}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium bg-muted text-foreground/80 px-2.5 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/40 flex items-center gap-3">
                <Button
                  variant="hero"
                  size="sm"
                  className="flex-1 rounded-full text-xs font-semibold"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                  View Credentials
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  asChild
                >
                  <a href={`mailto:${candidate.email}?subject=EduProof Recruiter Connect`}>
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Contact
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8">
          {selectedCandidate && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl gradient-hero text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {selectedCandidate.avatarInitials}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                      {selectedCandidate.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {selectedCandidate.email} • {selectedCandidate.verifiedDate}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="bg-primary/5 rounded-3xl p-5 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Certificate Details
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 text-primary font-bold">
                    {selectedCandidate.certificateId}
                  </span>
                </div>
                <h4 className="font-display font-bold text-foreground text-base">
                  {selectedCandidate.certificateTitle}
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground block">Issuing Institution:</span>
                    {selectedCandidate.institution}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Issue Date:</span>
                    {selectedCandidate.issueDate}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Verification & Cryptographic Checks
                </h4>
                <div className="space-y-2">
                  {selectedCandidate.checksPassed.map((check, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs flex items-center gap-2 text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setSelectedCandidate(null)}
                >
                  Close
                </Button>
                <Button
                  variant="hero"
                  className="rounded-full"
                  asChild
                >
                  <a href={`mailto:${selectedCandidate.email}?subject=EduProof Recruiter Connect`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Candidate
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruiterStudents;

