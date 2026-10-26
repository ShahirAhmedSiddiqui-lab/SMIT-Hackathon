import assert from "node:assert/strict";
import test from "node:test";
import { objectIdString, roleMatches } from "../utils/validation";

test("role selection matches the authenticated account role", () => {
  assert.equal(roleMatches("admin", "admin"), true);
  assert.equal(roleMatches("hr", "admin"), false);
  assert.equal(roleMatches("employee", "employee"), true);
});

test("legacy login requests without a role remain compatible", () => {
  assert.equal(roleMatches(undefined, "hr"), true);
});

test("malformed identifiers are rejected before database access", () => {
  assert.equal(objectIdString("507f1f77bcf86cd799439011"), "507f1f77bcf86cd799439011");
  assert.throws(() => objectIdString("not-an-id"), /valid identifier/);
});
