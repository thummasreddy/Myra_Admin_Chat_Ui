import { ShieldCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  listTenants,
  approveTenant,
  rejectTenant,
  type TenantAdminRead
} from "@/features/tenants/tenants.api";
import { formatDate } from "@/lib/utils";

type PendingAction = { action: "approve" | "reject"; tenant: TenantAdminRead } | null;

export function AdminApprovalsPage() {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [reason, setReason] = useState("");
  const [tenants, setTenants] = useState<TenantAdminRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTenants(1, 100);
      const pending = result.items.filter(
        (t) => t.approval_status === "PENDING_REVIEW" || t.status === "DRAFT"
      );
      setTenants(pending);
    } catch {
      setError("Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingTenants();
  }, [fetchPendingTenants]);

  async function confirmAction() {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      if (pendingAction.action === "approve") {
        await approveTenant(pendingAction.tenant.id);
      } else {
        await rejectTenant(pendingAction.tenant.id, reason || "Rejected by admin");
      }
      toast({
        title: "Approval action completed",
        description: `${pendingAction.action} for ${pendingAction.tenant.business_name} was successful.`,
        variant: "success"
      });
      setPendingAction(null);
      setReason("");
      fetchPendingTenants();
    } catch {
      toast({
        title: "Action failed",
        description: `Could not ${pendingAction.action} ${pendingAction.tenant.business_name}. Please try again.`,
        variant: "error"
      });
    } finally {
      setActionLoading(false);
    }
  }

  const columns = useMemo<DataTableColumn<TenantAdminRead>[]>(
    () => [
      { header: "Business name", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.business_name}</span> },
      { header: "Website", accessor: (tenant) => <span className="break-all text-sm">{tenant.website_url}</span> },
      { header: "Category", accessor: (tenant) => tenant.category ?? "—" },
      { header: "Email", accessor: "business_email" },
      { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.status} /> },
      { header: "Approval", accessor: (tenant) => <StatusBadge status={tenant.approval_status} /> },
      { header: "Created", accessor: (tenant) => formatDate(tenant.created_at) },
      {
        header: "Actions",
        accessor: (tenant) => (
          <div className="flex flex-wrap gap-1">
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ action: "approve", tenant })}>
              <ShieldCheck className="h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ action: "reject", tenant })}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )
      }
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Approval Queue"
        description="Review pending tenant registrations and approval decisions."
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchPendingTenants}>
            Retry
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={tenants}
        getRowKey={(tenant) => tenant.id}
        emptyTitle={loading ? "Loading approvals..." : "No pending approvals"}
        emptyDescription={loading ? "Fetching pending tenant registrations." : "New tenant registrations will appear here after submission."}
      />

      {pendingAction?.action === "reject" ? (
        <div className="mt-4 rounded-lg border bg-[var(--color-bg-card)] p-4">
          <label className="text-sm font-medium text-[var(--color-text-main)]">
            Reject reason
          </label>
          <Textarea
            className="mt-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Provide a reason for rejection (required for audit logs)"
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? `${pendingAction.action} ${pendingAction.tenant.business_name}?` : "Confirm approval action"}
        description="This action will call the backend admin API and record an audit log."
        confirmLabel={actionLoading ? "Processing..." : "Submit"}
        destructive={pendingAction?.action === "reject"}
        onCancel={() => {
          setPendingAction(null);
          setReason("");
        }}
        onConfirm={confirmAction}
      />
    </>
  );
}
