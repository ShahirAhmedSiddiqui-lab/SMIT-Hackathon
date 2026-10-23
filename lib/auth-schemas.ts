import { z } from "zod";

export const adminSignupSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  adminName: z.string().trim().min(2, "Admin name is required."),
  adminEmail: z.string().trim().email("Enter a valid email address."),
  adminPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Temporary password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export type AdminSignupValues = z.infer<typeof adminSignupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
