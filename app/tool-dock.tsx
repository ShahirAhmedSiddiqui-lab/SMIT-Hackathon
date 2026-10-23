"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Wrench, X } from "lucide-react";
import { useUiStore } from "@/lib/ui-store";
import { useSession } from "@/lib/session-context";

export function ToolDock({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false); const { authenticated } = useSession(); const setActiveTool = useUiStore((state) => state.setActiveTool);
  useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => { if (event.key !== "Escape") return; setOpen(false); document.querySelectorAll<HTMLElement>(".tool-dock .close-button").forEach(button => button.click()); }; window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, []);
  const closeOtherPanels = (event: MouseEvent<HTMLDivElement>) => { const target = event.target as HTMLElement; const launcher = target.closest(".leave-launcher,.correction-launcher,.holiday-launcher,.notification-launcher,.audit-launcher,.payroll-launcher,.analytics-launcher,.ai-launcher"); if (!launcher) return; setOpen(false); const currentWidget = launcher.parentElement; const id = launcher.className.match(/(leave|correction|holiday|notification|audit|payroll|analytics|ai)-launcher/)?.[1]; setActiveTool((id as Parameters<typeof setActiveTool>[0]) ?? null); Array.from(event.currentTarget.children).forEach(child => { if (child !== currentWidget) child.querySelector<HTMLElement>(".close-button")?.click(); }); };
  if (!authenticated) return null;
  return <div className={`tool-dock ${open ? "open" : "closed"}`}><div className="tool-dock-items" onClickCapture={closeOtherPanels}>{children}</div><button className="tool-dock-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Hide workspace tools" : "Show workspace tools"} title={open ? "Hide workspace tools" : "Show workspace tools"}>{open ? <X aria-hidden="true" /> : <Wrench aria-hidden="true" />}</button></div>;
}
