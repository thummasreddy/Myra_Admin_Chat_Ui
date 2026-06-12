import { API_BASE_URL } from "@/lib/constants";

export interface TenantPublicProfile {
  tenantId: string;
  businessName: string;
  businessDescription: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  supportEmail: string | null;
  websiteUrl: string | null;
  apiKey: string;
}

export class PublicTenantNotFoundError extends Error {
  constructor(tenantId: string) {
    super(`Tenant ${tenantId} was not found.`);
    this.name = "PublicTenantNotFoundError";
  }
}

export async function fetchTenantPublicProfile(tenantId: string): Promise<TenantPublicProfile> {
  const response = await fetch(`${API_BASE_URL}/public/tenants/${encodeURIComponent(tenantId)}/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (response.status === 404) throw new PublicTenantNotFoundError(tenantId);
  if (!response.ok) throw new Error("Unable to load tenant profile.");

  return unwrapProfile(await response.json());
}

function unwrapProfile(payload: unknown): TenantPublicProfile {
  if (!payload || typeof payload !== "object") return payload as TenantPublicProfile;
  const record = payload as Record<string, unknown>;
  if (typeof record.success === "boolean" && record.data && typeof record.data === "object") {
    return record.data as TenantPublicProfile;
  }
  return payload as TenantPublicProfile;
}
