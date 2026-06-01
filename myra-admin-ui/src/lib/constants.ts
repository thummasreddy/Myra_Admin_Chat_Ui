export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const TENANT_STATUSES = ["PAYMENT_PENDING", "PENDING_ADMIN_APPROVAL", "APPROVED", "ACTIVE", "INACTIVE", "REJECTED"] as const;

export const CHAT_POSITIONS = ["bottom-right", "bottom-left"] as const;

export const RESPONSE_STYLES = ["friendly", "professional", "concise", "sales"] as const;
