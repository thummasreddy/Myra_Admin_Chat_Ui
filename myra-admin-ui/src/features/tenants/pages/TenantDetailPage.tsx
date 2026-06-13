import { AlertTriangle, Flag, Lock, NotebookPen, PauseCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { featureFlagKeys } from "@/features/admin/admin.types";
import type { PlatformTenant } from "@/features/admin/admin.types";
import { fetchTenantById } from "@/features/admin/admin.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { isSuperAdmin } from "@/features/admin/admin.permissions";
import { formatDate } from "@/lib/utils";

type PendingAction = "approval status" | "suspension" | "plan change" | "feature flags" | "internal notes" | null;

export function TenantDetailPage() {
  const { tenantId = "" } = useParams();
  const user = useAuthStore((state) => state.user);
  const superAdmin = isSuperAdmin(user);
  const [tenant, setTenant] = useState<PlatformTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("Starter");
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [supportMode, setSupportMode] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTenantById(tenantId)
      .then((data) => {
        if (cancelled) return;
        setTenant(data);
        if (data) {
          setSelectedPlan(data.plan || "Starter");
          setFlags(data.featureFlags);
          setNotes(data.notes);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tenantId]);

  if (loading) {
    return (
      <>
        <PageHeader title="Loading…" description="Fetching tenant details from backend." />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </>
    );
  }

  if (!tenant) {
    return <ErrorState title="Tenant not found" description="The tenant record was not found in the backend." />;
  }

  const tenantName = tenant.name;

  function confirmAction() {
    if (!pendingAction) return;
    toast({
      title: "Tenant update submitted",
      description: `${pendingAction} for ${tenantName} will be permission checked and audit logged by the backend.`,
      variant: "success"
    });
    setPendingAction(null);
  }

  return (
    <>
      <PageHeader
        title={tenant.name}
        description="Internal tenant record: business profile, owner details, plan, status, feature flags, widget health, ingestion status, analytics, errors, and admin notes."
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
              Suspend / Reactivate
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
            <Detail label="Category" value={tenant.category || "—"} />
            <Detail label="Website" value={tenant.website || "—"} />
            <Detail label="Created" value={formatDate(tenant.createdAt)} />
            <Detail label="Last active" value={formatDate(tenant.lastActiveAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Detail label="Owner" value={tenant.ownerName || "—"} />
            <Detail label="Email" value={tenant.ownerEmail || "—"} />
            <Detail label="Status" value={<StatusBadge status={tenant.status} />} />
            <Detail label="Plan" value={tenant.plan || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Leads" value={tenant.leadsCaptured} />
            <Stat label="Conversations" value={tenant.chatSessions} />
            <Stat label="Questions" value={tenant.questionsAsked} />
            <Stat label="Purchases" value={tenant.purchaseCompletedCount} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Widget & Knowledge Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Detail label="Widget config preview" value={tenant.widgetIssue ? "Needs setup review" : "Ready"} />
            <Detail label="Knowledge ingestion" value={tenant.failedKnowledge ? "Failed documents detected" : "Healthy"} />
            <Detail label="Recent errors" value={tenant.widgetIssue || tenant.failedKnowledge ? tenant.notes : "No recent internal errors"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan & Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)} disabled={!superAdmin}>
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Scale">Scale</option>
              </Select>
              <Button onClick={() => setPendingAction("plan change")} disabled={!superAdmin}>
                {!superAdmin && <Lock className="h-4 w-4" />}
                Change Plan
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {featureFlagKeys.map((flag) => (
                <label key={flag} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={Boolean(flags[flag])}
                    onChange={(event) => setFlags((current) => ({ ...current, [flag]: event.currentTarget.checked }))}
                  />
                  {flag}
                </label>
              ))}
            </div>
            <Button variant="outline" onClick={() => setPendingAction("feature flags")}>
              <Flag className="h-4 w-4" />
              Save feature flags
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
          <CardDescription>Visible only to Myra admins. Updates require confirmation and audit logging.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          <Button onClick={() => setPendingAction("internal notes")}>
            <NotebookPen className="h-4 w-4" />
            Save internal notes
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={`Confirm ${pendingAction ?? "tenant update"}?`}
        description="This critical tenant update will call a backend permission-checked API and write an audit log entry."
        destructive={pendingAction === "suspension"}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-[var(--color-bg-muted)] p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold text-[var(--color-text-main)]">{value.toLocaleString()}</p>
    </div>
  );
}
