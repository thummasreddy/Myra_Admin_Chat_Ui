import { createApiClient, isBackendUnavailable } from "@/lib/apiClient";
import { appConfig } from "@/lib/config";

export type DashboardTenantStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";
export type SystemHealthStatus = "ACTIVE" | "DEGRADED" | "DOWN";

export type MyraAdminDashboard = {
  total_tenants: number;
  pending_approvals: number;
  active_tenants: number;
  suspended_tenants: number;
  total_conversations: number;
  total_leads: number;
  total_users: number;
  recent_tenants: {
    id: string;
    tenant_id: string;
    business_name: string;
    status: string;
    created_at: string;
  }[];
};

function apiV1Url(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/v1")) return normalized;
  if (normalized.endsWith("/api/v1/admin")) return normalized.replace(/\/admin$/, "");
  return `${normalized}/api/v1`;
}

const dashboardClient = createApiClient(apiV1Url(appConfig.VITE_API_BASE_URL));

export async function getMyraAdminDashboard(): Promise<MyraAdminDashboard> {
  try {
    const { data } = await dashboardClient.get<MyraAdminDashboard>("/myra-admin/dashboard");
    return normalizeDashboard(data);
  } catch (error) {
    if (isBackendUnavailable(error) && appConfig.VITE_ENABLE_DEMO_FALLBACKS) {
      return emptyDashboard();
    }
    throw error;
  }
}

function normalizeDashboard(data: MyraAdminDashboard): MyraAdminDashboard {
  return {
    ...data,
    recent_tenants: data.recent_tenants ?? []
  };
}

function emptyDashboard(): MyraAdminDashboard {
  return {
    total_tenants: 0,
    pending_approvals: 0,
    active_tenants: 0,
    suspended_tenants: 0,
    total_conversations: 0,
    total_leads: 0,
    total_users: 0,
    recent_tenants: []
  };
}
