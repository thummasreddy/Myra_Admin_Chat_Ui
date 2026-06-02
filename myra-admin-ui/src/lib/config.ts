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
  VITE_API_BASE_URL: z.string().url().default("http://localhost:8000/api/v1"),
  VITE_TENANT_API_URL: z.string().url().optional(),
  VITE_ADMIN_API_URL: z.string().url().optional(),
  VITE_KNOWLEDGE_API_URL: z.string().url().optional(),
  VITE_ANALYTICS_API_URL: z.string().url().optional(),
  VITE_LEAD_API_URL: z.string().url().optional(),
  VITE_CHAT_API_URL: z.string().url().optional(),
  VITE_API_TIMEOUT_MS: numberFromEnv(12_000),
  VITE_API_RETRY_ATTEMPTS: numberFromEnv(2),
  VITE_API_RETRY_BASE_DELAY_MS: numberFromEnv(300),
  VITE_API_RATE_LIMIT_PER_MINUTE: numberFromEnv(120),
  VITE_ENABLE_DEMO_FALLBACKS: booleanFromEnv.default("true"),
  VITE_ENABLE_API_LOGGING: booleanFromEnv.default("false"),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_REQUIRE_ENV_VALIDATION: booleanFromEnv.default("false")
});

export type AppConfig = z.infer<typeof envSchema>;

function parseConfig(): AppConfig {
  const parsed = envSchema.safeParse(import.meta.env);
  const shouldFailFast = import.meta.env.PROD || import.meta.env.VITE_REQUIRE_ENV_VALIDATION === "true";

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    if (shouldFailFast) throw new Error(`Invalid Myra frontend environment: ${message}`);
    console.warn("Invalid Myra frontend environment; using development defaults.", message);
    return envSchema.parse({});
  }

  return parsed.data;
}

export const appConfig = parseConfig();

export const serviceBaseUrls = {
  tenant: appConfig.VITE_TENANT_API_URL ?? appConfig.VITE_API_BASE_URL,
  admin: appConfig.VITE_ADMIN_API_URL ?? appConfig.VITE_API_BASE_URL,
  knowledge: appConfig.VITE_KNOWLEDGE_API_URL ?? appConfig.VITE_API_BASE_URL,
  analytics: appConfig.VITE_ANALYTICS_API_URL ?? appConfig.VITE_API_BASE_URL,
  lead: appConfig.VITE_LEAD_API_URL ?? appConfig.VITE_API_BASE_URL,
  chat: appConfig.VITE_CHAT_API_URL ?? appConfig.VITE_API_BASE_URL
};
