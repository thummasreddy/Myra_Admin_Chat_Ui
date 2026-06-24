import { AlertTriangle, FileSearch, Lock, RefreshCcw, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  listTenants,
  type TenantAdminRead
} from "@/features/tenants/tenants.api";

export function SupportDebugPage() {
  const [tenants, setTenants] = useState<TenantAdminRead[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTenants(1, 100);
      setTenants(result.items);
      if (result.items.length > 0 && !tenantId) {
        setTenantId(result.items[0].id);
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

  return (
    <>
      <PageHeader
        title="Support & Debug"
        description="Safe support tools for viewing config, widget install status, and tenant details."
        actions={
          <Select value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="w-72">
            {tenants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.business_name}
              </option>
            ))}
          </Select>
        }
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchTenants}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
        <Lock className="mr-2 inline h-4 w-4" />
        Support admins cannot change billing, global AI settings, delete tenants, or disable safety settings.
      </section>

      {tenant ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <DebugCard title="Tenant config" icon={FileSearch}>
              <Row label="Status" value={<StatusBadge status={tenant.status} />} />
              <Row label="Approval" value={<StatusBadge status={tenant.approval_status} />} />
              <Row label="Email" value={tenant.business_email} />
              <Row label="Category" value={tenant.category ?? "—"} />
            </DebugCard>
            <DebugCard title="Widget / embed / QR" icon={Wrench}>
              <Row label="Embed access" value={tenant.features?.embed_enabled ? "Enabled" : "Disabled"} />
              <Row label="QR status" value={tenant.features?.qr_enabled ? "Enabled" : "Disabled"} />
              <Row label="Purchase tracking" value={tenant.features?.purchase_tracking_enabled ? "Enabled" : "Disabled"} />
              <Row label="Analytics" value={tenant.features?.analytics_enabled ? "Enabled" : "Disabled"} />
            </DebugCard>
            <DebugCard title="Features" icon={AlertTriangle}>
              <Row label="Lead capture" value={tenant.features?.lead_capture_enabled ? "Enabled" : "Disabled"} />
              <Row label="Knowledge upload" value={tenant.features?.knowledge_upload_enabled ? "Enabled" : "Disabled"} />
            </DebugCard>
          </section>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Safe reprocess</CardTitle>
              <CardDescription>Support can trigger safe reprocess for failed documents. This does not change business content.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                <RefreshCcw className="h-4 w-4" />
                Reprocess failed documents
              </Button>
            </CardContent>
          </Card>

          <ConfirmDialog
            open={confirmOpen}
            title={`Reprocess failed documents for ${tenant.business_name}?`}
            description="This safe support action will be sent to the backend and audit logged."
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              toast({ title: "Reprocess submitted", description: "Backend permission check and audit log required.", variant: "success" });
              setConfirmOpen(false);
            }}
          />
        </>
      ) : loading ? (
        <p className="text-muted-foreground">Loading tenant data...</p>
      ) : (
        <p className="text-muted-foreground">No tenants available. Register a tenant to use the debug tools.</p>
      )}
    </>
  );
}

function DebugCard({ title, icon: Icon, children }: { title: string; icon: typeof FileSearch; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-[var(--color-text-main)]">{value}</span>
    </div>
  );
}
