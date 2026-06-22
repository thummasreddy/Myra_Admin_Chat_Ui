import { createApiClient, isBackendUnavailable } from "@/lib/apiClient";
import { appConfig } from "@/lib/config";

export type TenantAdminStatus = "DRAFT" | "ACTIVE" | "REJECTED" | "SUSPENDED";
export type TenantApprovalStatus = "NOT_SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type TenantAdminRead = {
  id: string;
  tenant_id: string;
  business_name: string;
  website_url: string;
  business_email: string;
  phone: string | null;
  category: string | null;
  description: string | null;
  status: TenantAdminStatus;
  approval_status: TenantApprovalStatus;
  plan_id: string | null;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

export type TenantListResponse = {
  total: number;
  page: number;
  size: number;
  items: TenantAdminRead[];
};

function apiV1Url(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/v1")) return normalized;
  if (normalized.endsWith("/api/v1/admin")) return normalized.replace(/\/admin$/, "");
  return `${normalized}/api/v1`;
}

const adminClient = createApiClient(apiV1Url(appConfig.VITE_API_BASE_URL));

export async function listTenants(page = 1, size = 20): Promise<TenantListResponse> {
  const { data } = await adminClient.get<TenantListResponse>("/myra-admin/tenants", {
    params: { page, size }
  });
  return data;
}

export async function getTenant(tenantId: string): Promise<TenantAdminRead> {
  const { data } = await adminClient.get<TenantAdminRead>(`/myra-admin/tenants/${tenantId}`);
  return data;
}

export async function approveTenant(tenantId: string): Promise<void> {
  await adminClient.post(`/myra-admin/tenants/${tenantId}/approve`);
}

export async function rejectTenant(tenantId: string, reason: string): Promise<void> {
  await adminClient.post(`/myra-admin/tenants/${tenantId}/reject`, { reason });
}

export async function suspendTenant(tenantId: string): Promise<void> {
  await adminClient.post(`/myra-admin/tenants/${tenantId}/suspend`);
}

export async function reactivateTenant(tenantId: string): Promise<void> {
  await adminClient.post(`/myra-admin/tenants/${tenantId}/reactivate`);
}

export async function updateTenantPlan(tenantId: string, planId: string): Promise<void> {
  await adminClient.patch(`/myra-admin/tenants/${tenantId}/plan`, { plan_id: planId });
}

export async function updateTenantFeatures(
  tenantId: string,
  features: Record<string, boolean>
): Promise<void> {
  await adminClient.patch(`/myra-admin/tenants/${tenantId}/features`, features);
}

export async function listAuditLogs(page = 1, size = 20) {
  const { data } = await adminClient.get("/myra-admin/audit-logs", { params: { page, size } });
  return data;
}

export async function getGlobalSettings() {
  const { data } = await adminClient.get("/myra-admin/global-settings");
  return data;
}

export async function updateGlobalSettings(settings: Record<string, unknown>) {
  const { data } = await adminClient.patch("/myra-admin/global-settings", settings);
  return data;
}

export async function listPlans() {
  const { data } = await adminClient.get("/myra-admin/plans");
  return data;
}

export { isBackendUnavailable };
