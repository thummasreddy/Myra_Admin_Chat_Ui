import { analyticsHttp } from "@/api/httpClient";
import type { AnalyticsSummary } from "@/features/analytics/analytics.api";

export async function fetchAnalyticsSummary(tenantId?: string) {
  const { data } = await analyticsHttp.get<AnalyticsSummary>("/summary", { params: { tenant_id: tenantId } });
  return data;
}

export async function fetchPlatformUsage() {
  const { data } = await analyticsHttp.get("/platform-usage");
  return data;
}
