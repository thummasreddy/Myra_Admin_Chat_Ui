import { z } from "zod";

const booleanFromEnv = z
  .string()
  .optional()
  .transform((value) => value === "true");

const numberFromEnv = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    });

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("http://localhost:8080"),
  VITE_ANALYTICS_API_URL: z.string().url().default("http://localhost:8080/api/v1/analytics"),
  VITE_ADMIN_API_URL: z.string().url().default("http://localhost:8080/api/v1/tenants"),
  VITE_API_TIMEOUT_MS: numberFromEnv(12_000),
  VITE_API_RETRY_ATTEMPTS: numberFromEnv(2),
  VITE_API_RETRY_BASE_DELAY_MS: numberFromEnv(300),
  VITE_API_RATE_LIMIT_PER_MINUTE: numberFromEnv(120),
  VITE_ENABLE_DEMO_FALLBACKS: booleanFromEnv.default("false"),
  VITE_ENABLE_API_LOGGING: booleanFromEnv.default("false"),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_REQUIRE_ENV_VALIDATION: booleanFromEnv.default("false")
});

export type AppConfig = z.infer<typeof envSchema>;

export function parseEnvConfig(env: Record<string, unknown>, failFast = false): AppConfig {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    if (failFast) throw new Error(`Invalid Myra frontend environment: ${message}`);
    console.warn("Invalid Myra frontend environment; using development defaults.", message);
    return envSchema.parse({});
  }

  return parsed.data;
}

const shouldFailFast = import.meta.env.PROD || import.meta.env.VITE_REQUIRE_ENV_VALIDATION === "true";

export const appConfig = parseEnvConfig(import.meta.env, shouldFailFast);

export const serviceBaseUrls = {
  admin: appConfig.VITE_ADMIN_API_URL,
  analytics: appConfig.VITE_ANALYTICS_API_URL
};
