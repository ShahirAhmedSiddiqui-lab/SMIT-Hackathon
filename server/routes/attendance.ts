import { Router } from "express";
import { Attendance } from "../models/attendance";
import { Employee } from "../models/employee";
import { Organization } from "../models/organization";
import { User } from "../models/user";
import { requireAuth, requireRole } from "../middleware/auth";
import { ConflictError, NotFoundError, ValidationError } from "../utils/validation";

export const attendanceRouter = Router();
attendanceRouter.use(requireAuth);

const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const timeToMinutes = (value: string) => { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; };
const currentMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();
const attendancePayload = (record: Record<string, unknown> | null) => record ? ({ id: String(record._id), attendanceDate: record.attendanceDate, checkIn: record.checkIn, checkOut: record.checkOut, durationMinutes: record.durationMinutes, status: record.status, officeStart: record.officeStart, graceMinutes: record.graceMinutes }) : null;

const ownContext = async (userId: string) => {
  const user = await User.findById(userId).select("employeeId organizationId").lean();
  if (!user?.employeeId) throw new ValidationError("Your account is not linked to an employee profile");
  const [employee, organization] = await Promise.all([Employee.findOne({ _id: user.employeeId, organizationId: user.organizationId, status: "active" }).lean(), Organization.findById(user.organizationId).lean()]);
  if (!employee || !organization) throw new NotFoundError("Employee profile not found");
  return { user, employee, organization };
};

attendanceRouter.get("/today", requireRole("employee"), async (request, response, next) => {
  try { const { employee } = await ownContext(request.auth!.userId); const record = await Attendance.findOne({ employeeId: employee._id, attendanceDate: dateKey(new Date()) }).lean(); return response.json({ data: { attendance: attendancePayload(record) } }); } catch (error) { return next(error); }
});

attendanceRouter.post("/check-in", requireRole("employee"), async (request, response, next) => {
  try {
    const { user, employee, organization } = await ownContext(request.auth!.userId); const now = new Date(); const attendanceDate = dateKey(now);
    if (await Attendance.exists({ employeeId: employee._id, attendanceDate })) throw new ConflictError("You have already checked in today");
    const officeStart = organization.officeStart; const graceMinutes = organization.graceMinutes; const status = currentMinutes(now) > timeToMinutes(officeStart) + graceMinutes ? "late" : "present";
    const record = await Attendance.create({ organizationId: user.organizationId, employeeId: employee._id, userId: user._id, attendanceDate, checkIn: now, status, officeStart, graceMinutes });
    return response.status(201).json({ data: { attendance: attendancePayload(record.toObject()) } });
  } catch (error: unknown) { if (error instanceof Error && "code" in error && error.code === 11000) return next(new ConflictError("You have already checked in today")); return next(error); }
});

attendanceRouter.post("/check-out", requireRole("employee"), async (request, response, next) => {
  try {
    const { employee } = await ownContext(request.auth!.userId); const record = await Attendance.findOne({ employeeId: employee._id, attendanceDate: dateKey(new Date()) });
    if (!record) throw new NotFoundError("Check in before checking out");
    if (record.checkOut) throw new ConflictError("You have already checked out today");
    const now = new Date(); const durationMinutes = Math.max(0, Math.round((now.getTime() - record.checkIn.getTime()) / 60000)); record.checkOut = now; record.durationMinutes = durationMinutes; if (durationMinutes < 300) record.status = "half_day"; await record.save();
    return response.json({ data: { attendance: attendancePayload(record.toObject()) } });
  } catch (error) { return next(error); }
});

attendanceRouter.get("/board", requireRole("admin", "hr"), async (request, response, next) => {
  try {
    const attendanceDate = typeof request.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(request.query.date) ? request.query.date : dateKey(new Date());
    const status = typeof request.query.status === "string" && ["present", "late", "half_day", "missing_checkout"].includes(request.query.status) ? request.query.status : "";
    const search = typeof request.query.search === "string" ? request.query.search.trim().slice(0, 80) : "";
    const employeeQuery: Record<string, unknown> = { organizationId: request.auth!.organizationId };
    if (search) employeeQuery.$or = [{ name: { $regex: search, $options: "i" } }, { employeeCode: { $regex: search, $options: "i" } }, { department: { $regex: search, $options: "i" } }];
    const matchingEmployees = search ? await Employee.find(employeeQuery).select("_id").limit(100).lean() : [];
    const query: Record<string, unknown> = { organizationId: request.auth!.organizationId, attendanceDate };
    if (status) query.status = status;
    if (search) query.employeeId = { $in: matchingEmployees.map(employee => employee._id) };
    const records = await Attendance.find(query).sort({ checkIn: 1 }).populate("employeeId", "name employeeCode department designation").lean();
    return response.json({ data: { attendanceDate, records: records.map(record => { const employee = record.employeeId as unknown as Record<string, unknown>; return { id: String(record._id), employee: employee ? { id: String(employee._id), name: employee.name, employeeCode: employee.employeeCode, department: employee.department, designation: employee.designation } : null, checkIn: record.checkIn, checkOut: record.checkOut, durationMinutes: record.durationMinutes, status: record.status }; }) } });
  } catch (error) { return next(error); }
});
