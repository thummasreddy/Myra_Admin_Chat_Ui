import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { listTenants } from "@/features/tenants/tenant.api";
import type { Tenant } from "@/features/tenants/tenant.types";
import { formatDate } from "@/lib/utils";

export function TenantReviewIndexPage() {
  const tenantsQuery = useQuery({ queryKey: ["tenants", "review-index"], queryFn: () => listTenants() });

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      {
        header: "Business",
        accessor: (tenant) => (
          <div>
            <p className="font-medium text-[var(--color-text-main)]">{tenant.tenantName}</p>
            <p className="text-sm text-muted-foreground">{tenant.businessEmail ?? tenant.supportEmail}</p>
          </div>
        )
      },
      { header: "Website", accessor: (tenant) => <span className="break-all text-sm">{tenant.websiteUrl}</span> },
      { header: "Payment", accessor: (tenant) => <StatusBadge status={tenant.paymentStatus ?? "PENDING"} /> },
      { header: "Documents", accessor: (tenant) => <StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} /> },
      { header: "Approval", accessor: (tenant) => <StatusBadge status={tenant.approvalStatus ?? "NOT_SUBMITTED"} /> },
      { header: "Updated", accessor: (tenant) => formatDate(tenant.updatedAt) },
      {
        header: "Actions",
        className: "text-right",
        accessor: (tenant) => (
          <Button asChild variant="outline" size="sm">
            <Link to={`/tenant-review/${tenant.tenantId}`}>
              <Eye className="h-4 w-4" />
              Review
            </Link>
          </Button>
        )
      }
    ],
    []
  );

  return (
    <>
      <PageHeader title="Tenant Review" description="Open a tenant review workspace with business, billing, document, and approval details." />
      <DataTable
        columns={columns}
        data={tenantsQuery.data ?? []}
        getRowKey={(tenant) => tenant.tenantId}
        isLoading={tenantsQuery.isLoading}
        emptyTitle="No tenants available"
        emptyDescription="Registered businesses will appear here for admin and support review."
      />
    </>
  );
}
