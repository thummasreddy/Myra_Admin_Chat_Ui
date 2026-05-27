import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import type {
  Tenant,
  TenantCreateRequest,
  TenantCreateResponse,
  TenantListFilters,
  TenantStatus
} from "@/features/tenants/tenant.types";

const STORAGE_KEY = "myra-admin-fallback-tenants";

const demoTenants: Tenant[] = [
  {
    tenantId: "tenant_vthumma",
    apiKey: "mk_live_demo_vthumma",
    tenantName: "VThumma Portfolio",
    websiteUrl: "https://www.vthumma.com",
    industry: "Technology Portfolio",
    supportEmail: "support@vthumma.com",
    country: "United States",
    timezone: "America/Phoenix",
    assistantName: "Myra",
    assistantIntro: "Hi, I am Myra, Vijay's AI assistant.",
    brandColor: "#2563EB",
    logoUrl: "",
    avatarUrl: "",
    chatPosition: "bottom-right",
    systemPrompt: "You are Myra, a helpful AI assistant for this business.",
    responseStyle: "professional",
    allowedTopics: ["career", "projects", "technology"],
    blockedTopics: ["medical", "legal"],
    fallbackMessage: "I am not sure about that yet. Please contact support.",
    suggestedPrompts: [
      "Tell me about Vijay's experience",
      "What projects has Vijay built?",
      "How can I contact Vijay?"
    ],
    enableWebSearch: false,
    enableLeadCapture: true,
    enableSuggestedPrompts: true,
    enableAnalytics: true,
    enableHumanEscalation: false,
    status: "ACTIVE",
    createdAt: "2026-05-01T15:00:00.000Z",
    updatedAt: "2026-05-22T18:30:00.000Z"
  },
  {
    tenantId: "tenant_acme_dental",
    apiKey: "mk_live_demo_acme",
    tenantName: "Acme Dental",
    websiteUrl: "https://example.com",
    industry: "Healthcare",
    supportEmail: "hello@example.com",
    country: "United States",
    timezone: "America/New_York",
    assistantName: "Myra",
    assistantIntro: "Hi, I can help with appointments, services, and common questions.",
    brandColor: "#1D4ED8",
    chatPosition: "bottom-left",
    systemPrompt: "You are Myra, a helpful AI assistant for a dental office.",
    responseStyle: "friendly",
    allowedTopics: ["appointments", "services", "insurance"],
    blockedTopics: ["diagnosis", "emergency medical advice"],
    fallbackMessage: "I do not have that answer yet. Please contact the office.",
    suggestedPrompts: ["Book an appointment", "What services do you offer?", "Do you accept insurance?"],
    enableWebSearch: false,
    enableLeadCapture: true,
    enableSuggestedPrompts: true,
    enableAnalytics: true,
    enableHumanEscalation: true,
    status: "INACTIVE",
    createdAt: "2026-04-18T12:30:00.000Z",
    updatedAt: "2026-05-14T09:00:00.000Z"
  }
];

function readFallbackTenants() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return demoTenants;
  try {
    return JSON.parse(raw) as Tenant[];
  } catch {
    return demoTenants;
  }
}

function writeFallbackTenants(tenants: Tenant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
}

function filterTenants(tenants: Tenant[], filters?: TenantListFilters) {
  const search = filters?.search?.toLowerCase().trim();
  return tenants.filter((tenant) => {
    const matchesSearch = !search || tenant.tenantName.toLowerCase().includes(search);
    const matchesStatus = !filters?.status || filters.status === "ALL" || tenant.status === filters.status;
    return matchesSearch && matchesStatus;
  });
}

export async function listTenants(filters?: TenantListFilters): Promise<Tenant[]> {
  try {
    const { data } = await apiClient.get<Tenant[]>("/tenants", { params: filters });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return filterTenants(readFallbackTenants(), filters);
  }
}

export async function getTenant(tenantId: string): Promise<Tenant> {
  try {
    const { data } = await apiClient.get<Tenant>(`/tenants/${tenantId}`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenant = readFallbackTenants().find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    return tenant;
  }
}

export async function createTenant(payload: TenantCreateRequest): Promise<TenantCreateResponse> {
  try {
    const { data } = await apiClient.post<TenantCreateResponse>("/tenants", payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const createdAt = new Date().toISOString();
    const tenantId = `tenant_${payload.tenantName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${Date.now()
      .toString()
      .slice(-5)}`;
    const tenant: Tenant = {
      ...payload,
      tenantId,
      apiKey: `mk_live_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
      status: "ACTIVE",
      createdAt,
      updatedAt: createdAt
    };
    const tenants = [tenant, ...readFallbackTenants()];
    writeFallbackTenants(tenants);
    return { tenant, tenantId: tenant.tenantId, apiKey: tenant.apiKey };
  }
}

export async function updateTenant(tenantId: string, payload: Partial<TenantCreateRequest> & { status?: TenantStatus }): Promise<Tenant> {
  try {
    const { data } = await apiClient.patch<Tenant>(`/tenants/${tenantId}`, payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenants = readFallbackTenants();
    const tenant = tenants.find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const updatedTenant = { ...tenant, ...payload, updatedAt: new Date().toISOString() };
    writeFallbackTenants(tenants.map((item) => (item.tenantId === tenantId ? updatedTenant : item)));
    return updatedTenant;
  }
}

export async function setTenantStatus(tenantId: string, status: TenantStatus): Promise<Tenant> {
  return updateTenant(tenantId, { status });
}

export async function regenerateTenantApiKey(tenantId: string): Promise<Tenant> {
  try {
    const { data } = await apiClient.post<Tenant>(`/tenants/${tenantId}/regenerate-api-key`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const apiKey = `mk_live_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
    return updateTenant(tenantId, { apiKey } as Partial<TenantCreateRequest> & { apiKey: string });
  }
}
