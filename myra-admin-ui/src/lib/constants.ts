import { appConfig } from "@/lib/config";

function adminGatewayUrl(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/v1/admin")) return normalized;
  if (normalized.endsWith("/api/v1")) return `${normalized}/admin`;
  return `${normalized}/api/v1/admin`;
}

export const API_BASE_URL = adminGatewayUrl(appConfig.VITE_API_BASE_URL);

export const TENANT_STATUSES = [
  "DRAFT",
  "PAYMENT_PENDING",
  "PAYMENT_COMPLETED",
  "PENDING_ADMIN_APPROVAL",
  "APPROVED",
  "ACTIVE",
  "INACTIVE",
  "REJECTED",
  "SUSPENDED"
] as const;

export const CHAT_POSITIONS = ["bottom-right", "bottom-left"] as const;

export const RESPONSE_STYLES = ["PROFESSIONAL", "FRIENDLY", "CASUAL", "FORMAL"] as const;
