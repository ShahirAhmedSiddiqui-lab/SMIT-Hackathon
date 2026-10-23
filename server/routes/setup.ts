import { Router } from "express";
import { Organization } from "../models/organization";
import { User } from "../models/user";
import { hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { asRecord, ConflictError, emailString, passwordString, requiredString, safeUser } from "../utils/validation";

export const setupRouter = Router();
const workspaceSlug = (companyName: string): string => `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "workspace"}-${Math.random().toString(36).slice(2, 8)}`;
setupRouter.get("/status", async (_request, response, next) => {
  try {
    const organization = await Organization.exists({});
    response.json({ data: { setupRequired: !organization, workspaceExists: Boolean(organization) } });
  } catch (error) { next(error); }
});

setupRouter.post("/", async (request, response, next) => {
  let createdOrganizationId: string | undefined;
  try {
    const body = asRecord(request.body);
    const companyName = requiredString(body, "companyName");
    const adminName = requiredString(body, "adminName");
    const adminEmail = emailString(body, "adminEmail");
    const adminPassword = passwordString(body, "adminPassword");

    const existingEmail = await User.exists({ email: adminEmail });
    if (existingEmail) throw new ConflictError("A user with this email already exists. Try signing in.");
    const slug = workspaceSlug(companyName);
    const organization = await Organization.create({ companyName, singletonKey: slug, workspaceSlug: slug });
    createdOrganizationId = String(organization._id);

    const admin = await User.create({ organizationId: organization._id, name: adminName, email: adminEmail, passwordHash: await hashPassword(adminPassword), role: "admin" });
    response.status(201).json({ data: { token: signToken({ sub: String(admin._id), ver: admin.tokenVersion }), organization: { id: organization._id, companyName: organization.companyName }, user: safeUser(admin.toObject()) } });
  } catch (error: unknown) {
    if (createdOrganizationId) await Organization.findByIdAndDelete(createdOrganizationId).catch(() => undefined);
    if (error instanceof Error && "code" in error && error.code === 11000) return next(new ConflictError("A user with this email already exists. Try signing in."));
    return next(error);
  }
});
