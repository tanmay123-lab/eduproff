import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface IssuedCertificate {
  id: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  certificateCode: string;
  issuedAt: string;
}

export interface VerificationLog {
  id: string;
  certificateCode: string;
  verifiedBy: string;
  date: string;
  status: "Verified" | "Invalid";
}

interface InstitutionContextType {
  issuedCertificates: IssuedCertificate[];
  verificationLogs: VerificationLog[];
  issueCertificate: (studentName: string, courseName: string, issueDate: string) => IssuedCertificate;
  getValidCodes: () => string[];
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

// Pre-seeded data
const INITIAL_CERTIFICATES: IssuedCertificate[] = [
  { id: "1", studentName: "Alice Johnson", courseName: "Data Science Fundamentals", issueDate: "2025-01-15", certificateCode: "EDU-2025-001", issuedAt: "2025-01-15T10:00:00Z" },
  { id: "2", studentName: "Bob Smith", courseName: "Cloud Computing", issueDate: "2025-02-01", certificateCode: "EDU-2025-002", issuedAt: "2025-02-01T10:00:00Z" },
  { id: "3", studentName: "Carol Davis", courseName: "Machine Learning", issueDate: "2025-03-10", certificateCode: "EDU-2025-003", issuedAt: "2025-03-10T10:00:00Z" },
];

const MOCK_LOGS: VerificationLog[] = [
  { id: "1", certificateCode: "EDU-2025-001", verifiedBy: "TechCorp Recruiting", date: "2025-04-01", status: "Verified" },
  { id: "2", certificateCode: "EDU-2025-002", verifiedBy: "StartupX HR", date: "2025-04-05", status: "Verified" },
  { id: "3", certificateCode: "FAKE-9999", verifiedBy: "BigCo Talent", date: "2025-04-08", status: "Invalid" },
  { id: "4", certificateCode: "EDU-2025-003", verifiedBy: "InnovateCo", date: "2025-04-12", status: "Verified" },
  { id: "5", certificateCode: "XYZ-0001", verifiedBy: "GlobalHR Inc", date: "2025-04-15", status: "Invalid" },
];

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>(INITIAL_CERTIFICATES);
  const [counter, setCounter] = useState(4);

  const issueCertificate = useCallback((studentName: string, courseName: string, issueDate: string) => {
    const year = new Date().getFullYear();
    const code = `COLL-${year}-${String(counter).padStart(4, "0")}`;
    const cert: IssuedCertificate = {
      id: crypto.randomUUID(),
      studentName,
      courseName,
      issueDate,
      certificateCode: code,
      issuedAt: new Date().toISOString(),
    };
    setIssuedCertificates(prev => [cert, ...prev]);
    setCounter(c => c + 1);
    return cert;
  }, [counter]);

  const getValidCodes = useCallback(() => {
    return issuedCertificates.map(c => c.certificateCode);
  }, [issuedCertificates]);

  return (
    <InstitutionContext.Provider value={{ issuedCertificates, verificationLogs: MOCK_LOGS, issueCertificate, getValidCodes }}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) throw new Error("useInstitution must be used within InstitutionProvider");
  return context;
}
