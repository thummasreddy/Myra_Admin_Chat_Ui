import { createApiClient, isBackendUnavailable } from "@/lib/apiClient";
import { appConfig } from "@/lib/config";
import { approvalQueue, platformPlans, platformTenants } from "@/features/admin/platformAdmin.data";

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
    if (isBackendUnavailable(error)) return fallbackDashboard();
    throw error;
  }
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

function fallbackDashboard(): MyraAdminDashboard {
  const activeTenants = platformTenants.filter((tenant) => tenant.status === "ACTIVE");
  const failedUploads = platformTenants.filter((tenant) => tenant.failedKnowledge).length;
  const totalConversations = platformTenants.reduce((sum, tenant) => sum + tenant.chatSessions, 0);
  const totalLeads = platformTenants.reduce((sum, tenant) => sum + tenant.leadsCaptured, 0);
  const revenueEstimate = activeTenants.reduce((sum, tenant) => {
    const plan = platformPlans.find((candidate) => candidate.name === tenant.plan);
    return sum + (plan?.monthlyPrice ?? 0);
  }, 0);
  const planCounts = platformPlans.map((plan) => ({
    plan_name: plan.name,
    count: platformTenants.filter((tenant) => tenant.plan === plan.name).length
  }));

  return {
    total_tenants: platformTenants.length,
    pending_approvals: approvalQueue.length,
    active_tenants: activeTenants.length,
    inactive_tenants: platformTenants.filter((tenant) => tenant.status === "SUSPENDED" || tenant.status === "REJECTED").length,
    total_conversations: totalConversations,
    total_leads: totalLeads,
    revenue_estimate: revenueEstimate,
    failed_uploads: failedUploads,
    plan_distribution: planCounts,
    pending_businesses: approvalQueue.map((tenant) => ({
      id: tenant.id,
      business_name: tenant.businessName,
      category: tenant.category,
      registration_date: tenant.registrationDate
    })),
    recent_tenants: [...platformTenants]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5)
      .map((tenant) => ({
        id: tenant.id,
        tenant_name: tenant.name,
        category: tenant.category,
        status: tenant.status === "REJECTED" ? "INACTIVE" : tenant.status,
        created_at: tenant.createdAt
      })),
    platform_usage: [...platformTenants]
      .sort((a, b) => b.chatSessions - a.chatSessions)
      .slice(0, 5)
      .map((tenant) => ({ tenant_name: tenant.name, conversation_count: tenant.chatSessions })),
    system_health: [
      { service_name: "Tenant service", status: "ACTIVE" },
      { service_name: "Chat service", status: "ACTIVE" },
      { service_name: "Knowledge service", status: failedUploads > 0 ? "DEGRADED" : "ACTIVE" },
      { service_name: "Analytics service", status: "ACTIVE" },
      { service_name: "Lead service", status: "ACTIVE" }
    ]
  };
}
