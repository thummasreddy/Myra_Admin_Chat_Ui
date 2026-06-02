import { adminHttp } from "@/api/httpClient";
import type { ApprovalDecision, TenantReview } from "@/features/onboarding/onboarding.types";
import type { Tenant } from "@/features/tenants/tenant.types";

export async function fetchAdminSummary() {
  const { data } = await adminHttp.get("/admin/summary");
  return data;
}

export async function fetchPendingApprovals() {
  const { data } = await adminHttp.get<Tenant[]>("/admin/approvals");
  return data;
}

export async function fetchTenantReview(tenantId: string) {
  const { data } = await adminHttp.get<TenantReview>(`/admin/tenants/${tenantId}/review`);
  return data;
}

export async function approveTenantReview(tenantId: string) {
  const { data } = await adminHttp.post<Tenant>(`/admin/tenants/${tenantId}/approve`);
  return data;
}

export async function rejectTenantReview(tenantId: string, payload: ApprovalDecision) {
  const { data } = await adminHttp.post<Tenant>(`/admin/tenants/${tenantId}/reject`, payload);
  return data;
}

export async function requestTenantInformation(tenantId: string, payload: { message: string }) {
  const { data } = await adminHttp.post(`/admin/tenants/${tenantId}/request-info`, payload);
  return data;
}

export async function sendEmbedCodeEmail(tenantId: string) {
  const { data } = await adminHttp.post(`/admin/tenants/${tenantId}/send-embed-code`);
  return data;
}
