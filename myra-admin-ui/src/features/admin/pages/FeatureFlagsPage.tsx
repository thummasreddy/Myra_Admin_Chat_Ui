import { Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { featureFlagKeys, platformTenants } from "@/features/admin/platformAdmin.data";

export function FeatureFlagsPage() {
  const [tenantId, setTenantId] = useState(platformTenants[0]?.id ?? "");
  const tenant = platformTenants.find((item) => item.id === tenantId) ?? platformTenants[0];
  const [flags, setFlags] = useState<Record<string, boolean>>(tenant?.featureFlags ?? {});
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleTenantChange(nextTenantId: string) {
    const nextTenant = platformTenants.find((item) => item.id === nextTenantId);
    setTenantId(nextTenantId);
    setFlags(nextTenant?.featureFlags ?? {});
  }

  return (
    <>
      <PageHeader
        title="Feature Flags"
        description="Internal per-tenant toggles. This page is never exposed to tenant admins."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Tenant toggles</CardTitle>
            <Select value={tenantId} onChange={(event) => handleTenantChange(event.target.value)} className="sm:w-72">
              {platformTenants.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <Lock className="mr-2 inline h-4 w-4" />
            Every save must call a backend permission-checked API and be audit logged.
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureFlagKeys.map((flag) => (
              <label key={flag} className="flex items-center gap-2 rounded-md border bg-[var(--color-bg-muted)] p-3 text-sm font-medium">
                <Checkbox checked={Boolean(flags[flag])} onChange={(event) => setFlags((current) => ({ ...current, [flag]: event.currentTarget.checked }))} />
                {flag}
              </label>
            ))}
          </div>
          <Button onClick={() => setConfirmOpen(true)}>Save feature flags</Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={`Save feature flags for ${tenant?.name}?`}
        description="Feature flag changes can affect customer-facing widget behavior and require confirmation."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast({ title: "Feature flags submitted", description: "Backend permission check and audit logging required.", variant: "success" });
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
