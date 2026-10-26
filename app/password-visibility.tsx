"use client";

import { useEffect } from "react";

function enhancePasswords() {
  document.querySelectorAll<HTMLInputElement>('input[type="password"]:not([data-password-enhanced])').forEach(input => {
    const wrapper = document.createElement("span");
    wrapper.className = "password-enhancer";
    input.parentNode?.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "password-enhancer-button";
    button.textContent = "Show";
    button.setAttribute("aria-label", "Show password");
    button.addEventListener("click", () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Show" : "Hide";
      button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
    wrapper.appendChild(button);
    input.dataset.passwordEnhanced = "true";
  });
}

export function PasswordVisibility() {
  useEffect(() => {
    enhancePasswords();
    const observer = new MutationObserver(enhancePasswords);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
