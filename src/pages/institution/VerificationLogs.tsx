import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// Mock verification logs (to be replaced with real data later)
const MOCK_LOGS = [
  { id: "1", certificateCode: "EDU-2025-001", verifiedBy: "TechCorp Recruiting", date: "2025-04-01", status: "Verified" as const },
  { id: "2", certificateCode: "EDU-2025-002", verifiedBy: "StartupX HR", date: "2025-04-05", status: "Verified" as const },
  { id: "3", certificateCode: "FAKE-9999", verifiedBy: "BigCo Talent", date: "2025-04-08", status: "Invalid" as const },
  { id: "4", certificateCode: "EDU-2025-003", verifiedBy: "InnovateCo", date: "2025-04-12", status: "Verified" as const },
  { id: "5", certificateCode: "XYZ-0001", verifiedBy: "GlobalHR Inc", date: "2025-04-15", status: "Invalid" as const },
];

const VerificationLogs = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Verification Logs
        </h1>
        <p className="text-muted-foreground">
          Track how your certificates are being verified by recruiters.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate ID</TableHead>
              <TableHead>Verified By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_LOGS.map(log => (
              <TableRow key={log.id}>
                <TableCell>
                  <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                    {log.certificateCode}
                  </code>
                </TableCell>
                <TableCell className="font-medium">{log.verifiedBy}</TableCell>
                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {log.status === "Verified" ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                      <XCircle className="w-3 h-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VerificationLogs;
