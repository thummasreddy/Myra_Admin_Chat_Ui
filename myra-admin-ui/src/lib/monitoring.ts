import { appConfig } from "@/lib/config";
import { logger } from "@/lib/logger";

let initialized = false;

export function initMonitoring() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  if (appConfig.VITE_SENTRY_DSN) {
    logger.info("monitoring_configured", { provider: "sentry" });
  }

  if ("PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          logger.info("performance_navigation", {
            name: entry.name,
            durationMs: Math.round(entry.duration)
          });
        }
      }
    });
    observer.observe({ type: "navigation", buffered: true });
  }
}
