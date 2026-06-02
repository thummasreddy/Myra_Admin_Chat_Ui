import { appConfig } from "@/lib/config";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

declare global {
  interface Window {
    Sentry?: {
      captureException?: (error: unknown, context?: { extra?: LogPayload }) => void;
      captureMessage?: (message: string, context?: { level?: string; extra?: LogPayload }) => void;
    };
  }
}

function emit(level: LogLevel, event: string, payload: LogPayload = {}) {
  if (!appConfig.VITE_ENABLE_API_LOGGING && level !== "error") return;
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...payload
  };
  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  writer(`[myra:${event}]`, entry);
}

export const logger = {
  debug: (event: string, payload?: LogPayload) => emit("debug", event, payload),
  info: (event: string, payload?: LogPayload) => emit("info", event, payload),
  warn: (event: string, payload?: LogPayload) => emit("warn", event, payload),
  error: (event: string, payload?: LogPayload) => emit("error", event, payload)
};

export function trackUserAction(action: string, payload?: LogPayload) {
  logger.info("user_action", { action, ...payload });
  window.Sentry?.captureMessage?.(`user_action:${action}`, { level: "info", extra: payload });
}

export function captureError(error: unknown, context: LogPayload = {}) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("frontend_error", { message, ...context });
  window.Sentry?.captureException?.(error, { extra: context });
}
