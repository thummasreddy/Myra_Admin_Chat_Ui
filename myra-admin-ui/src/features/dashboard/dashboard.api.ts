import { apiClient, isBackendUnavailable } from "@/lib/apiClient";

export type DashboardSummary = {
  totalTenants: number;
  activeTenants: number;
  totalConversations: number;
  leadsCaptured: number;
  failedResponses: number;
  averageResponseTimeMs: number;
};

const fallbackSummary: DashboardSummary = {
  totalTenants: 12,
  activeTenants: 9,
  totalConversations: 8420,
  leadsCaptured: 318,
  failedResponses: 41,
  averageResponseTimeMs: 820
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const { data } = await apiClient.get<DashboardSummary>("/analytics/dashboard");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return fallbackSummary;
  }
}
