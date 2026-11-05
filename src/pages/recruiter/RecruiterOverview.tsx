import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
import {
  fetchRecruiterTalentPool,
  getShortlistedIds,
  toggleShortlistId,
  StudentCandidate,
} from "@/services/recruiterTalentService";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  GraduationCap,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Mail,
  Award,
  Sparkles,
  TrendingUp,
  FileCheck2,
} from "lucide-react";

const RecruiterOverview = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "Recruiter";

  const [candidates, setCandidates] = useState<StudentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "verifying" | "shortlisted">("all");
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<StudentCandidate | null>(null);

  useEffect(() => {
    loadTalentPool();
    setShortlistedIds(getShortlistedIds());
  }, []);

  const loadTalentPool = async () => {
    setLoading(true);
    try {
      const data = await fetchRecruiterTalentPool();
      setCandidates(data);
    } catch (e) {
      console.error("Error loading talent pool:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = (id: string, name: string) => {
    const isNow = toggleShortlistId(id);
    setShortlistedIds(getShortlistedIds());
    if (isNow) {
      toast.success(`${name} added to your shortlisted candidates`);
    } else {
      toast.info(`${name} removed from shortlist`);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const isShortlisted = shortlistedIds.includes(c.id);

    if (activeFilter === "verified" && c.verificationStatus !== "verified") return false;
    if (activeFilter === "verifying" && c.verificationStatus !== "verifying") return false;
    if (activeFilter === "shortlisted" && !isShortlisted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDegree = c.degree.toLowerCase().includes(q);
      const matchInst = c.institution.toLowerCase().includes(q);
      const matchSkill = c.skills.some((s) => s.toLowerCase().includes(q));
      return matchName || matchDegree || matchInst || matchSkill;
    }

    return true;
  });

  const totalCandidates = candidates.length;
  const verifiedCount = candidates.filter((c) => c.verificationStatus === "verified").length;
  const verifyingCount = candidates.filter((c) => c.verificationStatus === "verifying").length;
  const avgTrustScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((acc, c) => acc + c.trustScore, 0) / candidates.length)
      : 96;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 md:p-10 border border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5" />
              Verified Student Talent Pool
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome, {userName}! 👋
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
              Explore authentic profiles of students who have verified or are currently verifying their academic credentials on EduProof.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="hero"
              className="rounded-full shadow-lg"
              onClick={() => setActiveFilter("verified")}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verified Candidates ({verifiedCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalCandidates}</div>
          <p className="text-xs text-muted-foreground mt-1">Registered & verified on portal</p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verified Credentials
            </span>
            <div className="w-10 h-10 rounded-2xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{verifiedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">100% Institution Authenticated</p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verifying in Portal
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{verifyingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">In active verification pipeline</p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Trust Index
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{avgTrustScore}%</div>
          <p className="text-xs text-muted-foreground mt-1">Cryptographic & AI score</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, degree, institution, or skills..."
              className="pl-11 h-12 rounded-full border-border/60 bg-background/50 focus:bg-background transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All Students ({candidates.length})
            </button>
            <button
              onClick={() => setActiveFilter("verified")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === "verified"
                  ? "bg-success text-success-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Only ({verifiedCount})
            </button>
            <button
              onClick={() => setActiveFilter("verifying")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === "verifying"
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              In Verification ({verifyingCount})
            </button>
            <button
              onClick={() => setActiveFilter("shortlisted")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === "shortlisted"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Shortlisted ({shortlistedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Directory List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">
            {activeFilter === "shortlisted"
              ? "Shortlisted Candidates"
              : activeFilter === "verified"
              ? "Verified Candidates"
              : activeFilter === "verifying"
              ? "Candidates Currently Verifying"
              : "Students with Verified Credentials"}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 text-center border border-border/50 shadow-soft space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">No students matched</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? `No candidates found matching "${searchQuery}". Try searching another name or skill.`
                : "No candidates currently in this category."}
            </p>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCandidates.map((candidate) => {
              const isShortlisted = shortlistedIds.includes(candidate.id);
              const isVerified = candidate.verificationStatus === "verified";

              return (
                <div
                  key={candidate.id}
                  className="bg-card rounded-3xl p-6 sm:p-7 shadow-soft border border-border/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Name, Shortlist Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl gradient-hero text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm">
                          {candidate.avatarInitials}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                            {candidate.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
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
                        title={isShortlisted ? "Remove from shortlist" : "Save candidate"}
                      >
                        {isShortlisted ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Degree & Institution */}
                    <div className="bg-secondary/40 rounded-2xl p-4 border border-border/40 space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                        <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{candidate.degree}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">{candidate.institution}</span>
                      </div>
                    </div>

                    {/* Badges: Trust Score, Verification Status, CGPA */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified Credential
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          Verifying in Portal
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <Sparkles className="w-3 h-3" />
                        {candidate.trustScore}% Trust Score
                      </span>

                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        Grade: {candidate.cgpa}
                      </span>
                    </div>

                    {/* Skills Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {candidate.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-medium bg-muted text-foreground/80 px-2.5 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-[11px] text-muted-foreground px-2 py-0.5">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-6 mt-6 border-t border-border/40 flex items-center gap-3">
                    <Button
                      variant="hero"
                      size="sm"
                      className="flex-1 rounded-full text-xs font-semibold"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                      View Verified Credentials
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                      asChild
                    >
                      <a href={`mailto:${candidate.email}?subject=EduProof Inquiry regarding your Verified Credentials`}>
                        <Mail className="w-3.5 h-3.5 mr-1" />
                        Contact
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Credentials Detail Modal */}
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

              {/* Certificate Information Card */}
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
                    <span className="font-semibold text-foreground block">Issuing Authority:</span>
                    {selectedCandidate.institution}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Issue Date & Year:</span>
                    {selectedCandidate.issueDate}
                  </div>
                </div>
              </div>

              {/* Verification Checks Breakdown */}
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

              {/* Summary */}
              <div className="bg-muted/30 rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground block mb-1">Authenticity Audit Summary:</strong>
                {selectedCandidate.verificationSummary}
              </div>

              {/* Modal Footer Actions */}
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
                  <a href={`mailto:${selectedCandidate.email}?subject=Interview Invitation via EduProof`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Connect with Candidate
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

export default RecruiterOverview;
