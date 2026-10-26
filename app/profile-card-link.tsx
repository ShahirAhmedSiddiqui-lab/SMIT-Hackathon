"use client";

import { useEffect } from "react";

export function ProfileCardLink() {
  useEffect(() => {
    const open = () => window.dispatchEvent(new Event("nexora-profile"));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    };
    const onClick = (event: MouseEvent) => { const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".sidebar .role-chip, .topbar .avatar") : null; if (target) open(); };
    const enhance = () => document.querySelectorAll<HTMLElement>(".sidebar .role-chip, .topbar .avatar").forEach(target => { target.setAttribute("role", "button"); target.setAttribute("tabindex", "0"); target.setAttribute("aria-label", "Open profile"); });
    const observer = new MutationObserver(enhance);
    enhance();
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => { observer.disconnect(); document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKeyDown); };
  }, []);
  return null;
}
