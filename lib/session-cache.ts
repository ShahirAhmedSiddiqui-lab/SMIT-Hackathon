"use client";

export const SESSION_SNAPSHOT_KEY = "nexora_session_snapshot";
export const SESSION_SNAPSHOT_TTL = 30 * 60 * 1000;

type Role = "admin" | "hr" | "employee";

export type SessionSnapshot = {
  token: string;
  user: { id: string; name: string; email: string; role: Role; mustChangePassword: boolean };
  organization: Record<string, unknown>;
  activeSection: string;
  savedAt: number;
};

export function readSessionSnapshot(): SessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SessionSnapshot>;
    const user = value.user;
    if (!value.token || !user || !value.organization || !value.savedAt || Date.now() - value.savedAt > SESSION_SNAPSHOT_TTL) {
      clearSessionSnapshot();
      return null;
    }
    if (!user.id || !user.name || !user.email || !["admin", "hr", "employee"].includes(user.role ?? "")) {
      clearSessionSnapshot();
      return null;
    }
    return value as SessionSnapshot;
  } catch {
    clearSessionSnapshot();
    return null;
  }
}

export function writeSessionSnapshot(snapshot: Omit<SessionSnapshot, "savedAt">) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
}

export function clearSessionSnapshot() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_SNAPSHOT_KEY);
}
