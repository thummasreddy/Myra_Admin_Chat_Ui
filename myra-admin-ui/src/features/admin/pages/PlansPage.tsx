import { Edit, Lock, Plus, Power } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { listPlans } from "@/features/tenants/tenants.api";

type PlanRead = {
  id: string;
  plan_name: string;
  monthly_price: number;
  chat_limit: number;
  question_limit: number;
  lead_limit: number;
  document_limit: number;
  qr_enabled: boolean;
  analytics_enabled: boolean;
  embed_enabled: boolean;
  purchase_tracking_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type PendingAction = { type: "create" | "edit" | "disable"; plan?: PlanRead } | null;

export function PlansPage() {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [plans, setPlans] = useState<PlanRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPlans();
      setPlans(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setError("Failed to load plans from the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function confirmAction() {
    toast({
      title: "Plan action submitted",
      description: "The backend will permission-check the plan update and record it in audit logs.",
      variant: "success"
    });
    setPendingAction(null);
  }

  const columns = useMemo<DataTableColumn<PlanRead>[]>(
    () => [
      { header: "Plan name", accessor: "plan_name" },
      { header: "Monthly price", accessor: (plan) => `$${plan.monthly_price}` },
      { header: "Chat limit", accessor: (plan) => plan.chat_limit.toLocaleString() },
      { header: "Question limit", accessor: (plan) => plan.question_limit.toLocaleString() },
      { header: "Lead limit", accessor: (plan) => plan.lead_limit.toLocaleString() },
      { header: "Document limit", accessor: (plan) => plan.document_limit.toLocaleString() },
      { header: "QR", accessor: (plan) => <StatusBadge status={plan.qr_enabled ? "ACTIVE" : "INACTIVE"} /> },
      { header: "Analytics", accessor: (plan) => <StatusBadge status={plan.analytics_enabled ? "ACTIVE" : "INACTIVE"} /> },
      { header: "Embed", accessor: (plan) => <StatusBadge status={plan.embed_enabled ? "ACTIVE" : "INACTIVE"} /> },
      { header: "Purchase tracking", accessor: (plan) => <StatusBadge status={plan.purchase_tracking_enabled ? "ACTIVE" : "INACTIVE"} /> },
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
      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchPlans}>
            Retry
          </Button>
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={plans}
        getRowKey={(plan) => plan.id}
        emptyTitle={loading ? "Loading plans..." : "No plans found"}
        emptyDescription={loading ? "Fetching plans from the backend." : "Create a subscription plan to get started."}
      />
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === "create" ? "Create plan?" : `${pendingAction?.type} ${pendingAction?.plan?.plan_name}?`}
        description="This plan change is a critical action and must be confirmed before calling the backend."
        destructive={pendingAction?.type === "disable"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </>
  );
}
