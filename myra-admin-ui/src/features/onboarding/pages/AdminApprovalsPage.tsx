import { FileText, MessageSquare, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import type { ApprovalTenant } from "@/features/admin/admin.types";
import { fetchApprovalQueue } from "@/features/admin/admin.api";
import { formatDate } from "@/lib/utils";

type PendingAction = { action: "approve" | "reject" | "request more info" | "add internal note"; tenant: ApprovalTenant } | null;

export function AdminApprovalsPage() {
  const [queue, setQueue] = useState<ApprovalTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchApprovalQueue()
      .then((data) => { if (!cancelled) setQueue(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function confirmAction() {
    if (!pendingAction) return;
    toast({
      title: "Approval action submitted",
      description: `${pendingAction.action} for ${pendingAction.tenant.businessName} will be permission checked and audit logged.`,
      variant: "success"
    });
    setPendingAction(null);
    setReason("");
  }

  const columns = useMemo<DataTableColumn<ApprovalTenant>[]>(
    () => [
      { header: "Business name", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.businessName}</span> },
      { header: "Website", accessor: (tenant) => <span className="break-all text-sm">{tenant.website}</span> },
      { header: "Category", accessor: "category" },
      { header: "Owner contact", accessor: "ownerContact" },
      { header: "Documents", accessor: (tenant) => tenant.uploadedDocuments.join(", ") || "—" },
      { header: "Requested plan", accessor: "requestedPlan" },
      { header: "Registration date", accessor: (tenant) => formatDate(tenant.registrationDate) },
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
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ action: "request more info", tenant })}>
              <MessageSquare className="h-4 w-4" />
              More info
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ action: "add internal note", tenant })}>
              <FileText className="h-4 w-4" />
              Note
            </Button>
          </div>
        )
      }
    ],
    []
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Approval Queue" description="Loading pending tenant registrations…" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Approval Queue"
        description="Review pending tenant registrations, uploaded documents, requested plans, owner contacts, and approval decisions."
      />

      <DataTable
        columns={columns}
        data={queue}
        getRowKey={(tenant) => tenant.id}
        emptyTitle="No pending approvals"
        emptyDescription="New tenant registrations will appear here after submission."
      />

      {pendingAction ? (
        <div className="mt-4 rounded-lg border bg-[var(--color-bg-card)] p-4">
          <label className="text-sm font-medium text-[var(--color-text-main)]">
            {pendingAction.action === "reject" ? "Reject reason" : "Internal note"}
          </label>
          <Textarea
            className="mt-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add context for audit logs and tenant communication"
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? `${pendingAction.action} ${pendingAction.tenant.businessName}?` : "Confirm approval action"}
        description="This action will call a permission-checked backend API and record an audit log."
        confirmLabel="Submit"
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
