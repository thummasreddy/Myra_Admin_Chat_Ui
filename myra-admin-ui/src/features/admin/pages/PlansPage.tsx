import { Edit, Lock, Plus, Power } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { platformPlans, type PlatformPlan } from "@/features/admin/platformAdmin.data";

type PendingAction = { type: "create" | "edit" | "disable"; plan?: PlatformPlan } | null;

export function PlansPage() {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  function confirmAction() {
    toast({
      title: "Plan action submitted",
      description: "The backend will permission-check the plan update and record it in audit logs.",
      variant: "success"
    });
    setPendingAction(null);
  }

  const columns = useMemo<DataTableColumn<PlatformPlan>[]>(
    () => [
      { header: "Plan name", accessor: "name" },
      { header: "Monthly price", accessor: (plan) => `$${plan.monthlyPrice}` },
      { header: "Chat/session limits", accessor: (plan) => plan.chatLimit.toLocaleString() },
      { header: "Question limits", accessor: (plan) => plan.questionLimit.toLocaleString() },
      { header: "Lead limits", accessor: (plan) => plan.leadLimit.toLocaleString() },
      { header: "Document limits", accessor: (plan) => plan.documentLimit.toLocaleString() },
      { header: "QR", accessor: (plan) => yesNo(plan.qrAccess) },
      { header: "Analytics", accessor: (plan) => yesNo(plan.analyticsAccess) },
      { header: "Embed", accessor: (plan) => yesNo(plan.embedAccess) },
      { header: "Purchase tracking", accessor: (plan) => yesNo(plan.purchaseTrackingAccess) },
      { header: "Status", accessor: (plan) => <StatusBadge status={plan.enabled ? "ACTIVE" : "INACTIVE"} /> },
      {
        header: "Actions",
        accessor: (plan) => (
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "edit", plan })}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "disable", plan })}>
              <Power className="h-4 w-4" />
              Disable
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
        title="Plans & Limits"
        description="MYRA_SUPER_ADMIN only: manage billing plans, usage limits, and access to QR, analytics, embed, and purchase tracking."
        actions={
          <Button onClick={() => setPendingAction({ type: "create" })}>
            <Plus className="h-4 w-4" />
            Create plan
          </Button>
        }
      />
      <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        <Lock className="mr-2 inline h-4 w-4" />
        This route is hidden from MYRA_SUPPORT_ADMIN and protected by the router.
      </div>
      <DataTable columns={columns} data={platformPlans} getRowKey={(plan) => plan.id} />
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === "create" ? "Create plan?" : `${pendingAction?.type} ${pendingAction?.plan?.name}?`}
        description="This plan change is a critical action and must be confirmed before calling the backend."
        destructive={pendingAction?.type === "disable"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </>
  );
}

function yesNo(value: boolean) {
  return <StatusBadge status={value ? "ACTIVE" : "INACTIVE"} />;
}
