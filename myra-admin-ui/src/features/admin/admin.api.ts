import { createApiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/constants";
import type { ApprovalTenant, AuditEntry, PlatformPlan, PlatformTenant, PlatformTenantStatus } from "./admin.types";

type BackendTenant = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  website_url?: string | null;
  assistant_name?: string;
  assistant_intro?: string | null;
  brand_color?: string;
  system_prompt?: string;
  allowed_topics?: string | null;
  fallback_message?: string;
  response_style?: string;
  suggested_prompts?: string | null;
  enable_web_search?: boolean;
  enable_lead_capture?: boolean;
  enable_suggested_prompts?: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

const client = createApiClient(API_BASE_URL);

function mapStatus(status: string): PlatformTenantStatus {
  const upper = status.toUpperCase();
  if (upper === "ACTIVE") return "ACTIVE";
  if (upper === "SUSPENDED" || upper === "INACTIVE") return "SUSPENDED";
  if (upper === "REJECTED") return "REJECTED";
  if (upper === "PENDING" || upper === "PENDING_APPROVAL") return "PENDING_APPROVAL";
  return "ACTIVE";
}

function mapTenant(t: BackendTenant): PlatformTenant {
  return {
    id: t.tenant_id,
    name: t.tenant_name,
    category: "",
    website: t.website_url ?? "",
    ownerName: "",
    ownerEmail: "",
    plan: "",
    status: mapStatus(t.status),
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
      lead_capture_enabled: t.enable_lead_capture ?? true,
      qr_enabled: false,
      knowledge_upload_enabled: false,
      analytics_enabled: false,
      embed_enabled: false,
      purchase_tracking_enabled: false,
    },
    notes: "",
  };
}

export async function fetchTenants(): Promise<PlatformTenant[]> {
  const { data } = await client.get<BackendTenant[]>("/tenants");
  return data.map(mapTenant);
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
