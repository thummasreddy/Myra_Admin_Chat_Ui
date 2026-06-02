import axios from "axios";

export type ApiErrorKind = "network" | "timeout" | "validation" | "auth" | "server" | "rate_limited" | "unknown";

export class MyraApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  details?: unknown;

  constructor(kind: ApiErrorKind, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "MyraApiError";
    this.kind = kind;
    this.status = status;
    this.details = details;
  }
}

export function normalizeApiError(error: unknown): MyraApiError {
  if (error instanceof MyraApiError) return error;
  if (!axios.isAxiosError(error)) return new MyraApiError("unknown", error instanceof Error ? error.message : "Unexpected error");

  if (error.code === "ECONNABORTED") {
    return new MyraApiError("timeout", "The request timed out. Please try again.", undefined, error.message);
  }

  if (!error.response) {
    return new MyraApiError("network", "Network error. Check your connection or backend gateway status.", undefined, error.message);
  }

  const status = error.response.status;
  const details = error.response.data;
  if (status === 401 || status === 403) return new MyraApiError("auth", "Authentication failed or session expired.", status, details);
  if (status === 422 || status === 400) return new MyraApiError("validation", "Validation failed. Review the submitted fields.", status, details);
  if (status === 429) return new MyraApiError("rate_limited", "Too many requests. Please wait and try again.", status, details);
  if (status >= 500) return new MyraApiError("server", "Server error. The backend service did not complete the request.", status, details);
  return new MyraApiError("unknown", error.message, status, details);
}

export function isBackendUnavailable(error: unknown) {
  const normalized = normalizeApiError(error);
  return normalized.kind === "network" || normalized.kind === "timeout";
}
