"use client";

import { FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (typeof window === "undefined" ? "http://localhost:5000" : `http://${window.location.hostname}:5000`);

type Message = { id: number; role: "user" | "assistant"; text: string };

export function AiChat({ token }: { token: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = async (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setBusy(true); setError(""); setQuestion("");
    setMessages(current => [...current, { id: Date.now(), role: "user", text }]);
    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ question: text }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message ?? "AI assistant is unavailable");
      setMessages(current => [...current, { id: Date.now() + 1, role: "assistant", text: payload.data.answer }]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "AI assistant is unavailable"); }
    finally { setBusy(false); }
  };
  return <section className="panel ai-page-chat"><div className="panel-title"><div><span className="panel-kicker">NEXORA AI</span><h2>People operations assistant</h2></div><button type="button" className="button button-quiet" onClick={() => { setMessages([]); setError(""); }}>Clear chat</button></div><p className="muted">Ask about your signed-in workspace. Answers are grounded in authorized Nexora data.</p><div className="ai-chat-history" aria-live="polite">{messages.length === 0 && <p className="empty-copy">Start with a question about attendance, leave, payroll, or workplace policy.</p>}{messages.map(message => <article key={message.id} className={`ai-chat-message ${message.role}`}><strong>{message.role === "user" ? "You" : "Nexora AI"}</strong><p>{message.text}</p></article>)}</div>{error && <div className="form-error" role="alert">{error}<button type="button" className="button button-quiet" onClick={() => setError("")}>Dismiss</button></div>}<form className="form-stack compact" onSubmit={ask}><label htmlFor="ai-page-question">Your question<textarea id="ai-page-question" required maxLength={1000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="What should I focus on today?" /></label><button className="button button-dark" disabled={busy}>{busy ? "Thinking..." : "Ask assistant"}</button></form></section>;
}
