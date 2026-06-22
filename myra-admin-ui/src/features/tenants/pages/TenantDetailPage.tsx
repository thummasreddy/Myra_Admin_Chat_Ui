import { AlertTriangle, Flag, NotebookPen, PauseCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getTenant,
  approveTenant,
  suspendTenant,
  reactivateTenant,
  updateTenantFeatures,
  type TenantAdminRead
} from "@/features/tenants/tenants.api";
import { formatDate } from "@/lib/utils";

const FEATURE_FLAG_KEYS = [
  "lead_capture_enabled",
  "qr_enabled",
  "knowledge_upload_enabled",
  "analytics_enabled",
  "embed_enabled",
  "purchase_tracking_enabled"
];

type PendingAction = "approval status" | "suspension" | "feature flags" | "internal notes" | null;

export function TenantDetailPage() {
  const { tenantId = "" } = useParams();
  const [tenant, setTenant] = useState<TenantAdminRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [supportMode, setSupportMode] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTenant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTenant(tenantId);
      setTenant(data);
      setFlags(data.features ?? {});
    } catch {
      setError("Failed to load tenant details. The tenant may not exist or you may lack permission.");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading tenant details...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return <ErrorState title="Tenant not found" description={error ?? "The tenant record could not be loaded."} />;
  }

  async function confirmAction() {
    if (!pendingAction || !tenant) return;
    setActionLoading(true);
    try {
      if (pendingAction === "approval status") {
        await approveTenant(tenant.id);
      } else if (pendingAction === "suspension") {
        if (tenant.status === "SUSPENDED") {
          await reactivateTenant(tenant.id);
        } else {
          await suspendTenant(tenant.id);
        }
      } else if (pendingAction === "feature flags") {
        await updateTenantFeatures(tenant.id, flags);
      }

      toast({
        title: "Tenant updated",
        description: `${pendingAction} for ${tenant.business_name} was successful.`,
        variant: "success"
      });
      setPendingAction(null);
      fetchTenant();
    } catch {
      toast({
        title: "Update failed",
        description: `Could not update ${tenant.business_name}. Please try again.`,
        variant: "error"
      });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title={tenant.business_name}
        description="Tenant record: business profile, status, feature flags, and admin actions."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/tenants">Back to tenants</Link>
            </Button>
            <Button variant="outline" onClick={() => setPendingAction("approval status")}>
              <ShieldCheck className="h-4 w-4" />
              Update approval
            </Button>
            <Button variant="outline" onClick={() => setPendingAction("suspension")}>
              <PauseCircle className="h-4 w-4" />
              {tenant.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
            </Button>
          </>
        }
      />

      <section className="mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
          <div>
            <p className="font-semibold">Support-mode guardrail</p>
            <p className="mt-1 text-amber-100/80">Do not edit tenant business content unless support mode is enabled and the action is audit logged.</p>
          </div>
          <label className="ml-auto flex items-center gap-2 whitespace-nowrap text-xs font-medium">
            <Checkbox checked={supportMode} onChange={(event) => setSupportMode(event.currentTarget.checked)} />
            Support mode
          </label>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>View-only unless support mode is active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Detail label="Tenant ID" value={tenant.tenant_id} />
            <Detail label="Category" value={tenant.category ?? "—"} />
            <Detail label="Website" value={tenant.website_url} />
            <Detail label="Created" value={formatDate(tenant.created_at)} />
            <Detail label="Updated" value={formatDate(tenant.updated_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Detail label="Email" value={tenant.business_email} />
            <Detail label="Phone" value={tenant.phone ?? "—"} />
            <Detail label="Status" value={<StatusBadge status={tenant.status} />} />
            <Detail label="Approval" value={<StatusBadge status={tenant.approval_status} />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tenant.description ?? "No description provided."}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURE_FLAG_KEYS.map((flag) => (
                <label key={flag} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={Boolean(flags[flag])}
                    onChange={(event) => setFlags((current) => ({ ...current, [flag]: event.currentTarget.checked }))}
                  />
                  {flag.replace(/_/g, " ")}
                </label>
              ))}
            </div>
            <Button variant="outline" onClick={() => setPendingAction("feature flags")}>
              <Flag className="h-4 w-4" />
              Save feature flags
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Visible only to Myra admins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            <Button onClick={() => setPendingAction("internal notes")}>
              <NotebookPen className="h-4 w-4" />
              Save internal notes
            </Button>
          </CardContent>
        </Card>
      </section>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={`Confirm ${pendingAction ?? "tenant update"}?`}
        description="This tenant update will call a backend permission-checked API and write an audit log entry."
        confirmLabel={actionLoading ? "Processing..." : "Confirm"}
        destructive={pendingAction === "suspension" && tenant.status !== "SUSPENDED"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-[var(--color-text-main)]">{value}</span>
    </div>
  );
}
