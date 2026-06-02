import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { appConfig } from "@/lib/config";
import { normalizeApiError, isBackendUnavailable, type MyraApiError } from "@/lib/apiErrors";
import { API_BASE_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { sanitizePayload } from "@/lib/sanitize";
import { useAuthStore } from "@/features/auth/auth.store";

type RetryConfig = InternalAxiosRequestConfig & {
  metadata?: {
    requestStartedAt?: number;
    retryCount?: number;
  };
};

const stateChangingMethods = new Set(["post", "put", "patch", "delete"]);
const requestTimestamps: number[] = [];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shouldRetry(error: AxiosError, retryCount: number) {
  if (retryCount >= appConfig.VITE_API_RETRY_ATTEMPTS) return false;
  if (!error.response) return true;
  return error.response.status === 429 || error.response.status >= 500;
}

function enforceClientRateLimit() {
  const now = Date.now();
  const windowStart = now - 60_000;
  while (requestTimestamps.length && requestTimestamps[0] < windowStart) requestTimestamps.shift();
  if (requestTimestamps.length >= appConfig.VITE_API_RATE_LIMIT_PER_MINUTE) {
    throw new Error("Client-side API rate limit exceeded. Please slow down and try again.");
  }
  requestTimestamps.push(now);
}

function csrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)MYRA_CSRF_TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function refreshToken(client: AxiosInstance) {
  const { token, setSession, logout, user } = useAuthStore.getState();
  if (!token || !user) return false;
  try {
    const { data } = await client.post<{ token: string }>("/auth/refresh", undefined, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!data.token) return false;
    setSession(data.token, user);
    return true;
  } catch {
    logout();
    return false;
  }
}

export function createApiClient(baseURL = API_BASE_URL): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: appConfig.VITE_API_TIMEOUT_MS,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  });

  client.interceptors.request.use((config: RetryConfig) => {
    enforceClientRateLimit();
    config.metadata = { requestStartedAt: performance.now(), retryCount: config.metadata?.retryCount ?? 0 };

    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const apiKey = import.meta.env.VITE_PUBLIC_WIDGET_KEY;
    if (apiKey) config.headers["X-Api-Key"] = apiKey;

    const method = config.method?.toLowerCase();
    const csrf = csrfToken();
    if (method && stateChangingMethods.has(method) && csrf) config.headers["X-CSRF-Token"] = csrf;

    if (config.data && !(config.data instanceof FormData)) config.data = sanitizePayload(config.data);

    logger.info("api_request", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const startedAt = (response.config as RetryConfig).metadata?.requestStartedAt;
      logger.info("api_response", {
        method: response.config.method,
        url: response.config.url,
        status: response.status,
        durationMs: startedAt ? Math.round(performance.now() - startedAt) : undefined
      });
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      const retryCount = config?.metadata?.retryCount ?? 0;

      if (error.response?.status === 401 && config && !config.url?.includes("/auth/refresh")) {
        const refreshed = await refreshToken(client);
        if (refreshed) return client(config);
      }

      if (config && shouldRetry(error, retryCount)) {
        config.metadata = { ...config.metadata, retryCount: retryCount + 1 };
        const retryAfter = Number(error.response?.headers["retry-after"]);
        const delay = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : appConfig.VITE_API_RETRY_BASE_DELAY_MS * 2 ** retryCount;
        logger.warn("api_retry", { url: config.url, retryCount: retryCount + 1, delay });
        await sleep(delay);
        return client(config);
      }

      const normalized = normalizeApiError(error);
      logger.error("api_error", {
        kind: normalized.kind,
        status: normalized.status,
        message: normalized.message,
        url: config?.url
      });

      if (normalized.kind === "auth") {
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/login") window.location.assign("/login");
      }

      return Promise.reject(normalized);
    }
  );

  return client;
}

export const apiClient = createApiClient();

export { isBackendUnavailable };
export type { MyraApiError };
