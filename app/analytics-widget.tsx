"use client";

import { useState } from "react";
import { useSession } from "@/lib/session-context";
import { API_URL } from "@/lib/api-client";

type Summary = { role: string; headcount?: number; attendance?: { present: number; late: number }; approvals?: { leave: number; corrections: number }; payroll?: { net: number } | null; attendanceToday?: { status: string } | null; pendingLeave?: number; payslip?: { netPay: number } | null };

export function AnalyticsWidget() {
  const { token } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    if (!token || loading) return;
    setLoading(true); setError("");
    try { const response = await fetch(`${API_URL}/api/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.message ?? "Analytics unavailable"); setSummary(payload.data); }
    catch (err) { setError(err instanceof Error ? err.message : "Analytics unavailable"); }
    finally { setLoading(false); }
  };
  if (!token) return null;
  return <div className="analytics-widget"><button className="analytics-launcher" onClick={() => { setOpen(value => !value); if (!open) void load(); }} aria-expanded={open}><span aria-hidden="true">o</span> Analytics</button>{open && <section className="analytics-popover"><div className="leave-popover-head"><div><span className="panel-kicker">LIVE DATA</span><h2>People overview</h2></div><button className="close-button" onClick={() => setOpen(false)} aria-label="Close analytics">x</button></div>{loading && <p className="empty-copy">Loading overview...</p>}{error && <div className="form-error" role="alert">{error}</div>}{summary && <div className="analytics-grid">{summary.role === "employee" ? <><div><small>Attendance today</small><strong>{summary.attendanceToday?.status ?? "Not started"}</strong></div><div><small>Pending leave</small><strong>{summary.pendingLeave ?? 0}</strong></div><div><small>Latest payslip</small><strong>{summary.payslip ? summary.payslip.netPay.toLocaleString() : "-"}</strong></div></> : <><div><small>Active headcount</small><strong>{summary.headcount ?? 0}</strong></div><div><small>Present / late</small><strong>{summary.attendance?.present ?? 0} / {summary.attendance?.late ?? 0}</strong></div><div><small>Pending approvals</small><strong>{(summary.approvals?.leave ?? 0) + (summary.approvals?.corrections ?? 0)}</strong></div><div><small>Payroll net</small><strong>{summary.payroll ? summary.payroll.net.toLocaleString() : "-"}</strong></div></>}</div>}</section>}</div>;
}
