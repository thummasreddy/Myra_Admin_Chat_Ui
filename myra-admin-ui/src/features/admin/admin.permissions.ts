import type { AdminUser } from "@/features/auth/auth.types";

export function canApproveTenant(user: AdminUser | null) {
  return user?.role === "ADMIN";
}

export function canRegenerateEmbedCode(user: AdminUser | null) {
  return user?.role === "ADMIN";
}

export function canUpdateDocumentStatus(user: AdminUser | null) {
  return user?.role === "ADMIN" || user?.role === "SUPPORT_ENGINEER";
}

export function canViewBilling(user: AdminUser | null) {
  return user?.role === "ADMIN" || user?.role === "BILLING_ADMIN";
}
