import type { AxiosInstance } from "axios";
import { serviceBaseUrls } from "@/lib/config";
import { appConfig } from "@/lib/config";
import { normalizeApiError, isBackendUnavailable } from "@/lib/apiErrors";
import { createApiClient } from "@/lib/apiClient";

type ServiceName = keyof typeof serviceBaseUrls;

function createServiceClient(service: ServiceName) {
  const client = createApiClient(serviceBaseUrls[service]);
  if (service === "admin") addAdminSecret(client);
  return client;
}

function addAdminSecret(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    config.headers["X-Admin-Secret"] = appConfig.VITE_ADMIN_SECRET;
    return config;
  });
}

export const tenantHttp = createServiceClient("tenant");
export const adminHttp = createServiceClient("admin");
export const knowledgeHttp = createServiceClient("knowledge");
export const analyticsHttp = createServiceClient("analytics");
export const leadHttp = createServiceClient("lead");
export const chatHttp = createServiceClient("chat");

export function isServiceUnavailable(error: unknown) {
  return isBackendUnavailable(normalizeApiError(error));
}
