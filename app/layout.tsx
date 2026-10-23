import type { Metadata } from "next";
import "./globals.css";
import { AiWidget } from "./ai-widget";
import { PasswordVisibility } from "./password-visibility";
import { ProfileCardLink } from "./profile-card-link";
import { QueryProvider } from "@/lib/query-provider";
import { MobileNav } from "./mobile-nav";
import { SessionProvider } from "@/lib/session-context";

export const metadata: Metadata = {
  title: "Nexora | People operations, clearly",
  description: "Nexora is a focused human capital workspace for Admin, HR and Employees.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL;
  return (
    <html lang="en" className="h-full antialiased">
      <head>{apiOrigin && <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />}</head>
      <body className="min-h-full flex flex-col"><QueryProvider><SessionProvider><PasswordVisibility /><ProfileCardLink />{children}<MobileNav /><AiWidget /></SessionProvider></QueryProvider></body>
    </html>
  );
}
