import { describe, expect, it, vi } from "vitest";
import { parseEnvConfig } from "@/config/env";

describe("env config", () => {
  it("uses internal admin defaults for local development", () => {
    const config = parseEnvConfig({});

    expect(config.VITE_API_BASE_URL).toBe("http://localhost:8000");
    expect(config.VITE_ADMIN_API_URL).toBe("http://localhost:8006/api/admin");
    expect(config.VITE_ANALYTICS_API_URL).toBe("http://localhost:8005/api/analytics");
  });

  it("throws clear errors when fail-fast validation is enabled", () => {
    expect(() => parseEnvConfig({ VITE_ADMIN_API_URL: "not-a-url" }, true)).toThrow(/Invalid Myra frontend environment/);
  });

  it("falls back without throwing outside fail-fast mode", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const config = parseEnvConfig({ VITE_ADMIN_API_URL: "not-a-url" }, false);

    expect(config.VITE_ADMIN_API_URL).toBe("http://localhost:8006/api/admin");
    warn.mockRestore();
  });
});
