"use client";

import { useEffect } from "react";

const icons: Record<string, string> = {
  "\u2302": "<path d='M3 10.5 12 3l9 7.5'/><path d='M5.5 9.5V21h13V9.5'/><path d='M9.5 21v-6h5v6'/>",
  "\u25c8": "<path d='m12 3 8 9-8 9-8-9 8-9Z'/><path d='m12 8 3.5 4-3.5 4-3.5-4L12 8Z'/>",
  "\u2659": "<circle cx='12' cy='7' r='3'/><path d='M6 21c.5-4 2.5-6 6-6s5.5 2 6 6'/>",
  "\u25f7": "<circle cx='12' cy='12' r='8.5'/><path d='M12 7v5l3 2'/>",
  "\u25eb": "<rect x='5' y='4' width='14' height='16' rx='2'/><path d='M9 8h6M9 12h6M9 16h4'/>",
  "\u25a4": "<path d='M5 4h14v16H5z'/><path d='M8 8h8M8 12h8M8 16h5'/>",
  "\u25cc": "<circle cx='12' cy='12' r='8.5'/><path d='M12 8v4l2.5 2.5'/>",
  "\u2726": "<path d='m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z'/>",
  "\u2261": "<path d='M5 7h14M5 12h14M5 17h14'/>",
  "\u2699": "<circle cx='12' cy='12' r='3'/><path d='M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1'/>",
};

export function IconEnhancer() {
  useEffect(() => {
    const enhance = () => {
      document.querySelectorAll<HTMLElement>(".nav-icon, .role-option-icon, .ai-launcher span, .leave-launcher span, .correction-launcher span, .holiday-launcher span, .audit-launcher span, .payroll-launcher span, .analytics-launcher span").forEach(node => {
        if (node.dataset.iconEnhanced === "true") return;
        const markup = icons[node.textContent?.trim() ?? ""];
        if (!markup) return;
        node.dataset.iconEnhanced = "true";
        node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${markup}</svg>`;
      });
    };
    const observer = new MutationObserver(enhance);
    enhance();
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
