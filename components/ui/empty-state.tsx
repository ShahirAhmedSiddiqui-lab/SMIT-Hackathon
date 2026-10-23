import type { ReactNode } from "react";

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="nexora-empty-state"><span className="empty-signal" aria-hidden="true"><svg viewBox="0 0 48 48" role="presentation"><path d="M24 6 39 15v18L24 42 9 33V15L24 6Z" /><path d="m16 19 8-5 8 5v10l-8 5-8-5V19Z" /></svg></span><strong>{title}</strong><p>{description}</p>{children}</div>;
}
