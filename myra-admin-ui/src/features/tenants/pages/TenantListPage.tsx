import { useQuery } from "@tanstack/react-query";
import { Eye, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { listTenants } from "@/features/tenants/tenant.api";
import type { Tenant, TenantStatus } from "@/features/tenants/tenant.types";
import { formatDate } from "@/lib/utils";

export function TenantListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TenantStatus | "ALL">("ALL");
  const tenantsQuery = useQuery({
    queryKey: ["tenants", { search, status }],
    queryFn: () => listTenants({ search, status })
  });

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      {
        header: "Tenant",
        accessor: (tenant) => (
          <div>
            <p className="font-medium text-slate-950">{tenant.tenantName}</p>
            <p className="text-sm text-muted-foreground">{tenant.websiteUrl}</p>
          </div>
        )
      },
      { header: "Industry", accessor: "industry" },
      { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.status} /> },
      { header: "Updated", accessor: (tenant) => formatDate(tenant.updatedAt) },
      {
        header: "Actions",
        className: "text-right",
        accessor: (tenant) => (
          <Button asChild variant="outline" size="sm">
            <Link to={`/tenants/${tenant.tenantId}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
        )
      }
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Create, search, filter, and inspect tenant chatbot configurations."
        actions={
          <Button asChild>
            <Link to="/tenants/new">
              <Plus className="h-4 w-4" />
              Create Tenant
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tenant by name" />
        <Select value={status} onChange={(event) => setStatus(event.target.value as TenantStatus | "ALL")}>
          <option value="ALL">All statuses</option>
          <option value="PAYMENT_PENDING">Payment pending</option>
          <option value="PENDING_ADMIN_APPROVAL">Pending admin approval</option>
          <option value="APPROVED">Approved</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={tenantsQuery.data ?? []}
        getRowKey={(tenant) => tenant.tenantId}
        isLoading={tenantsQuery.isLoading}
        emptyTitle="No tenants found"
        emptyDescription="Create your first tenant to publish a Myra chatbot widget."
      />
    </>
  );
}
