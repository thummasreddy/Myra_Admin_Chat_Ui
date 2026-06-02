import { tenantHttp } from "@/api/httpClient";
import type { BusinessRegistrationInput, BusinessRegistration } from "@/features/onboarding/onboarding.types";
import type { Tenant, TenantCreateRequest, TenantListFilters } from "@/features/tenants/tenant.types";

export async function fetchTenants(filters?: TenantListFilters) {
  const { data } = await tenantHttp.get<Tenant[]>("/tenants", { params: filters });
  return data;
}

export async function fetchTenant(tenantId: string) {
  const { data } = await tenantHttp.get<Tenant>(`/tenants/${tenantId}`);
  return data;
}

export async function createTenantProfile(payload: TenantCreateRequest) {
  const { data } = await tenantHttp.post<Tenant>("/tenants", payload);
  return data;
}

export async function updateTenantProfile(tenantId: string, payload: Partial<Tenant>) {
  const { data } = await tenantHttp.patch<Tenant>(`/tenants/${tenantId}`, payload);
  return data;
}

export async function registerBusiness(payload: BusinessRegistrationInput) {
  const { data } = await tenantHttp.post<BusinessRegistration>("/business-registrations", payload);
  return data;
}
