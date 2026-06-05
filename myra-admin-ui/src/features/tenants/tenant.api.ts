import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import type {
  Tenant,
  TenantCreateRequest,
  TenantCreateResponse,
  TenantListFilters,
  TenantStatus,
  TestExtractionRequest,
  TestExtractionResponse
} from "@/features/tenants/tenant.types";
import { defaultAiBehaviorCaptureValues } from "@/features/tenants/tenant.schema";
import {
  fromTenantListResponse,
  fromTenantResponse,
  toTenantCreateRequest,
  toTenantUpdateRequest
} from "@/features/tenants/tenant.transformers";

const STORAGE_KEY = "myra-admin-fallback-tenants";

const demoTenants: Tenant[] = [
  {
    tenantId: "tenant_vthumma",
    apiKey: "mk_live_demo_vthumma",
    tenantName: "VThumma Portfolio",
    websiteUrl: "https://www.vthumma.com",
    industry: "Technology Portfolio",
    supportEmail: "support@vthumma.com",
    businessEmail: "support@vthumma.com",
    phoneNumber: "+1 602 555 0100",
    businessDescription: "Portfolio and project information for technology visitors.",
    country: "United States",
    timezone: "America/Phoenix",
    assistantName: "Myra",
    assistantIntro: "Hi, I am Myra, Vijay's AI assistant.",
    brandColor: "#EA5455",
    logoUrl: "",
    avatarUrl: "",
    chatPosition: "bottom-right",
    systemPrompt: "You are Myra, a helpful AI assistant for this business.",
    responseStyle: "PROFESSIONAL",
    allowedTopics: ["career", "projects", "technology"],
    blockedTopics: ["medical", "legal"],
    fallbackMessage: "I am not sure about that yet. Please contact support.",
    suggestedPrompts: ["Tell me about Vijay's experience", "What projects has Vijay built?", "How can I contact Vijay?"],
    enableWebSearch: false,
    enableLeadCapture: true,
    enableSuggestedPrompts: true,
    enableAnalytics: true,
    enableHumanEscalation: false,
    ...defaultAiBehaviorCaptureValues,
    status: "ACTIVE",
    onboardingStatus: "APPROVED",
    approvalStatus: "APPROVED",
    selectedSubscriptionPlan: "TWELVE_MONTHS",
    paymentStatus: "SUCCESS",
    subscriptionStatus: "ACTIVE",
    documentProcessingStatus: "READY",
    embedCode: `<script
  src="https://cdn.myra.ai/widget.js"
  data-tenant-id="tenant_vthumma"
  data-api-key="mk_live_demo_vthumma">
</script>`,
    approvedAt: "2026-05-02T17:00:00.000Z",
    embedCodeEmailSentAt: "2026-05-02T17:05:00.000Z",
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
    businessEmail: "hello@example.com",
    phoneNumber: "+1 212 555 0198",
    businessDescription: "Neighborhood dental office offering appointments, services, and insurance guidance.",
    country: "United States",
    timezone: "America/New_York",
    assistantName: "Myra",
    assistantIntro: "Hi, I can help with appointments, services, and common questions.",
    brandColor: "#EA5455",
    chatPosition: "bottom-left",
    systemPrompt: "You are Myra, a helpful AI assistant for a dental office.",
    responseStyle: "FRIENDLY",
    allowedTopics: ["appointments", "services", "insurance"],
    blockedTopics: ["diagnosis", "emergency medical advice"],
    fallbackMessage: "I do not have that answer yet. Please contact the office.",
    suggestedPrompts: ["Book an appointment", "What services do you offer?", "Do you accept insurance?"],
    enableWebSearch: false,
    enableLeadCapture: true,
    enableSuggestedPrompts: true,
    enableAnalytics: true,
    enableHumanEscalation: true,
    ...defaultAiBehaviorCaptureValues,
    status: "INACTIVE",
    onboardingStatus: "APPROVED",
    approvalStatus: "APPROVED",
    selectedSubscriptionPlan: "MONTHLY",
    paymentStatus: "SUCCESS",
    subscriptionStatus: "ACTIVE",
    documentProcessingStatus: "READY",
    createdAt: "2026-04-18T12:30:00.000Z",
    updatedAt: "2026-05-14T09:00:00.000Z"
  }
];

function withAiBehaviorCaptureDefaults(tenant: Tenant): Tenant {
  return fromTenantResponse({
    ...defaultAiBehaviorCaptureValues,
    ...tenant
  });
}

export function readFallbackTenants() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return demoTenants.map(withAiBehaviorCaptureDefaults);
  try {
    return (JSON.parse(raw) as Tenant[]).map(withAiBehaviorCaptureDefaults);
  } catch {
    return demoTenants.map(withAiBehaviorCaptureDefaults);
  }
}

