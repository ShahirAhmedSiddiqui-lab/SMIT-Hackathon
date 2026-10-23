import assert from "node:assert/strict";
import test from "node:test";
import { aiProviderFailure } from "../utils/ai-provider";

test("AI provider quota errors explain how to restore service", () => {
  assert.deepEqual(aiProviderFailure(429, "RESOURCE_EXHAUSTED"), {
    status: 429,
    code: "AI_QUOTA_EXCEEDED",
    message: "The AI provider quota is exhausted. Try again later or configure a Gemini API key with available quota.",
  });
});

test("AI provider key errors do not reveal provider details", () => {
  assert.deepEqual(aiProviderFailure(403, "PERMISSION_DENIED"), {
    status: 503,
    code: "AI_PROVIDER_AUTH_ERROR",
    message: "The AI provider rejected its configured API key. Check the server configuration.",
  });
});

test("unknown AI provider errors use a safe generic message", () => {
  assert.deepEqual(aiProviderFailure(500), {
    status: 502,
    code: "AI_PROVIDER_ERROR",
    message: "The AI provider could not answer right now.",
  });
});
