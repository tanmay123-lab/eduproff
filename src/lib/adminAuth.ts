const ADMIN_STORAGE_KEY = "eduproof_admin_authenticated";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "admin@eduproof.com";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "Admin@123";

export function adminLogin(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_STORAGE_KEY) === "true";
}