export function writeFallbackTenants(tenants: Tenant[]) {
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
    const { data } = await apiClient.get<unknown>("/tenants", { params: filters });
    return fromTenantListResponse(data);
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return filterTenants(readFallbackTenants(), filters);
  }
}

export async function getTenant(tenantId: string): Promise<Tenant> {
  try {
    const { data } = await apiClient.get<unknown>(`/tenants/${tenantId}`);
    return fromTenantResponse(data);
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenant = readFallbackTenants().find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    return tenant;
  }
}

export async function createTenant(payload: TenantCreateRequest): Promise<TenantCreateResponse> {
  try {
    const { data } = await apiClient.post<unknown>("/tenants", toTenantCreateRequest(payload));
    const tenant = fromTenantResponse(data);
    return { tenant, tenantId: tenant.tenantId, apiKey: tenant.apiKey };
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const createdAt = new Date().toISOString();
    const tenantId = `tenant_${payload.tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")}_${Date.now().toString().slice(-5)}`;
    const tenant: Tenant = {
      ...defaultAiBehaviorCaptureValues,
      ...payload,
      tenantId,
      apiKey: `mk_live_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
      status: "ACTIVE",
      onboardingStatus: "APPROVED",
      approvalStatus: "APPROVED",
      paymentStatus: "SUCCESS",
      subscriptionStatus: "ACTIVE",
      documentProcessingStatus: "READY",
      createdAt,
      updatedAt: createdAt
    };
    const tenants = [tenant, ...readFallbackTenants()];
    writeFallbackTenants(tenants);
    return { tenant, tenantId: tenant.tenantId, apiKey: tenant.apiKey };
  }
}

export async function updateTenant(tenantId: string, payload: Partial<Tenant>): Promise<Tenant> {
  try {
    const { data } = await apiClient.patch<unknown>(`/tenants/${tenantId}`, toTenantUpdateRequest(payload));
    return fromTenantResponse(data);
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
    const { data } = await apiClient.post<unknown>(`/tenants/${tenantId}/regenerate-api-key`);
    return fromTenantResponse(data);
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const apiKey = `mk_live_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
    return updateTenant(tenantId, { apiKey });
  }
}

export async function testExtraction(tenantId: string, payload: TestExtractionRequest): Promise<TestExtractionResponse> {
  try {
    const { data } = await apiClient.post<TestExtractionResponse>(`/admin/tenants/${tenantId}/ai-settings/test-extraction`, payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return buildMockExtractionResponse(payload.message);
  }
}

function buildMockExtractionResponse(message: string): TestExtractionResponse {
  const lowerMessage = message.toLowerCase();
  const email = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = message.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/)?.[0];
  const isAppointment = /\b(appointment|book|schedule|reserve|meeting|consultation)\b/.test(lowerMessage);
  const isOrder = /\b(order|buy|purchase|quantity|quote|invoice|deliver)\b/.test(lowerMessage);
  const intent = isAppointment ? "appointment_capture" : isOrder ? "order_capture" : "lead_capture";

  const leadData: Record<string, unknown> = {
    phone_or_email: email ?? phone ?? null,
    service_or_product_interest: extractInterest(message, intent)
  };

  const orderData: Record<string, unknown> = isOrder
    ? {
        product_or_service: extractInterest(message, intent),
        quantity_or_people_count: message.match(/\b\d+\b/)?.[0] ?? null,
        phone_or_email: email ?? phone ?? null
      }
    : {};

  const appointmentData: Record<string, unknown> = isAppointment
    ? {
        service_required: extractInterest(message, intent),
        preferred_date: extractDateHint(message),
        preferred_time: extractTimeHint(message),
        phone_or_email: email ?? phone ?? null
      }
    : {};

  const missingFields = [
    ...(!email && !phone ? ["phone_or_email"] : []),
    ...(isOrder && !orderData.quantity_or_people_count ? ["quantity_or_people_count"] : []),
    ...(isAppointment && !appointmentData.preferred_date ? ["preferred_date"] : []),
    ...(isAppointment && !appointmentData.preferred_time ? ["preferred_time"] : [])
  ];

  return {
    intent,
    leadData,
    orderData,
    appointmentData,
    missingFields,
    isMock: true
  };
}

function extractInterest(message: string, intent: string) {
  if (intent === "appointment_capture") return "appointment request";
  if (intent === "order_capture") return "order request";
  return message.length > 80 ? `${message.slice(0, 77)}...` : message;
}

function extractDateHint(message: string) {
  return message.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)?.[0] ?? null;
}

function extractTimeHint(message: string) {
  return message.match(/\b(?:[1-9]|1[0-2])(?::[0-5]\d)?\s?(?:am|pm)\b/i)?.[0] ?? null;
}
