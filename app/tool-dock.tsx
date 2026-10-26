"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (typeof window === "undefined" ? "http://localhost:5000" : `http://${window.location.hostname}:5000`);

export function ToolDock({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false); const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => { let active = true; const token = sessionStorage.getItem("hcm_token"); if (token) { void fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(response => response.json()).then(payload => { if (active && sessionStorage.getItem("hcm_token") === token) setAuthenticated(Boolean(payload.data?.user) && !payload.data.user.mustChangePassword); }).catch(() => { if (active) setAuthenticated(false); }); } const receiveAuth = (event: Event) => { const detail = (event as CustomEvent<{ authenticated?: boolean }>).detail; setAuthenticated(Boolean(detail?.authenticated)); }; const closeOnEscape = (event: KeyboardEvent) => { if (event.key !== "Escape") return; setOpen(false); document.querySelectorAll<HTMLElement>(".tool-dock .close-button").forEach(button => button.click()); }; window.addEventListener("nexora-auth", receiveAuth); window.addEventListener("keydown", closeOnEscape); return () => { active = false; window.removeEventListener("nexora-auth", receiveAuth); window.removeEventListener("keydown", closeOnEscape); }; }, []);
  const closeOtherPanels = (event: MouseEvent<HTMLDivElement>) => { const target = event.target as HTMLElement; const launcher = target.closest(".leave-launcher,.correction-launcher,.holiday-launcher,.notification-launcher,.audit-launcher,.payroll-launcher,.analytics-launcher,.ai-launcher"); if (!launcher) return; setOpen(false); const currentWidget = launcher.parentElement; Array.from(event.currentTarget.children).forEach(child => { if (child !== currentWidget) child.querySelector<HTMLElement>(".close-button")?.click(); }); };
  if (!authenticated) return null;
  return <div className={`tool-dock ${open ? "open" : "closed"}`}><div className="tool-dock-items" onClickCapture={closeOtherPanels}>{children}</div><button className="tool-dock-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Hide workspace tools" : "Show workspace tools"} title={open ? "Hide workspace tools" : "Show workspace tools"}><span aria-hidden="true">{open ? "×" : "⚒"}</span></button></div>;
}
