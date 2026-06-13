import { createApiClient } from "@/lib/apiClient";
import { appConfig } from "@/lib/config";

export type DashboardTenantStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";
export type SystemHealthStatus = "ACTIVE" | "DEGRADED" | "DOWN";

export type MyraAdminDashboard = {
  total_tenants: number;
  pending_approvals: number;
  active_tenants: number;
  inactive_tenants: number;
  total_conversations: number;
  total_leads: number;
  revenue_estimate: number;
  failed_uploads: number;
  plan_distribution: { plan_name: string; count: number }[];
  pending_businesses: { id: string; business_name: string; category: string; registration_date: string }[];
  recent_tenants: {
    id: string;
    tenant_name: string;
    category: string;
    status: DashboardTenantStatus;
    created_at: string;
  }[];
  platform_usage: { tenant_name: string; conversation_count: number }[];
  system_health: { service_name: string; status: SystemHealthStatus }[];
};

function myraApiUrl(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/myra")) return normalized;
  return `${normalized}/api/myra`;
}

const dashboardClient = createApiClient(myraApiUrl(appConfig.VITE_API_BASE_URL));

export async function getMyraAdminDashboard(): Promise<MyraAdminDashboard> {
  const { data } = await dashboardClient.get<MyraAdminDashboard>("/admin/dashboard");
  return normalizeDashboard(data);
}

function normalizeDashboard(data: MyraAdminDashboard): MyraAdminDashboard {
  return {
    ...data,
    pending_businesses: data.pending_businesses ?? [],
    plan_distribution: data.plan_distribution ?? [],
    recent_tenants: data.recent_tenants ?? [],
    platform_usage: data.platform_usage ?? [],
    system_health: data.system_health ?? []
  };
}
