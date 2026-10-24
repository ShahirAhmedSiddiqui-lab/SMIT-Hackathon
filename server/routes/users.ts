import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { User } from "../models/user";
import { hashPassword } from "../utils/password";
import { asRecord, ConflictError, emailString, passwordString, requiredString, safeUser } from "../utils/validation";

export const usersRouter = Router(); usersRouter.use(requireAuth, requireRole("admin"));
usersRouter.post("/hr", async (request, response, next) => { try { const body = asRecord(request.body); const name = requiredString(body, "name"); const email = emailString(body); const temporaryPassword = passwordString(body, "temporaryPassword"); if (await User.exists({ email })) throw new ConflictError("A user with this email already exists"); const user = await User.create({ organizationId: request.auth?.organizationId, name, email, passwordHash: await hashPassword(temporaryPassword), role: "hr", mustChangePassword: true }); return response.status(201).json({ data: { user: safeUser(user.toObject()) } }); } catch (error) { return next(error); } });
