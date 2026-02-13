import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useInstitution } from "@/contexts/InstitutionContext";
import { Search, FileText, Calendar, User, Hash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const IssuedCertificates = () => {
  const { issuedCertificates } = useInstitution();
  const [search, setSearch] = useState("");

  const filtered = issuedCertificates.filter(c => {
    const q = search.toLowerCase();
    return c.studentName.toLowerCase().includes(q) || c.certificateCode.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Issued Certificates
        </h1>
        <p className="text-muted-foreground">
          {issuedCertificates.length} certificate{issuedCertificates.length !== 1 ? "s" : ""} issued
        </p>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Student Name</span></TableHead>
              <TableHead><span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Course</span></TableHead>
              <TableHead><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Issue Date</span></TableHead>
              <TableHead><span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Certificate Code</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No certificates found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(cert => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.studentName}</TableCell>
                  <TableCell>{cert.courseName}</TableCell>
                  <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                      {cert.certificateCode}
                    </code>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IssuedCertificates;
