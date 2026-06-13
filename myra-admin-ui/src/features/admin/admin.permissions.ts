import type { AdminUser } from "@/features/auth/auth.types";

export function isMyraAdmin(user: AdminUser | null) {
  return user?.role === "MYRA_SUPER_ADMIN" || user?.role === "MYRA_SUPPORT_ADMIN";
}

export function isSuperAdmin(user: AdminUser | null) {
  return user?.role === "MYRA_SUPER_ADMIN";
}

export function canApproveTenant(user: AdminUser | null) {
  return isMyraAdmin(user);
}

export function canManagePlans(user: AdminUser | null) {
  return isSuperAdmin(user);
}

export function canManageGlobalSettings(user: AdminUser | null) {
  return isSuperAdmin(user);
}

export function canUseSupportTools(user: AdminUser | null) {
  return isMyraAdmin(user);
}
