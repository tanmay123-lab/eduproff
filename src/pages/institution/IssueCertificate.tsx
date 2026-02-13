import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInstitution } from "@/contexts/InstitutionContext";
import { useToast } from "@/hooks/use-toast";
import { FilePlus, CheckCircle, Copy } from "lucide-react";

const IssueCertificate = () => {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const { issueCertificate } = useInstitution();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !courseName.trim() || !issueDate) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    const cert = issueCertificate(studentName.trim(), courseName.trim(), issueDate);
    setIssuedCode(cert.certificateCode);
    toast({ title: "Certificate Issued! 🎉", description: `Code: ${cert.certificateCode}` });
    setStudentName("");
    setCourseName("");
    setIssueDate("");
  };

  const copyCode = () => {
    if (issuedCode) {
      navigator.clipboard.writeText(issuedCode);
      toast({ title: "Copied!", description: "Certificate code copied to clipboard." });
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FilePlus className="w-6 h-6 text-primary" />
          Issue Certificate
        </h1>
        <p className="text-muted-foreground">
          Fill in the details to issue a new certificate with an auto-generated code.
        </p>
      </div>

      {issuedCode && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="font-semibold text-foreground">Certificate Issued Successfully!</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-background rounded-lg text-sm font-mono font-bold text-foreground">
              {issuedCode}
            </code>
            <Button variant="ghost" size="icon" onClick={copyCode} className="h-8 w-8">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 space-y-5">
        <div>
          <Label htmlFor="studentName">Student Name *</Label>
          <Input id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Alice Johnson" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="courseName">Course Name *</Label>
          <Input id="courseName" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Data Science Fundamentals" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="issueDate">Issue Date *</Label>
          <Input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="mt-1.5" />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full">
          <FilePlus className="w-4 h-4" />
          Issue Certificate
        </Button>
      </form>
    </div>
  );
};

export default IssueCertificate;
