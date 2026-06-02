import { analyticsHttp } from "@/api/httpClient";
import type { AnalyticsSummary } from "@/features/analytics/analytics.api";

export async function fetchAnalyticsSummary(tenantId?: string) {
  const { data } = await analyticsHttp.get<AnalyticsSummary>("/analytics/summary", { params: { tenantId } });
  return data;
}

export async function fetchPlatformUsage() {
  const { data } = await analyticsHttp.get("/analytics/platform-usage");
  return data;
}
