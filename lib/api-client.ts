export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (typeof window === "undefined" ? "http://localhost:5000" : `http://${window.location.hostname}:5000`);

export type ApiEnvelope<T> = { data: T } | { error: { code?: string; message: string } };

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const GET_CACHE_TTL = 15_000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

export function clearApiCache() {
  responseCache.clear();
  inFlight.clear();
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const method = (options.method ?? "GET").toUpperCase();
  const cacheKey = `${token ?? "public"}:${path}`;
  // A caller-owned AbortSignal must never be shared with another consumer.
  // This prevents a cancelled section request from cancelling a newer request.
  const cacheable = method === "GET" && options.cache !== "no-store" && !options.signal;
  if (cacheable) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;
    const pending = inFlight.get(cacheKey);
    if (pending) return pending as Promise<T>;
  }
  const request = (async () => {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
    if (!response.ok || !("data" in payload)) {
      const error = "error" in payload ? payload.error : undefined;
      throw new ApiError(error?.message ?? "The request could not be completed.", response.status, error?.code);
    }
    if (cacheable) responseCache.set(cacheKey, { expiresAt: Date.now() + GET_CACHE_TTL, value: payload.data });
    return payload.data;
  })();
  if (cacheable) {
    inFlight.set(cacheKey, request);
    void request.then(() => inFlight.delete(cacheKey), () => inFlight.delete(cacheKey));
  } else if (method !== "GET") {
    responseCache.clear();
  }
  return request;
}
