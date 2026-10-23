"use client";

import { useState } from "react";

export function PasswordField({ label, value, onChange, placeholder, required = true, minLength = 8 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; minLength?: number }) {
  const [visible, setVisible] = useState(false);
  return <label className="password-field"><span>{label}</span><input data-password-enhanced="true" required={required} minLength={minLength} type={visible ? "text" : "password"} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /><button type="button" className="password-toggle" onClick={() => setVisible(current => !current)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? "Hide" : "Show"}</button></label>;
}
