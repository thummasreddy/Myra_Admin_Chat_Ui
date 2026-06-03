import { tenantHttp } from "@/api/httpClient";
import type { BusinessRegistrationInput, BusinessRegistration } from "@/features/onboarding/onboarding.types";
import type { Tenant, TenantCreateRequest, TenantListFilters } from "@/features/tenants/tenant.types";
import {
  fromTenantListResponse,
  fromTenantResponse,
  toTenantCreateRequest,
  toTenantUpdateRequest
} from "@/features/tenants/tenant.transformers";

export async function fetchTenants(filters?: TenantListFilters) {
  const { data } = await tenantHttp.get<unknown>("/tenants", { params: filters });
  return fromTenantListResponse(data);
}

export async function fetchTenant(tenantId: string) {
  const { data } = await tenantHttp.get<unknown>(`/tenants/${tenantId}`);
  return fromTenantResponse(data);
}

export async function createTenantProfile(payload: TenantCreateRequest) {
  const { data } = await tenantHttp.post<unknown>("/tenants", toTenantCreateRequest(payload));
  return fromTenantResponse(data);
}

export async function updateTenantProfile(tenantId: string, payload: Partial<Tenant>) {
  const { data } = await tenantHttp.patch<unknown>(`/tenants/${tenantId}`, toTenantUpdateRequest(payload));
  return fromTenantResponse(data);
}

export async function registerBusiness(payload: BusinessRegistrationInput) {
  const { data } = await tenantHttp.post<BusinessRegistration>("/business-registrations", payload);
  return data;
}
