import type { Metadata } from "next";
import "./globals.css";
import { AiWidget } from "./ai-widget";
import { PasswordVisibility } from "./password-visibility";
import { ProfileCardLink } from "./profile-card-link";

export const metadata: Metadata = {
  title: "Nexora | People operations, clearly",
  description: "Nexora is a focused human capital workspace for Admin, HR and Employees.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><PasswordVisibility /><ProfileCardLink />{children}<AiWidget /></body>
    </html>
  );
}
