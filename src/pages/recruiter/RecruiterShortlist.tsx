import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  BookmarkCheck,
  BookmarkX,
  GraduationCap,
  Building2,
  Mail,
  CheckCircle2,
  Sparkles,
  FileCheck2,
  ShieldCheck,
  Users,
} from "lucide-react";

const RecruiterShortlist = () => {
  const [candidates, setCandidates] = useState<StudentCandidate[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<StudentCandidate | null>(null);

  useEffect(() => {
    loadData();
    setShortlistedIds(getShortlistedIds());
  }, []);

  const loadData = async () => {
    const data = await fetchRecruiterTalentPool();
    setCandidates(data);
  };

  const handleRemoveShortlist = (id: string, name: string) => {
    toggleShortlistId(id);
    setShortlistedIds(getShortlistedIds());
    toast.info(`${name} removed from your shortlist`);
  };

  const shortlistedCandidates = candidates.filter((c) => shortlistedIds.includes(c.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <BookmarkCheck className="w-3.5 h-3.5" />
          Hiring Pipeline
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Shortlisted Candidates ({shortlistedCandidates.length})
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Students you have saved for interviewing and hiring consideration.
        </p>
      </div>

      {shortlistedCandidates.length === 0 ? (
        <div className="bg-card rounded-3xl p-12 text-center border border-border/50 shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            No candidates shortlisted yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Browse through the verified student directory and click the bookmark icon on any candidate to save them here.
          </p>
          <Button variant="hero" className="rounded-full" asChild>
            <Link to="/recruiter">
              <Users className="w-4 h-4 mr-2" />
              Explore Student Directory
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {shortlistedCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-card rounded-3xl p-6 shadow-soft border border-border/50 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl gradient-hero text-primary-foreground flex items-center justify-center font-bold text-base">
                      {candidate.avatarInitials}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {candidate.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveShortlist(candidate.id, candidate.name)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                    title="Remove from shortlist"
                  >
                    <BookmarkX className="w-4 h-4" />
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    <Sparkles className="w-3 h-3" />
                    {candidate.trustScore}% Trust Score
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    CGPA: {candidate.cgpa}
                  </span>
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
                  <a href={`mailto:${candidate.email}?subject=EduProof Interview Opportunity`}>
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Email
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
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
                      {selectedCandidate.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="bg-primary/5 rounded-3xl p-5 border border-primary/20 space-y-3">
                <h4 className="font-display font-bold text-foreground text-base">
                  {selectedCandidate.certificateTitle}
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground block">Institution:</span>
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
                  Verification & Checks
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
                  <a href={`mailto:${selectedCandidate.email}?subject=EduProof Interview Invitation`}>
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

export default RecruiterShortlist;

