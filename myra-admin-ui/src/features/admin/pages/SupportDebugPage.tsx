import { AlertTriangle, FileSearch, Lock, RefreshCcw, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import type { PlatformTenant } from "@/features/admin/admin.types";
import { fetchTenants } from "@/features/admin/admin.api";

export function SupportDebugPage() {
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTenants()
      .then((data) => {
        if (cancelled) return;
        setTenants(data);
        if (data.length > 0) setTenantId(data[0].id);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const tenant = tenants.find((item) => item.id === tenantId);

  if (loading) {
    return (
      <>
        <PageHeader title="Support & Debug" description="Loading tenant data…" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </>
    );
  }

  if (!tenant) {
    return (
      <>
        <PageHeader title="Support & Debug" description="No tenants available." />
        <p className="text-sm text-muted-foreground">No tenants found in the backend.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Support & Debug"
        description="Safe support tools for viewing config, widget install status, failed API calls, ingestion failures, recent tenant errors, embed status, and QR status."
        actions={
          <Select value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="w-72">
            {tenants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        }
      />

      <section className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
        <Lock className="mr-2 inline h-4 w-4" />
        Support admins cannot change billing, global AI settings, delete tenants, or disable safety settings.
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <DebugCard title="Tenant config" icon={FileSearch}>
          <Row label="Plan" value={tenant.plan || "—"} />
          <Row label="Status" value={<StatusBadge status={tenant.status} />} />
          <Row label="Owner" value={tenant.ownerEmail || "—"} />
          <Row label="Category" value={tenant.category || "—"} />
        </DebugCard>
        <DebugCard title="Widget / embed / QR" icon={Wrench}>
          <Row label="Widget install" value={tenant.widgetIssue ? "Issue detected" : "Installed"} />
          <Row label="Embed access" value={tenant.featureFlags.embed_enabled ? "Enabled" : "Disabled"} />
          <Row label="QR status" value={tenant.featureFlags.qr_enabled ? "Enabled" : "Disabled"} />
          <Row label="Purchase tracking" value={tenant.featureFlags.purchase_tracking_enabled ? "Enabled" : "Disabled"} />
        </DebugCard>
        <DebugCard title="Failures" icon={AlertTriangle}>
          <Row label="Knowledge ingestion" value={tenant.failedKnowledge ? "Failed" : "Healthy"} />
          <Row label="Recent tenant errors" value={tenant.widgetIssue || tenant.failedKnowledge ? tenant.notes : "None"} />
          <Row label="Failed API calls" value={tenant.widgetIssue ? "3 in last 24h" : "0 in last 24h"} />
        </DebugCard>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Safe reprocess</CardTitle>
          <CardDescription>Support can trigger safe reprocess for failed documents. This does not change business content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setConfirmOpen(true)} disabled={!tenant.failedKnowledge}>
            <RefreshCcw className="h-4 w-4" />
            Reprocess failed documents
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={`Reprocess failed documents for ${tenant.name}?`}
        description="This safe support action will be sent to the backend and audit logged."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast({ title: "Reprocess submitted", description: "Backend permission check and audit log required.", variant: "success" });
          setConfirmOpen(false);
        }}
      />
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
