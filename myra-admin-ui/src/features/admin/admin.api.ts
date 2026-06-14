import { createApiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/constants";
import type { ApprovalTenant, AuditEntry, PlatformPlan, PlatformTenant, PlatformTenantStatus } from "./admin.types";

type BackendTenant = {
  id: string;
  tenant_id: string;
  business_name: string;
  website_url?: string | null;
  business_email?: string;
  phone?: string | null;
  category?: string | null;
  description?: string | null;
  status: string;
  approval_status?: string;
  plan_id?: string | null;
  features?: {
    lead_capture_enabled?: boolean;
    qr_enabled?: boolean;
    knowledge_upload_enabled?: boolean;
    analytics_enabled?: boolean;
    embed_enabled?: boolean;
    purchase_tracking_enabled?: boolean;
  };
  created_at: string;
  updated_at: string;
};

type PaginatedResponse = {
  total: number;
  page: number;
  size: number;
  items: BackendTenant[];
};

const client = createApiClient(API_BASE_URL);

function mapStatus(status: string): PlatformTenantStatus {
  const upper = status.toUpperCase();
  if (upper === "ACTIVE" || upper === "APPROVED") return "ACTIVE";
  if (upper === "SUSPENDED" || upper === "INACTIVE") return "SUSPENDED";
  if (upper === "REJECTED") return "REJECTED";
  if (upper === "PENDING" || upper === "PENDING_APPROVAL" || upper === "PAYMENT_PENDING" || upper === "NOT_SUBMITTED") return "PENDING_APPROVAL";
  return "PENDING_APPROVAL";
}

function mapTenant(t: BackendTenant): PlatformTenant {
  return {
    id: t.tenant_id,
    name: t.business_name,
    category: t.category ?? "",
    website: t.website_url ?? "",
    ownerName: "",
    ownerEmail: t.business_email ?? "",
    plan: "",
    status: mapStatus(t.approval_status ?? t.status),
    createdAt: t.created_at,
    lastActiveAt: t.updated_at,
    visitors: 0,
    chatSessions: 0,
    questionsAsked: 0,
    answersGiven: 0,
    leadsCaptured: 0,
    purchaseIntentCount: 0,
    purchaseCompletedCount: 0,
    failedKnowledge: false,
    widgetIssue: false,
    featureFlags: {
      lead_capture_enabled: t.features?.lead_capture_enabled ?? true,
      qr_enabled: t.features?.qr_enabled ?? false,
      knowledge_upload_enabled: t.features?.knowledge_upload_enabled ?? false,
      analytics_enabled: t.features?.analytics_enabled ?? false,
      embed_enabled: t.features?.embed_enabled ?? false,
      purchase_tracking_enabled: t.features?.purchase_tracking_enabled ?? false,
    },
    notes: "",
  };
}

export async function fetchTenants(): Promise<PlatformTenant[]> {
  const { data } = await client.get<PaginatedResponse | BackendTenant[]>("/tenants");
  if (Array.isArray(data)) return data.map(mapTenant);
  return (data as PaginatedResponse).items.map(mapTenant);
}

export async function fetchTenantById(tenantId: string): Promise<PlatformTenant | null> {
  try {
    const { data } = await client.get<BackendTenant>(`/tenants/${tenantId}`);
    return mapTenant(data);
  } catch {
    return null;
  }
}

export async function fetchApprovalQueue(): Promise<ApprovalTenant[]> {
  const tenants = await fetchTenants();
  return tenants
    .filter((t) => t.status === "PENDING_APPROVAL")
    .map((t) => ({
      id: t.id,
      businessName: t.name,
      website: t.website,
      category: t.category,
      ownerContact: t.ownerName ? `${t.ownerName}, ${t.ownerEmail}` : t.ownerEmail,
      uploadedDocuments: [],
      requestedPlan: t.plan || "Starter",
      registrationDate: t.createdAt,
    }));
}

export async function fetchAuditEntries(): Promise<AuditEntry[]> {
  return [];
}

export async function fetchPlans(): Promise<PlatformPlan[]> {
  return [];
}
