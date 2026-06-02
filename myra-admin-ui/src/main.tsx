import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { appConfig } from "@/lib/config";
import { installGlobalErrorHandlers } from "@/lib/globalErrorHandlers";
import { initMonitoring } from "@/lib/monitoring";
import "@/styles/globals.css";

installGlobalErrorHandlers();
initMonitoring();
void appConfig;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
