import { adminHttp } from "@/api/httpClient";
import type { ApprovalDecision, TenantReview } from "@/features/onboarding/onboarding.types";
import { fromTenantListResponse, fromTenantResponse } from "@/features/tenants/tenant.transformers";

export async function fetchAdminSummary() {
  const { data } = await adminHttp.get("/summary");
  return data;
}

export async function fetchPendingApprovals() {
  const { data } = await adminHttp.get<unknown>("/approvals");
  return fromTenantListResponse(data);
}

export async function fetchTenantReview(tenantId: string) {
  const { data } = await adminHttp.get<TenantReview>(`/tenants/${tenantId}/review`);
  return data;
}

export async function approveTenantReview(tenantId: string) {
  const { data } = await adminHttp.post<unknown>(`/tenants/${tenantId}/approve`);
  return fromTenantResponse(data);
}

export async function rejectTenantReview(tenantId: string, payload: ApprovalDecision) {
  const { data } = await adminHttp.post<unknown>(`/tenants/${tenantId}/reject`, payload);
  return fromTenantResponse(data);
}

export async function requestTenantInformation(tenantId: string, payload: { message: string }) {
  const { data } = await adminHttp.post(`/tenants/${tenantId}/request-info`, payload);
  return data;
}

export async function sendEmbedCodeEmail(tenantId: string) {
  const { data } = await adminHttp.post(`/tenants/${tenantId}/send-embed-code`);
  return data;
}
