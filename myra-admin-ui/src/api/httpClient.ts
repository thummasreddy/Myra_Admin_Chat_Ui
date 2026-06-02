import { serviceBaseUrls } from "@/lib/config";
import { normalizeApiError, isBackendUnavailable } from "@/lib/apiErrors";
import { createApiClient } from "@/lib/apiClient";

type ServiceName = keyof typeof serviceBaseUrls;

function createServiceClient(service: ServiceName) {
  return createApiClient(serviceBaseUrls[service]);
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
