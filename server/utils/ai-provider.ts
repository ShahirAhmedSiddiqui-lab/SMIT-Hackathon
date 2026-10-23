export type AiProviderFailure = { status: number; code: string; message: string };

export const aiProviderFailure = (status: number, providerStatus?: string): AiProviderFailure => {
  if (status === 429 || providerStatus === "RESOURCE_EXHAUSTED") {
    return { status: 429, code: "AI_QUOTA_EXCEEDED", message: "The AI provider quota is exhausted. Try again later or configure a Gemini API key with available quota." };
  }
  if (status === 401 || status === 403) {
    return { status: 503, code: "AI_PROVIDER_AUTH_ERROR", message: "The AI provider rejected its configured API key. Check the server configuration." };
  }
  if (status === 404) {
    return { status: 503, code: "AI_MODEL_UNAVAILABLE", message: "The configured AI model is unavailable. Check GEMINI_MODEL on the server." };
  }
  return { status: 502, code: "AI_PROVIDER_ERROR", message: "The AI provider could not answer right now." };
};
