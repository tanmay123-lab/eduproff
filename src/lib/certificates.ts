const LS_KEY = "eduproof_certificates";

export interface LSCertificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  certificate_url: string | null;
  verification_status: "pending" | "verified" | "failed";
  verification_message: string | null;
  created_at: string;
  updated_at: string;
}

export function getAllLSCertificates(): LSCertificate[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch (err) {
    console.error("[certificates] Failed to parse localStorage:", err);
    return [];
  }
}

export function saveLSCertificate(cert: LSCertificate): void {
  const all = getAllLSCertificates();
  const idx = all.findIndex((c) => c.id === cert.id);
  if (idx >= 0) {
    all[idx] = cert;
  } else {
    all.unshift(cert);
  }
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function deleteLSCertificate(id: string): void {
  const all = getAllLSCertificates().filter((c) => c.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function getLSCertificateById(id: string): LSCertificate | null {
  return getAllLSCertificates().find((c) => c.id === id) ?? null;
}
