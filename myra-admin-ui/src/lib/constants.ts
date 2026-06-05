import { appConfig } from "@/lib/config";

export const API_BASE_URL = appConfig.VITE_API_BASE_URL;

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
