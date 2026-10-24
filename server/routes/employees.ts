import { Router } from "express";
import { Employee } from "../models/employee";
import { User } from "../models/user";
import { requireAuth, requireRole } from "../middleware/auth";
import { hashPassword } from "../utils/password";
import { asRecord, ConflictError, emailString, passwordString, requiredString, ValidationError } from "../utils/validation";

export const employeesRouter = Router();
employeesRouter.use(requireAuth);

const employeePayload = (employee: Record<string, unknown>) => ({
  id: String(employee._id), employeeCode: employee.employeeCode, name: employee.name, email: employee.email,
  phone: employee.phone, address: employee.address, department: employee.department, designation: employee.designation,
  employmentType: employee.employmentType, joinDate: employee.joinDate, basicSalary: employee.basicSalary, status: employee.status,
});

employeesRouter.post("/", requireRole("admin", "hr"), async (request, response, next) => {
  let userId: string | undefined;
  try {
    const body = asRecord(request.body);
    const organizationId = request.auth?.organizationId;
    const employeeCode = requiredString(body, "employeeCode", 40).toUpperCase();
    const name = requiredString(body, "name");
    const email = emailString(body);
    const temporaryPassword = passwordString(body, "temporaryPassword");
    const designation = requiredString(body, "designation", 100);
    const joinDate = requiredString(body, "joinDate", 10);
    const basicSalary = Number(body.basicSalary);
    if (!organizationId || !/^\d{4}-\d{2}-\d{2}$/.test(joinDate) || Number.isNaN(new Date(`${joinDate}T00:00:00.000Z`).getTime())) throw new ValidationError("Enter a valid join date", { joinDate: "Use YYYY-MM-DD" });
    if (!Number.isFinite(basicSalary) || basicSalary <= 0 || basicSalary > 1_000_000_000) throw new ValidationError("Basic salary must be greater than zero", { basicSalary: "Invalid salary" });
    if (await User.exists({ email })) throw new ConflictError("A user with this email already exists");
    if (await Employee.exists({ organizationId, employeeCode })) throw new ConflictError("An employee with this code already exists");
    const user = await User.create({ organizationId, name, email, passwordHash: await hashPassword(temporaryPassword), role: "employee", mustChangePassword: true });
    userId = String(user._id);
    const employee = await Employee.create({ organizationId, userId: user._id, employeeCode, name, email, phone: typeof body.phone === "string" ? body.phone.trim() : "", address: typeof body.address === "string" ? body.address.trim() : "", department: typeof body.department === "string" ? body.department.trim() : "", designation, employmentType: body.employmentType ?? "full_time", joinDate: new Date(`${joinDate}T00:00:00.000Z`), basicSalary });
    user.employeeId = employee._id;
    await user.save();
    return response.status(201).json({ data: { employee: employeePayload(employee.toObject()) } });
  } catch (error: unknown) {
    if (userId) await User.findByIdAndDelete(userId).catch(() => undefined);
    if (error instanceof Error && "code" in error && error.code === 11000) return next(new ConflictError("Employee code or email already exists"));
    return next(error);
  }
});

employeesRouter.get("/", async (request, response, next) => {
  try {
    const organizationId = request.auth?.organizationId;
    const role = request.auth?.role;
    const ownEmployeeId = request.auth?.userId;
    const page = Math.max(1, Math.min(1000, Number(request.query.page) || 1));
    const limit = Math.max(1, Math.min(50, Number(request.query.limit) || 20));
    const search = typeof request.query.search === "string" ? request.query.search.trim().slice(0, 80) : "";
    const query: Record<string, unknown> = { organizationId };
    if (role === "employee") {
      const user = await User.findById(ownEmployeeId).select("employeeId").lean();
      if (!user?.employeeId) return response.json({ data: { employees: [], page, limit, total: 0 } });
      query._id = user.employeeId;
    } else if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { employeeCode: { $regex: search, $options: "i" } }, { department: { $regex: search, $options: "i" } }];
    const [employees, total] = await Promise.all([Employee.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(), Employee.countDocuments(query)]);
    return response.json({ data: { employees: employees.map(employeePayload), page, limit, total } });
  } catch (error) { return next(error); }
});

employeesRouter.get("/:id", async (request, response, next) => {
  try {
    const employee = await Employee.findOne({ _id: request.params.id, organizationId: request.auth?.organizationId }).lean();
    if (!employee) return response.status(404).json({ error: { code: "NOT_FOUND", message: "Employee not found" } });
    if (request.auth?.role === "employee" && String(employee.userId) !== request.auth.userId) return response.status(403).json({ error: { code: "FORBIDDEN", message: "You can only view your own employee profile" } });
    return response.json({ data: { employee: employeePayload(employee) } });
  } catch (error) { return next(error); }
});
