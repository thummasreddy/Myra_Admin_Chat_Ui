import { Eye, Flag, Lock, PauseCircle, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  listTenants,
  approveTenant,
  rejectTenant,
  suspendTenant,
  reactivateTenant,
  type TenantAdminRead,
  type TenantAdminStatus
} from "@/features/tenants/tenants.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { isSuperAdmin } from "@/features/admin/admin.permissions";
import { formatDate } from "@/lib/utils";

type ActionType = "approve" | "reject" | "suspend" | "reactivate" | "plan" | "flags";
type PendingAction = { type: ActionType; tenant: TenantAdminRead } | null;

export function TenantListPage() {
  const user = useAuthStore((state) => state.user);
  const superAdmin = isSuperAdmin(user);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantAdminStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [tenants, setTenants] = useState<TenantAdminRead[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pageSize = 20;

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTenants(page, pageSize);
      setTenants(result.items);
      setTotalPages(Math.max(Math.ceil(result.total / pageSize), 1));
    } catch {
      setError("Failed to load tenants. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filteredTenants = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tenants.filter((tenant) => {
      const matchesSearch =
        !term ||
        tenant.business_name.toLowerCase().includes(term) ||
        tenant.website_url.toLowerCase().includes(term) ||
        tenant.business_email.toLowerCase().includes(term);
      return matchesSearch && (statusFilter === "ALL" || tenant.status === statusFilter);
    });
  }, [search, statusFilter, tenants]);

  async function confirmAction() {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const { type, tenant } = pendingAction;
      if (type === "approve") await approveTenant(tenant.id);
      else if (type === "reject") await rejectTenant(tenant.id, "Rejected by admin");
      else if (type === "suspend") await suspendTenant(tenant.id);
      else if (type === "reactivate") await reactivateTenant(tenant.id);

      toast({
        title: "Action completed",
        description: `${type} for ${tenant.business_name} was successful.`,
        variant: "success"
      });
      setPendingAction(null);
      fetchTenants();
    } catch {
      toast({
        title: "Action failed",
        description: `Could not ${pendingAction.type} ${pendingAction.tenant.business_name}. Please try again.`,
        variant: "error"
      });
    } finally {
      setActionLoading(false);
    }
  }

  const columns = useMemo<DataTableColumn<TenantAdminRead>[]>(
    () => [
      { header: "Tenant name", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.business_name}</span> },
      { header: "Category", accessor: (tenant) => tenant.category ?? "—" },
      { header: "Website", accessor: (tenant) => <span className="break-all text-sm">{tenant.website_url}</span> },
      { header: "Email", accessor: "business_email" },
      { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.status} /> },
      { header: "Approval", accessor: (tenant) => <StatusBadge status={tenant.approval_status} /> },
      { header: "Created", accessor: (tenant) => formatDate(tenant.created_at) },
      {
        header: "Actions",
        className: "min-w-80",
        accessor: (tenant) => (
          <div className="flex flex-wrap gap-1">
            <Button asChild variant="outline" size="sm">
              <Link to={`/tenants/${tenant.id}`}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "approve", tenant })}>
              <ShieldCheck className="h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "reject", tenant })}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "suspend", tenant })}>
              <PauseCircle className="h-4 w-4" />
              Suspend
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "reactivate", tenant })}>
              <RotateCcw className="h-4 w-4" />
              Reactivate
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "plan", tenant })} disabled={!superAdmin}>
              {!superAdmin && <Lock className="h-4 w-4" />}
              Change Plan
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: "flags", tenant })}>
              <Flag className="h-4 w-4" />
              Feature Flags
            </Button>
          </div>
        )
      }
    ],
    [superAdmin]
  );

  return (
    <>
      <PageHeader
        title="Tenant Management"
        description="Search, filter, approve, reject, suspend, reactivate, change plans, and manage feature flags for tenant accounts."
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, website, email" className="md:col-span-2" />
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TenantAdminStatus | "ALL")}>
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchTenants}>
            Retry
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={filteredTenants}
        getRowKey={(tenant) => tenant.id}
        emptyTitle={loading ? "Loading tenants..." : "No tenants found"}
        emptyDescription={loading ? "Fetching tenant data from the backend." : "Adjust search or filters to review tenant records."}
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(current + 1, totalPages))}>
          Next
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? `${pendingAction.type.replace("-", " ")} ${pendingAction.tenant.business_name}?` : "Confirm action"}
        description="This action will be sent to a backend permission-checked admin API and recorded in audit logs."
        confirmLabel={actionLoading ? "Processing..." : "Confirm"}
        destructive={pendingAction?.type === "reject" || pendingAction?.type === "suspend"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </>
  );
}
