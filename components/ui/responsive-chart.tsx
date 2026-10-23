"use client";

import type { ReactNode } from "react";

export function ResponsiveChart({ children, label }: { children: ReactNode; label: string }) {
  return <div className="chart-shell" role="img" aria-label={label}>{children}</div>;
}
