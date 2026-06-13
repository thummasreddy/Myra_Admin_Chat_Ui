import { Eye, Flag, Lock, PauseCircle, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
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
  platformTenants,
  type PlatformTenant,
  type PlatformTenantStatus
} from "@/features/admin/platformAdmin.data";
import { useAuthStore } from "@/features/auth/auth.store";
import { isSuperAdmin } from "@/features/admin/admin.permissions";
import { formatDate } from "@/lib/utils";

type PendingAction =
  | { type: "approve" | "reject" | "suspend" | "reactivate" | "plan" | "flags"; tenant: PlatformTenant }
  | null;

export function TenantListPage() {
  const user = useAuthStore((state) => state.user);
  const superAdmin = isSuperAdmin(user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PlatformTenantStatus | "ALL">("ALL");
  const [plan, setPlan] = useState<PlatformTenant["plan"] | "ALL">("ALL");
  const [category, setCategory] = useState("ALL");
  const [createdDate, setCreatedDate] = useState("");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const categories = useMemo(() => Array.from(new Set(platformTenants.map((tenant) => tenant.category))), []);
  const filteredTenants = useMemo(() => {
    const term = search.trim().toLowerCase();
    return platformTenants.filter((tenant) => {
      const matchesSearch =
        !term ||
        tenant.name.toLowerCase().includes(term) ||
        tenant.website.toLowerCase().includes(term) ||
        tenant.ownerEmail.toLowerCase().includes(term);
      const matchesDate = !createdDate || tenant.createdAt.startsWith(createdDate);
      return (
        matchesSearch &&
        (status === "ALL" || tenant.status === status) &&
        (plan === "ALL" || tenant.plan === plan) &&
        (category === "ALL" || tenant.category === category) &&
        matchesDate
      );
    });
  }, [category, createdDate, plan, search, status]);

  const pageSize = 10;
  const pageCount = Math.max(Math.ceil(filteredTenants.length / pageSize), 1);
  const visibleTenants = filteredTenants.slice((page - 1) * pageSize, page * pageSize);

  function confirmAction() {
    if (!pendingAction) return;
    toast({
      title: "Action submitted",
      description: `${pendingAction.type} request for ${pendingAction.tenant.name} will be permission checked by the backend.`,
      variant: "success"
    });
    setPendingAction(null);
  }

  const columns = useMemo<DataTableColumn<PlatformTenant>[]>(
    () => [
      { header: "Tenant name", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.name}</span> },
      { header: "Category", accessor: "category" },
      { header: "Website", accessor: (tenant) => <span className="break-all text-sm">{tenant.website}</span> },
      { header: "Owner email", accessor: "ownerEmail" },
      { header: "Plan", accessor: "plan" },
      { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.status} /> },
      { header: "Created", accessor: (tenant) => formatDate(tenant.createdAt) },
      { header: "Last active", accessor: (tenant) => formatDate(tenant.lastActiveAt) },
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

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, website, owner email" className="md:col-span-2" />
        <Select value={status} onChange={(event) => setStatus(event.target.value as PlatformTenantStatus | "ALL")}>
          <option value="ALL">All statuses</option>
          <option value="PENDING_APPROVAL">Pending approval</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </Select>
        <Select value={plan} onChange={(event) => setPlan(event.target.value as PlatformTenant["plan"] | "ALL")}>
          <option value="ALL">All plans</option>
          <option value="Starter">Starter</option>
          <option value="Growth">Growth</option>
          <option value="Scale">Scale</option>
        </Select>
        <Input type="date" value={createdDate} onChange={(event) => setCreatedDate(event.target.value)} aria-label="Created date" />
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="ALL">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={visibleTenants}
        getRowKey={(tenant) => tenant.id}
        emptyTitle="No tenants found"
        emptyDescription="Adjust search or filters to review tenant records."
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Button variant="outline" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}>
          Next
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? `${pendingAction.type.replace("-", " ")} ${pendingAction.tenant.name}?` : "Confirm action"}
        description="This critical action will be sent to a backend permission-checked admin API and recorded in audit logs."
        confirmLabel="Confirm"
        destructive={pendingAction?.type === "reject" || pendingAction?.type === "suspend"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </>
  );
}
