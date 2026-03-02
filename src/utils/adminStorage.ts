export interface StoredUser {
  id: string;
  email: string;
  role: "candidate" | "recruiter" | "institution" | "admin";
  fullName?: string;
  registeredAt: string;
}

export interface StoredCertificate {
  id: string;
  title: string;
  issuer: string;
  userId: string;
  userEmail?: string;
  status: string;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  action: "user_registered" | "certificate_uploaded" | "certificate_viewed" | "verification_happened";
  userId: string;
  userEmail: string;
  timestamp: string;
  details?: string;
}

const KEYS = {
  USERS: "users",
  CERTIFICATES: "certificates",
  ACTIVITY_LOGS: "activity_logs",
  ADMIN_EMAILS: "admin_emails",
};

export function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  } catch {
    return [];
  }
}

export function upsertStoredUser(user: StoredUser): void {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getStoredCertificates(): StoredCertificate[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.CERTIFICATES) || "[]");
  } catch {
    return [];
  }
}

export function upsertStoredCertificate(cert: StoredCertificate): void {
  const certs = getStoredCertificates();
  const idx = certs.findIndex((c) => c.id === cert.id);
  if (idx >= 0) {
    certs[idx] = cert;
  } else {
    certs.push(cert);
  }
  localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(certs));
}

export function getActivityLogs(): ActivityLog[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.ACTIVITY_LOGS) || "[]");
  } catch {
    return [];
  }
}

export function logActivity(
  action: ActivityLog["action"],
  userId: string,
  userEmail: string,
  details?: string
): void {
  const logs = getActivityLogs();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  logs.unshift({
    id,
    action,
    userId,
    userEmail,
    timestamp: new Date().toISOString(),
    details,
  });
  localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(logs.slice(0, 500)));
}

export function isAdminEmail(email: string): boolean {
  try {
    const adminEmails: string[] = JSON.parse(
      localStorage.getItem(KEYS.ADMIN_EMAILS) || "[]"
    );
    return adminEmails.includes(email);
  } catch {
    return false;
  }
}

export function addAdminEmail(email: string): void {
  try {
    const adminEmails: string[] = JSON.parse(
      localStorage.getItem(KEYS.ADMIN_EMAILS) || "[]"
    );
    if (!adminEmails.includes(email)) {
      adminEmails.push(email);
      localStorage.setItem(KEYS.ADMIN_EMAILS, JSON.stringify(adminEmails));
    }
  } catch {
    // ignore
  }
}

export function getActionLabel(action: ActivityLog["action"]): string {
  switch (action) {
    case "user_registered":
      return "User Registered";
    case "certificate_uploaded":
      return "Certificate Uploaded";
    case "certificate_viewed":
      return "Certificate Viewed";
    case "verification_happened":
      return "Verification Performed";
    default:
      return action;
  }
}
