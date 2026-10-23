"use client";

import { useEffect } from "react";

export function ProfileCardLink() {
  useEffect(() => {
    let photoUrl = "";
    const applyPhoto = () => { if (!photoUrl) return; document.querySelectorAll<HTMLElement>(".sidebar .avatar, .topbar .avatar").forEach(target => { if (target.querySelector("img")) return; const image = document.createElement("img"); image.className = "profile-avatar-image"; image.src = photoUrl; image.alt = "Profile"; target.replaceChildren(image); }); };
    const setAvatarLoading = (loading: boolean) => document.querySelectorAll<HTMLElement>(".sidebar .avatar, .topbar .avatar").forEach(target => target.classList.toggle("profile-avatar-loading", loading));
    const loadPhoto = async () => {
      const token = sessionStorage.getItem("hcm_token");
      if (!token) { setAvatarLoading(false); return; }
      setAvatarLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? `http://${window.location.hostname}:5000`}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const photo = payload?.data?.user?.profilePhoto;
        if (!photo?.mimeType || !photo?.data) return;
        photoUrl = `data:${photo.mimeType};base64,${photo.data}`;
        applyPhoto();
      } catch { /* The initials fallback remains visible when the profile request is unavailable. */ }
      finally { setAvatarLoading(false); }
    };
    const open = () => window.dispatchEvent(new Event("nexora-profile"));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".sidebar .role-chip, .topbar .avatar") : null;
      if (!target) return;
      event.preventDefault();
      open();
    };
    const onClick = (event: MouseEvent) => { const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".sidebar .role-chip, .topbar .avatar") : null; if (target) open(); };
    const enhance = () => { document.querySelectorAll<HTMLElement>(".sidebar .role-chip, .topbar .avatar").forEach(target => { target.setAttribute("role", "button"); target.setAttribute("tabindex", "0"); target.setAttribute("aria-label", "Open profile"); if (sessionStorage.getItem("hcm_token") && !photoUrl) target.classList.add("profile-avatar-loading"); }); applyPhoto(); };
    const observer = new MutationObserver(enhance);
    enhance();
    void loadPhoto();
    window.addEventListener("nexora-auth", loadPhoto);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    const restoreRetry = window.setTimeout(() => { void loadPhoto(); }, 500);
    return () => { window.clearTimeout(restoreRetry); observer.disconnect(); window.removeEventListener("nexora-auth", loadPhoto); document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKeyDown); };
  }, []);
  return null;
}
