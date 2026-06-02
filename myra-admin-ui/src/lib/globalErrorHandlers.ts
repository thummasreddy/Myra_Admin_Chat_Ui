import { captureError } from "@/lib/logger";

let installed = false;

export function installGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    captureError(event.error ?? event.message, {
      source: "window.error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureError(event.reason, { source: "unhandledrejection" });
  });
}
