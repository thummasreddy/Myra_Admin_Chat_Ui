import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "@/lib/apiClient";
import { normalizeApiError } from "@/lib/apiErrors";
import { useAuthStore } from "@/features/auth/auth.store";

const adminUser = {
  id: "admin-1",
  name: "Admin",
  email: "admin@myra.ai",
  role: "ADMIN" as const
};

function axiosError(status: number, config: InternalAxiosRequestConfig, data: unknown = {}) {
  return new AxiosError("Request failed", undefined, config, {}, { data, status, statusText: "Error", headers: {}, config });
}

describe("apiClient", () => {
  it("adds auth, csrf, and sanitized request data", async () => {
    useAuthStore.getState().setSession("jwt-token", adminUser);
    document.cookie = "MYRA_CSRF_TOKEN=csrf-token; path=/";

    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config
    }));

    const client = createApiClient("https://gateway.myra.test/api/v1");
    client.defaults.adapter = adapter;

    await client.post("/tenants", { name: "<script>alert(1)</script>" });

    const config = adapter.mock.calls[0][0];
    expect(config.headers.Authorization).toBe("Bearer jwt-token");
    expect(config.headers["X-CSRF-Token"]).toBe("csrf-token");
    expect(JSON.parse(config.data as string)).toEqual({ name: "&lt;script&gt;alert(1)&lt;/script&gt;" });
  });

  it("retries transient server errors with exponential backoff", async () => {
    vi.useFakeTimers();
    let attempts = 0;

    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      attempts += 1;
      if (attempts === 1) throw axiosError(500, config);
      return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config };
    });

    const client = createApiClient("https://gateway.myra.test/api/v1");
    client.defaults.adapter = adapter;

    const request = client.get("/tenants");
    await vi.advanceTimersByTimeAsync(300);
    const response = await request;

    expect(response.data).toEqual({ ok: true });
    expect(adapter).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("classifies validation and server errors", () => {
    const config = { headers: {} } as InternalAxiosRequestConfig;
    expect(normalizeApiError(axiosError(422, config)).kind).toBe("validation");
    expect(normalizeApiError(axiosError(503, config)).kind).toBe("server");
  });
});
