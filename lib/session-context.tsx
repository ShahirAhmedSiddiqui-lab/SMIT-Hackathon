"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readSessionSnapshot } from "./session-cache";

type Role = "admin" | "hr" | "employee";
type SessionUser = { id: string; name: string; email: string; role: Role; mustChangePassword: boolean; hasStaffProfile?: boolean };
type SessionValue = { token: string; user: SessionUser | null; organization: Record<string, unknown> | null; authenticated: boolean; isValidated: boolean; isRefreshing: boolean };

const SessionContext = createContext<SessionValue>({ token: "", user: null, organization: null, authenticated: false, isValidated: false, isRefreshing: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (typeof window === "undefined" ? "http://localhost:5000" : `http://${window.location.hostname}:5000`);
const WARMUP_KEY = "nexora_api_warmed";

function warmApi() {
  if (typeof window === "undefined" || window.sessionStorage.getItem(WARMUP_KEY)) return;
  window.sessionStorage.setItem(WARMUP_KEY, "1");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);
  void fetch(`${API_URL}/api/health`, { cache: "no-store", signal: controller.signal, credentials: "omit" }).catch(() => undefined).finally(() => window.clearTimeout(timeout));
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionValue>({ token: "", user: null, organization: null, authenticated: false, isValidated: false, isRefreshing: false });

  useEffect(() => {
    warmApi();
    const sync = (event?: Event) => {
      const token = sessionStorage.getItem("hcm_token") ?? "";
      const cached = event ? null : readSessionSnapshot();
      const detail = event ? (event as CustomEvent<{ user?: SessionUser; organization?: Record<string, unknown>; authenticated?: boolean; validated?: boolean }>).detail : undefined;
      const effectiveToken = token || cached?.token || "";
      const hasSession = Boolean(effectiveToken && (detail?.authenticated ?? Boolean(cached)));
      setSession({ token: effectiveToken, user: detail?.user ?? cached?.user ?? null, organization: detail?.organization ?? cached?.organization ?? null, authenticated: hasSession, isValidated: Boolean(detail?.validated), isRefreshing: hasSession && !Boolean(detail?.validated) });
    };
    sync();
    window.addEventListener("nexora-auth", sync);
    return () => window.removeEventListener("nexora-auth", sync);
  }, []);

  const value = useMemo(() => session, [session]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
