import { Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  listTenants,
  updateTenantFeatures,
  type TenantAdminRead
} from "@/features/tenants/tenants.api";

const FEATURE_FLAG_KEYS = [
  "lead_capture_enabled",
  "qr_enabled",
  "knowledge_upload_enabled",
  "analytics_enabled",
  "embed_enabled",
  "purchase_tracking_enabled"
];

export function FeatureFlagsPage() {
  const [tenants, setTenants] = useState<TenantAdminRead[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTenants(1, 100);
      setTenants(result.items);
      if (result.items.length > 0 && !tenantId) {
        setTenantId(result.items[0].id);
        setFlags(result.items[0].features ?? {});
      }
    } catch {
      setError("Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const tenant = tenants.find((t) => t.id === tenantId);

  function handleTenantChange(nextTenantId: string) {
    const nextTenant = tenants.find((t) => t.id === nextTenantId);
    setTenantId(nextTenantId);
    setFlags(nextTenant?.features ?? {});
  }

  async function handleSave() {
    if (!tenantId) return;
    setSaving(true);
    try {
      await updateTenantFeatures(tenantId, flags);
      toast({ title: "Feature flags saved", description: "Changes have been applied and audit logged.", variant: "success" });
      setConfirmOpen(false);
      fetchTenants();
    } catch {
      toast({ title: "Save failed", description: "Could not save feature flags. Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Feature Flags"
        description="Internal per-tenant toggles. This page is never exposed to tenant admins."
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchTenants}>
            Retry
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Tenant toggles</CardTitle>
            <Select value={tenantId} onChange={(event) => handleTenantChange(event.target.value)} className="sm:w-72">
              {tenants.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.business_name}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <Lock className="mr-2 inline h-4 w-4" />
            Every save calls a backend permission-checked API and is audit logged.
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_FLAG_KEYS.map((flag) => (
              <label key={flag} className="flex items-center gap-2 rounded-md border bg-[var(--color-bg-muted)] p-3 text-sm font-medium">
                <Checkbox checked={Boolean(flags[flag])} onChange={(event) => setFlags((current) => ({ ...current, [flag]: event.currentTarget.checked }))} />
                {flag.replace(/_/g, " ")}
              </label>
            ))}
          </div>
          <Button onClick={() => setConfirmOpen(true)} disabled={loading}>Save feature flags</Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={`Save feature flags for ${tenant?.business_name ?? "tenant"}?`}
        description="Feature flag changes can affect customer-facing widget behavior and require confirmation."
        confirmLabel={saving ? "Saving..." : "Confirm"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSave}
      />
    </>
  );
}
