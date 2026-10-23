import type { UserRole } from "../models/user";
import mongoose from "mongoose";

export class ValidationError extends Error { statusCode = 422; code = "VALIDATION_ERROR"; fields?: Record<string, string>; constructor(message: string, fields?: Record<string, string>) { super(message); this.fields = fields; } }
export class ConflictError extends Error { statusCode = 409; code = "CONFLICT"; }
export class ForbiddenError extends Error { statusCode = 403; code = "FORBIDDEN"; }
export class NotFoundError extends Error { statusCode = 404; code = "NOT_FOUND"; }
export const asRecord = (body: unknown): Record<string, unknown> => typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
export const requiredString = (body: Record<string, unknown>, key: string, max = 120): string => { const value = typeof body[key] === "string" ? body[key].trim() : ""; if (!value || value.length > max) throw new ValidationError(`${key} is required and must be at most ${max} characters`); return value; };
export const emailString = (body: Record<string, unknown>, key = "email"): string => { const email = requiredString(body, key, 254).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("Enter a valid email address", { [key]: "Invalid email" }); return email; };
export const passwordString = (body: Record<string, unknown>, key = "password"): string => { const password = typeof body[key] === "string" ? body[key] : ""; if (password.length < 8 || password.length > 128) throw new ValidationError("Password must be between 8 and 128 characters", { [key]: "Invalid password" }); return password; };
export const roleMatches = (requested: unknown, actual: UserRole): boolean => requested === undefined || requested === actual;
export const objectIdString = (value: unknown, field = "id"): string => { if (typeof value !== "string" || !mongoose.isValidObjectId(value)) throw new ValidationError(field + " must be a valid identifier"); return value; };
export const safeUser = (user: Record<string, unknown>) => ({ id: String(user._id), name: user.name, email: user.email, role: user.role as UserRole, active: user.active !== false, mustChangePassword: Boolean(user.mustChangePassword), hasStaffProfile: Boolean(user.employeeId) });
