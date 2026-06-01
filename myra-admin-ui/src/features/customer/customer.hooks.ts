import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getTenant, listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";

export function useCustomerTenant() {
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const setSelectedTenantId = useAuthStore((state) => state.setSelectedTenantId);
  const user = useAuthStore((state) => state.user);
  const tenantsQuery = useQuery({ queryKey: ["tenants", "customer"], queryFn: () => listTenants() });
  const allowedTenants =
    user?.role === "TENANT_OWNER"
      ? (tenantsQuery.data ?? []).filter(
          (tenant) =>
            tenant.tenantId === selectedTenantId ||
            tenant.businessEmail === user.email ||
            tenant.supportEmail === user.email
        )
      : tenantsQuery.data ?? [];
  const tenantId = selectedTenantId && allowedTenants.some((tenant) => tenant.tenantId === selectedTenantId)
    ? selectedTenantId
    : allowedTenants[0]?.tenantId || "";

  const tenantQuery = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => getTenant(tenantId),
    enabled: Boolean(tenantId)
  });

  useEffect(() => {
    if (!selectedTenantId && tenantId) setSelectedTenantId(tenantId);
  }, [selectedTenantId, setSelectedTenantId, tenantId]);

  return { tenantId, tenantQuery, tenantsQuery, allowedTenants };
}

export function isEmbedReady(status?: string) {
  return status === "APPROVED" || status === "ACTIVE";
}
