const STORAGE_KEY = "eduproofs_certificates";

export interface StoredCertificate {
  id: string;
  candidateName: string;
  degree: string;
  institution: string;
  issueDate: string;
  status: "Pending" | "Verified" | "Failed";
  fileName?: string;
  createdAt: string;
}

export function getCertificates(): StoredCertificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredCertificate[];
  } catch {
    return [];
  }
}

export function addCertificate(certificate: StoredCertificate): void {
  const certs = getCertificates();
  certs.unshift(certificate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}

export function getCertificateById(id: string): StoredCertificate | null {
  return getCertificates().find((c) => c.id === id) ?? null;
}

export function deleteCertificate(id: string): void {
  const certs = getCertificates().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}
