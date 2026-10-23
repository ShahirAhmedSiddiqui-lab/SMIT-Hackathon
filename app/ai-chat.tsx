"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/empty-state";

type Message = { id: string; role: "user" | "assistant"; text: string };

function historyKey(token: string) {
  try {
    const payload = token.split(".")[1];
    const subject = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).sub;
    return "nexora_ai_history_" + (typeof subject === "string" ? subject : "session");
  } catch {
    return "nexora_ai_history_session";
  }
}

export function AiChat({ token }: { token: string }) {
  const [question, setQuestion] = useState(""); const [messages, setMessages] = useState<Message[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [lastQuestion, setLastQuestion] = useState(""); const [historyReady, setHistoryReady] = useState(false); const requestRef = useRef<AbortController | null>(null); const historyRef = useRef<HTMLDivElement>(null); const loadedHistoryKey = useRef(""); const storageKey = historyKey(token);
  useEffect(() => { void Promise.resolve().then(() => { try { const saved = localStorage.getItem(storageKey); const parsed = saved ? JSON.parse(saved) : []; setMessages(Array.isArray(parsed) ? parsed.filter((message): message is Message => Boolean(message && (message.role === "user" || message.role === "assistant") && typeof message.text === "string")) : []); } catch { setMessages([]); } loadedHistoryKey.current = storageKey; setHistoryReady(true); }); }, [storageKey]);
  useEffect(() => { if (historyReady && loadedHistoryKey.current === storageKey) localStorage.setItem(storageKey, JSON.stringify(messages.slice(-50))); }, [historyReady, messages, storageKey]);
  useEffect(() => { const history = historyRef.current; if (!history) return; requestAnimationFrame(() => { history.scrollTo({ top: history.scrollHeight, behavior: busy ? "smooth" : "auto" }); }); }, [messages, busy]);
  const submitQuestion = async () => { const text = question.trim(); if (!text || text.length > 1000 || busy || !token) return; requestRef.current?.abort(); const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 20_000); requestRef.current = controller; setBusy(true); setError(""); setQuestion(""); setLastQuestion(text); setMessages(current => [...current, { id: `${Date.now()}-user`, role: "user", text }]); try { const data = await apiRequest<{ answer: string }>("/api/ai/chat", { method: "POST", body: JSON.stringify({ question: text }), signal: controller.signal }, token); setMessages(current => [...current, { id: `${Date.now()}-assistant`, role: "assistant", text: data.answer }]); } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "AI assistant is unavailable"); else setError("The AI request took too long. Please retry."); } finally { window.clearTimeout(timeout); setBusy(false); } };
  const ask = (event: FormEvent) => { event.preventDefault(); void submitQuestion(); };
  const handleQuestionKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitQuestion(); } };
  // The handler intentionally reads the current composer state when the textarea is active.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const textarea = document.getElementById("ai-page-question"); if (!(textarea instanceof HTMLTextAreaElement)) return; const handleKeyDown = (event: Event) => handleQuestionKeyDown(event as unknown as KeyboardEvent<HTMLTextAreaElement>); textarea.addEventListener("keydown", handleKeyDown); return () => textarea.removeEventListener("keydown", handleKeyDown); }, [busy, question, token]);
  const retry = () => { if (!lastQuestion || busy) return; setQuestion(lastQuestion); setError(""); };
  return <section className="panel ai-page-chat"><div className="panel-title"><div><span className="panel-kicker">NEXORA AI</span><h2>People operations assistant</h2></div><button type="button" className="button button-quiet" onClick={() => { requestRef.current?.abort(); setMessages([]); setError(""); setLastQuestion(""); }}>Clear chat</button></div><p className="muted">Ask about your signed-in workspace. Answers are grounded in authorized Nexora data.</p><div ref={historyRef} className="ai-chat-history" aria-live="polite" aria-busy={busy}>{messages.length === 0 && <EmptyState title="Start with a focused question" description="Ask about attendance, leave, payroll, or workplace policy." />}{messages.map(message => <article key={message.id} className={`ai-chat-message ${message.role}`}><strong>{message.role === "user" ? "You" : "Nexora AI"}</strong><div className="ai-message-body">{message.text.split(/\n+/).map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}</div></article>)}{busy && <article className="ai-chat-message assistant"><strong>Nexora AI</strong><p className="ai-thinking">Reviewing your workspace context…</p></article>}</div>{error && <div className="form-error" role="alert">{error}<button type="button" className="button button-quiet" onClick={retry}>Retry</button></div>}<form className="form-stack compact" onSubmit={ask}><label htmlFor="ai-page-question">Your question<textarea id="ai-page-question" required maxLength={1000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="What should I focus on today?" /></label><button className="button button-dark" disabled={busy}>{busy ? "Thinking…" : "Ask assistant"}</button></form></section>;
}
