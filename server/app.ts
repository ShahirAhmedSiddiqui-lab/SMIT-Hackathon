import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { organizationRouter } from "./routes/organization";
import { setupRouter } from "./routes/setup";
import { usersRouter } from "./routes/users";
import { employeesRouter } from "./routes/employees";
import { attendanceRouter } from "./routes/attendance";
import { leaveRouter } from "./routes/leave";
import { aiRouter } from "./routes/ai";
import { notificationsRouter } from "./routes/notifications";
import { auditRouter } from "./routes/audit";
import { payrollRouter } from "./routes/payroll";
import { analyticsRouter } from "./routes/analytics";
import { announcementsRouter } from "./routes/announcements";
import { requireAuth } from "./middleware/auth";
import { ForbiddenError } from "./utils/validation";

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: (origin, callback) => {
    if (!origin || env.clientOrigins.includes(origin) || (env.nodeEnv !== "production" && /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):3000$/.test(origin))) return callback(null, true);
    return callback(new Error("Origin is not allowed"));
  } }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/setup", setupRouter);
  app.use("/api/auth", authRouter);
  app.use("/api", requireAuth, (request, _response, next) => {
    if (request.auth?.mustChangePassword) return next(new ForbiddenError("Change your temporary password before continuing"));
    next();
  });
  app.use("/api/organization", organizationRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/employees", employeesRouter);
  app.use("/api/attendance", attendanceRouter);
  app.use("/api/leave", leaveRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/audit", auditRouter);
  app.use("/api/payroll", payrollRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/announcements", announcementsRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    void next;
    const typedError = error as { statusCode?: number; code?: string | number; name?: string; message?: string; fields?: Record<string, string> };
    const isCastError = typedError.name === "CastError";
    const isDuplicateError = typedError.code === 11000;
    const status = typedError.statusCode ?? (isCastError ? 400 : isDuplicateError ? 409 : 500);
    const code = isCastError ? "INVALID_ID" : isDuplicateError ? "CONFLICT" : typeof typedError.code === "string" ? typedError.code : "INTERNAL_ERROR";
    const message = isCastError ? "A supplied identifier is invalid" : isDuplicateError ? "This record already exists" : status >= 500 ? "Something went wrong on the server" : typedError.message ?? "Request failed";
    response.status(status).json({ error: { code, message, ...(typedError.fields ? { fields: typedError.fields } : {}) } });
  });

  return app;
};
