import { Router } from "express";
import { Employee } from "../models/employee";
import { LeaveRequest, LeaveType } from "../models/leave-request";
import { User } from "../models/user";
import { requireAuth, requireRole } from "../middleware/auth";
import { ConflictError, NotFoundError, asRecord, requiredString, ValidationError } from "../utils/validation";

export const leaveRouter = Router();
leaveRouter.use(requireAuth);

const limits: Record<LeaveType, number | null> = { annual: 14, sick: 8, casual: 10, unpaid: null };
const leaveTypes: LeaveType[] = ["annual", "sick", "casual", "unpaid"];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const utcDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const workingDays = (start: string, end: string) => { let count = 0; for (let cursor = utcDate(start); cursor <= utcDate(end); cursor = new Date(cursor.getTime() + 86400000)) { const weekday = cursor.getUTCDay(); if (weekday !== 0 && weekday !== 6) count += 1; } return count; };
const overlaps = (start: string, end: string, otherStart: string, otherEnd: string) => start <= otherEnd && end >= otherStart;
const payload = (request: Record<string, unknown>) => ({ id: String(request._id), leaveType: request.leaveType, startDate: request.startDate, endDate: request.endDate, days: request.days, reason: request.reason, status: request.status, decisionComment: request.decisionComment, createdAt: request.createdAt });

const employeeContext = async (userId: string) => {
  const user = await User.findById(userId).select("employeeId organizationId").lean();
  if (!user?.employeeId) throw new ValidationError("Your account is not linked to an employee profile");
  const employee = await Employee.findOne({ _id: user.employeeId, organizationId: user.organizationId, status: "active" }).lean();
  if (!employee) throw new NotFoundError("Employee profile not found");
  return { user, employee };
};

const approvedDays = async (organizationId: string, employeeId: unknown, leaveType: LeaveType, excludeId?: string) => {
  const query: Record<string, unknown> = { organizationId, employeeId, leaveType, status: "approved" }; if (excludeId) query._id = { $ne: excludeId };
  const records = await LeaveRequest.find(query).select("days").lean(); return records.reduce((total, record) => total + record.days, 0);
};

leaveRouter.get("/summary", requireRole("employee"), async (request, response, next) => {
  try {
    const { user, employee } = await employeeContext(request.auth!.userId); const requests = await LeaveRequest.find({ organizationId: user.organizationId, employeeId: employee._id }).sort({ createdAt: -1 }).limit(50).lean();
    const balances = await Promise.all(leaveTypes.map(async leaveType => { const limit = limits[leaveType]; const used = await approvedDays(String(user.organizationId), employee._id, leaveType); return { leaveType, limit, used, remaining: limit === null ? null : Math.max(0, limit - used) }; }));
    return response.json({ data: { balances, requests: requests.map(payload) } });
  } catch (error) { return next(error); }
});

leaveRouter.post("/", requireRole("employee"), async (request, response, next) => {
  try {
    const { user, employee } = await employeeContext(request.auth!.userId); const body = asRecord(request.body); const leaveType = requiredString(body, "leaveType", 20) as LeaveType; const startDate = requiredString(body, "startDate", 10); const endDate = requiredString(body, "endDate", 10); const reason = requiredString(body, "reason", 500);
    if (!leaveTypes.includes(leaveType) || !datePattern.test(startDate) || !datePattern.test(endDate) || startDate > endDate) throw new ValidationError("Choose a valid leave type and date range");
    const days = workingDays(startDate, endDate); if (!days) throw new ValidationError("Leave must include at least one working day");
    const existing = await LeaveRequest.find({ organizationId: user.organizationId, employeeId: employee._id, status: { $in: ["pending", "approved"] } }).select("startDate endDate").lean(); if (existing.some(record => overlaps(startDate, endDate, record.startDate, record.endDate))) throw new ConflictError("This leave overlaps another pending or approved request");
    const limit = limits[leaveType]; const used = await approvedDays(String(user.organizationId), employee._id, leaveType); if (limit !== null && used + days > limit) throw new ValidationError(`Your ${leaveType} leave balance is not enough`, { leaveType: "Insufficient balance" });
    const created = await LeaveRequest.create({ organizationId: user.organizationId, employeeId: employee._id, userId: user._id, leaveType, startDate, endDate, days, reason }); return response.status(201).json({ data: { request: payload(created.toObject()) } });
  } catch (error) { return next(error); }
});

leaveRouter.post("/:id/cancel", requireRole("employee"), async (request, response, next) => {
  try { const { user, employee } = await employeeContext(request.auth!.userId); const record = await LeaveRequest.findOne({ _id: request.params.id, organizationId: user.organizationId, employeeId: employee._id }); if (!record) throw new NotFoundError("Leave request not found"); if (!["pending", "approved"].includes(record.status)) throw new ConflictError("This leave request cannot be cancelled"); record.status = "cancelled"; await record.save(); return response.json({ data: { request: payload(record.toObject()) } }); } catch (error) { return next(error); }
});

leaveRouter.get("/inbox", requireRole("admin", "hr"), async (request, response, next) => {
  try { const status = typeof request.query.status === "string" && ["pending", "approved", "rejected", "cancelled"].includes(request.query.status) ? request.query.status : "pending"; const records = await LeaveRequest.find({ organizationId: request.auth!.organizationId, status }).populate("employeeId", "name employeeCode department").sort({ createdAt: 1 }).limit(100).lean(); return response.json({ data: { requests: records.map(record => ({ ...payload(record), employee: record.employeeId })) } }); } catch (error) { return next(error); }
});

leaveRouter.patch("/:id/decision", requireRole("hr"), async (request, response, next) => {
  try { const body = asRecord(request.body); const decision = requiredString(body, "decision", 10); const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 500) : ""; if (!["approved", "rejected"].includes(decision)) throw new ValidationError("Decision must be approved or rejected"); const record = await LeaveRequest.findOne({ _id: request.params.id, organizationId: request.auth!.organizationId, status: "pending" }); if (!record) throw new NotFoundError("Pending leave request not found"); if (decision === "approved") { const limit = limits[record.leaveType as LeaveType]; const used = await approvedDays(request.auth!.organizationId, record.employeeId, record.leaveType as LeaveType, String(record._id)); if (limit !== null && used + record.days > limit) throw new ConflictError("This approval would exceed the employee leave balance"); } record.status = decision as "approved" | "rejected"; record.decisionComment = comment; record.decidedBy = request.auth!.userId as never; record.decidedAt = new Date(); await record.save(); return response.json({ data: { request: payload(record.toObject()) } }); } catch (error) { return next(error); }
});
