"use client";

import { useEffect, useState } from "react";

const items = ["Dashboard", "Organization", "Employees", "Attendance", "Leave", "Payroll", "Analytics", "AI Assistant", "Audit Logs", "Settings"];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(Boolean(document.querySelector(".app-shell")));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    const onAuth = (event: Event) => {
      const authenticated = (event as CustomEvent<{ authenticated?: boolean }>).detail?.authenticated;
      setVisible(authenticated === false ? false : Boolean(document.querySelector(".app-shell")));
    };
    window.addEventListener("nexora-auth", onAuth);
    return () => {
      observer.disconnect();
      window.removeEventListener("nexora-auth", onAuth);
    };
  }, []);

  if (!visible) return null;
  const navigate = (label: string) => {
    const target = Array.from(document.querySelectorAll<HTMLButtonElement>(".sidebar nav button")).find(button => button.textContent?.includes(label));
    if (target) target.click();
    setOpen(false);
  };

  return <>
    <button className="mobile-menu-button" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(value => !value)}><span aria-hidden="true">☰</span></button>
    {open && <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={open ? "mobile-nav-drawer open" : "mobile-nav-drawer"} aria-label="Mobile navigation">
      <div className="mobile-nav-head"><strong>Nexora</strong><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>×</button></div>
      <nav>{items.map(item => <button key={item} type="button" onClick={() => navigate(item)}>{item}</button>)}</nav>
      <button className="mobile-nav-signout" type="button" onClick={() => { document.querySelector<HTMLButtonElement>(".sidebar .logout")?.click(); setOpen(false); }}>Sign out</button>
    </aside>
  </>;
}
