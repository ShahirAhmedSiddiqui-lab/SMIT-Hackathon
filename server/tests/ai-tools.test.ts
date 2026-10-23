import assert from "node:assert/strict";
import test from "node:test";
import { attendanceDateFilter, canUseTool, toolDeclarations, toolNames } from "../utils/ai-tools";

test("AI exposes the seven required tool names", () => {
  assert.deepEqual(toolDeclarations.map(tool => tool.name), [...toolNames]);
});

test("attendance tool accepts exact-date and monthly queries", () => {
  const attendanceTool = toolDeclarations.find(tool => tool.name === "get_attendance_summary");
  assert.ok(attendanceTool);
  assert.equal("date" in attendanceTool.parameters.properties, true);
  assert.equal(attendanceDateFilter("2026-11-07", "2026-11"), "2026-11-07");
  assert.deepEqual(attendanceDateFilter("", "2026-11"), { $gte: "2026-11-01", $lte: "2026-11-31" });
});

test("employees can use only scoped people tools", () => {
  assert.equal(canUseTool("employee", "get_my_leave_balance"), true);
  assert.equal(canUseTool("employee", "get_headcount"), false);
  assert.equal(canUseTool("employee", "get_late_comers"), false);
  assert.equal(canUseTool("employee", "unknown_tool"), false);
});

test("admin and HR can use organization tools", () => {
  assert.equal(canUseTool("admin", "get_headcount"), true);
  assert.equal(canUseTool("hr", "get_late_comers"), true);
  assert.equal(canUseTool("hr", "get_payroll_summary"), true);
});
