import { describe, expect, it, vi } from "vitest";
import { parseEnvConfig } from "@/config/env";

describe("env config", () => {
  it("uses backend service defaults for local development", () => {
    const config = parseEnvConfig({});

    expect(config.VITE_TENANT_API_URL).toBe("http://localhost:8000/api/v1");
    expect(config.VITE_CHAT_API_URL).toBe("http://localhost:8003/api/chat");
    expect(config.VITE_ADMIN_SECRET).toBe("local-dev-admin-secret");
  });

  it("throws clear errors when fail-fast validation is enabled", () => {
    expect(() => parseEnvConfig({ VITE_TENANT_API_URL: "not-a-url" }, true)).toThrow(/Invalid Myra frontend environment/);
  });

  it("falls back without throwing outside fail-fast mode", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const config = parseEnvConfig({ VITE_TENANT_API_URL: "not-a-url" }, false);

    expect(config.VITE_TENANT_API_URL).toBe("http://localhost:8000/api/v1");
    warn.mockRestore();
  });
});
