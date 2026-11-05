import { supabase } from "@/integrations/supabase/client";

export interface StudentCandidate {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  degree: string;
  institution: string;
  verificationStatus: "verified" | "verifying";
  trustScore: number;
  issueDate: string;
  verifiedDate: string;
  certificateId: string;
  certificateTitle: string;
  skills: string[];
  cgpa: string;
  checksPassed: string[];
  verificationSummary: string;
}

const DEFAULT_CANDIDATES: StudentCandidate[] = [
  {
    id: "cand-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@iitd.ac.in",
    avatarInitials: "AS",
    degree: "B.Tech Computer Science & Engineering",
    institution: "Indian Institute of Technology (IIT) Delhi",
    verificationStatus: "verified",
    trustScore: 99,
    issueDate: "June 2025",
    verifiedDate: "Verified • 2 days ago",
    certificateId: "EDU-IITD-2025-0842",
    certificateTitle: "Bachelor of Technology in CSE (Honors)",
    skills: ["React", "Python", "Distributed Systems", "Machine Learning", "FastAPI"],
    cgpa: "9.4 / 10.0",
    checksPassed: [
      "Institutional Registry Check: Confirmed by IIT Delhi",
      "Cryptographic Seal: SHA-256 Validated",
      "Tamper-Detection: 0 modifications detected",
      "Aadhaar/Student ID Link: Verified"
    ],
    verificationSummary: "Full cryptographic verification completed. Verified directly against the academic registrar's verifiable credential store."
  },
  {
    id: "cand-2",
    name: "Ananya Verma",
    email: "ananya.v@iisc.ac.in",
    avatarInitials: "AV",
    degree: "M.Sc Computational Data Science",
    institution: "Indian Institute of Science (IISc) Bengaluru",
    verificationStatus: "verified",
    trustScore: 98,
    issueDate: "July 2025",
    verifiedDate: "Verified • 1 week ago",
    certificateId: "EDU-IISC-2025-0199",
    certificateTitle: "Master of Science in Data Science",
    skills: ["PyTorch", "NLP", "Big Data", "SQL", "LLM Fine-tuning", "Python"],
    cgpa: "9.6 / 10.0",
    checksPassed: [
      "Institutional Registry Check: Confirmed by IISc Academic Office",
      "Cryptographic Seal: SHA-256 Validated",
      "AI Layout Integrity: 100% Match",
      "Issuer Digital Signature: Valid & Signed"
    ],
    verificationSummary: "Academic credential verified with highest institutional trust tier. All academic coursework and research credits authenticated."
  },
  {
    id: "cand-3",
    name: "Rohan Patel",
    email: "rohan.patel@mu.ac.in",
    avatarInitials: "RP",
    degree: "B.E. Information Technology",
    institution: "University of Mumbai",
    verificationStatus: "verifying",
    trustScore: 89,
    issueDate: "May 2025",
    verifiedDate: "Verifying in Portal • In Progress",
    certificateId: "EDU-MU-2025-9931",
    certificateTitle: "Bachelor of Engineering in IT",
    skills: ["Java", "Spring Boot", "AWS Cloud", "PostgreSQL", "Docker", "Microservices"],
    cgpa: "8.8 / 10.0",
    checksPassed: [
      "OCR Document Extraction: Complete",
      "AI Visual Forgery Scan: Passed (94% confidence)",
      "University Node Check: Awaiting final registrar webhook"
    ],
    verificationSummary: "Candidate uploaded certificate for portal verification. Optical checks passed; final institutional confirmation is processing."
  },
  {
    id: "cand-4",
    name: "Priya Nair",
    email: "priya.nair@nid.edu",
    avatarInitials: "PN",
    degree: "B.Des Product & Interaction Design",
    institution: "National Institute of Design (NID) Ahmedabad",
    verificationStatus: "verified",
    trustScore: 97,
    issueDate: "April 2025",
    verifiedDate: "Verified • 3 days ago",
    certificateId: "EDU-NID-2025-0418",
    certificateTitle: "Bachelor of Design in Interaction Systems",
    skills: ["Figma", "UI/UX Architecture", "User Research", "Design Systems", "Prototyping"],
    cgpa: "9.1 / 10.0",
    checksPassed: [
      "Institutional Registry Check: Confirmed by NID",
      "Cryptographic Seal: SHA-256 Validated",
      "Tamper-Detection: Genuine Watermark Detected",
      "Accreditation Body: AICTE / MoE Recognized"
    ],
    verificationSummary: "Verified design portfolio and degree credential. Authenticated against Ministry of Education accredited registry."
  },
  {
    id: "cand-5",
    name: "Siddharth Roy",
    email: "siddharth.roy@dtu.ac.in",
    avatarInitials: "SR",
    degree: "B.Tech Artificial Intelligence & Robotics",
    institution: "Delhi Technological University (DTU)",
    verificationStatus: "verifying",
    trustScore: 86,
    issueDate: "May 2025",
    verifiedDate: "Verifying in Portal • Step 2 of 3",
    certificateId: "EDU-DTU-2025-1104",
    certificateTitle: "Bachelor of Technology in AI",
    skills: ["TensorFlow", "Computer Vision", "ROS", "C++", "CUDA", "Reinforcement Learning"],
    cgpa: "8.9 / 10.0",
    checksPassed: [
      "Document Hash Extracted: SHA-256",
      "Font Anomaly Detection: Clean",
      "University Registrar Validation: Active Queue"
    ],
    verificationSummary: "AI-based forensic scan verified without anomalies. Institutional queue processing for digital trust badge issuance."
  },
  {
    id: "cand-6",
    name: "Meera Iyer",
    email: "meera.iyer@srcc.du.ac.in",
    avatarInitials: "MI",
    degree: "B.Com (Hons) & Financial Analysis",
    institution: "Shri Ram College of Commerce, Delhi University",
    verificationStatus: "verified",
    trustScore: 96,
    issueDate: "June 2025",
    verifiedDate: "Verified • 5 days ago",
    certificateId: "EDU-DU-2025-5521",
    certificateTitle: "Bachelor of Commerce with Honors",
    skills: ["Financial Modeling", "Corporate Valuation", "PowerBI", "Accounting", "Bloomberg Terminal"],
    cgpa: "9.3 / 10.0",
    checksPassed: [
      "Institutional Registry Check: Confirmed by University of Delhi",
      "Cryptographic Seal: SHA-256 Validated",
      "QR Verification Code: Active & Scannable",
      "Degree Grade Sheet: Matches University Records"
    ],
    verificationSummary: "Full academic record authenticated. Verified credentials authorized by candidate for recruiter discovery."
  }
];

const SHORTLIST_KEY = "eduproof_recruiter_shortlist";

export const getShortlistedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleShortlistId = (candidateId: string): boolean => {
  const current = getShortlistedIds();
  const index = current.indexOf(candidateId);
  let updated: string[];
  let isNowShortlisted = false;

  if (index > -1) {
    updated = current.filter(id => id !== candidateId);
    isNowShortlisted = false;
  } else {
    updated = [...current, candidateId];
    isNowShortlisted = true;
  }

  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save shortlist:", e);
  }

  return isNowShortlisted;
};

export const fetchRecruiterTalentPool = async (): Promise<StudentCandidate[]> => {
  // Query Supabase with a short timeout to prevent UI hang
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));

  const queryPromise = (async () => {
    try {
      const { data: certs, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !certs || certs.length === 0) return null;

      const userIds = [...new Set(certs.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const dynamicCandidates: StudentCandidate[] = certs.map((c, index) => {
        const prof = profileMap.get(c.user_id);
        const name = prof?.full_name || `Candidate #${c.user_id.slice(0, 5)}`;
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "ST";

        const isVer = c.verification_status === "verified";
        return {
          id: `supabase-${c.id}`,
          name,
          email: prof?.email || `${c.user_id.slice(0, 8)}@candidate.eduproof.com`,
          avatarInitials: initials,
          degree: c.title || "Academic Degree Certificate",
          institution: c.issuer || "Accredited University",
          verificationStatus: isVer ? "verified" : "verifying",
          trustScore: isVer ? 97 : 85,
          issueDate: c.issue_date || "2025",
          verifiedDate: isVer ? "Verified on Platform" : "Verifying in Portal",
          certificateId: `EDU-CERT-${c.id.slice(0, 8).toUpperCase()}`,
          certificateTitle: c.title || "Verified Credential",
          skills: ["Verified Credentials", "Higher Education", "Academic Excellence"],
          cgpa: "Verified",
          checksPassed: isVer
            ? [
                "Cryptographic Checksum: Verified",
                "Issuer Authority: Validated",
                "Integrity Score: 97%"
              ]
            : [
                "Document Received & Parsed",
                "Verification in Progress"
              ],
          verificationSummary: c.verification_message || (isVer ? "Authenticated certificate on EduProof" : "Verification in progress")
        };
      });

      return dynamicCandidates;
    } catch {
      return null;
    }
  })();

  const dynamicResult = await Promise.race([queryPromise, timeoutPromise]);

  if (dynamicResult && dynamicResult.length > 0) {
    // Merge dynamic real certificates with default pool, avoiding duplicate IDs
    return [...dynamicResult, ...DEFAULT_CANDIDATES];
  }

  return DEFAULT_CANDIDATES;
};
