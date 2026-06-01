import { useQuery } from "@tanstack/react-query";
import { Eye, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { listApprovalTenants } from "@/features/onboarding/onboarding.api";
import { getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import type { DocumentProcessingStatus, PaymentStatus, SubscriptionPlanId, Tenant } from "@/features/tenants/tenant.types";
import { formatDate } from "@/lib/utils";

type ApprovalFilter = NonNullable<Tenant["approvalStatus"]> | "ALL";

export function AdminApprovalsPage() {
  const [planFilter, setPlanFilter] = useState<SubscriptionPlanId | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [documentFilter, setDocumentFilter] = useState<DocumentProcessingStatus | "ALL">("ALL");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("PENDING_REVIEW");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const approvalsQuery = useQuery({ queryKey: ["approval-tenants"], queryFn: listApprovalTenants });

  const filteredTenants = useMemo(() => {
    return (approvalsQuery.data ?? []).filter((tenant) => {
      const created = new Date(tenant.createdAt).getTime();
      const afterFrom = !dateFrom || created >= new Date(dateFrom).getTime();
      const beforeTo = !dateTo || created <= new Date(`${dateTo}T23:59:59`).getTime();
      return (
        (planFilter === "ALL" || tenant.selectedSubscriptionPlan === planFilter) &&
        (paymentFilter === "ALL" || tenant.paymentStatus === paymentFilter) &&
        (documentFilter === "ALL" || tenant.documentProcessingStatus === documentFilter) &&
        (approvalFilter === "ALL" || tenant.approvalStatus === approvalFilter) &&
        afterFrom &&
        beforeTo
      );
    });
  }, [approvalFilter, approvalsQuery.data, dateFrom, dateTo, documentFilter, paymentFilter, planFilter]);

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      { header: "Business name", accessor: (tenant) => <span className="font-medium text-slate-950">{tenant.tenantName}</span> },
      { header: "Website URL", accessor: (tenant) => <span className="break-all text-sm">{tenant.websiteUrl}</span> },
      { header: "Business email", accessor: (tenant) => tenant.businessEmail ?? tenant.supportEmail },
      { header: "Plan", accessor: (tenant) => getSubscriptionPlan(tenant.selectedSubscriptionPlan).name },
      { header: "Payment status", accessor: (tenant) => <StatusBadge status={tenant.paymentStatus ?? "PENDING"} /> },
      { header: "Document status", accessor: (tenant) => <StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} /> },
      { header: "Approval status", accessor: (tenant) => <StatusBadge status={tenant.approvalStatus ?? "NOT_SUBMITTED"} /> },
      { header: "Created date", accessor: (tenant) => formatDate(tenant.createdAt) },
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

  const pendingCount = (approvalsQuery.data ?? []).filter((tenant) => tenant.approvalStatus === "PENDING_REVIEW").length;
  const unpaidCount = (approvalsQuery.data ?? []).filter((tenant) => tenant.paymentStatus !== "SUCCESS" && tenant.paymentStatus !== "PAID").length;
  const readyDocumentsCount = (approvalsQuery.data ?? []).filter((tenant) => tenant.documentProcessingStatus === "READY").length;

  return (
    <>
      <PageHeader
        title="Pending Approvals"
        description="Review business-owner onboarding submissions waiting on payment, document readiness, or admin activation."
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Pending Review" value={pendingCount} />
        <SummaryCard title="Unpaid" value={unpaidCount} />
        <SummaryCard title="Documents Ready" value={readyDocumentsCount} />
      </section>

      <Card className="mb-4">
        <CardContent className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
          <Select value={planFilter} onChange={(event) => setPlanFilter(event.target.value as SubscriptionPlanId | "ALL")}>
            <option value="ALL">All plans</option>
            <option value="MONTHLY">Monthly</option>
            <option value="THREE_MONTHS">3 Months</option>
            <option value="SIX_MONTHS">6 Months</option>
            <option value="TWELVE_MONTHS">12 Months</option>
          </Select>
          <Select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as PaymentStatus | "ALL")}>
            <option value="ALL">All payments</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </Select>
          <Select value={documentFilter} onChange={(event) => setDocumentFilter(event.target.value as DocumentProcessingStatus | "ALL")}>
            <option value="ALL">All documents</option>
            <option value="NOT_UPLOADED">Not uploaded</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value as ApprovalFilter)}>
            <option value="ALL">All approvals</option>
            <option value="NOT_SUBMITTED">Not submitted</option>
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Date from" />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Date to" />
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredTenants}
        getRowKey={(tenant) => tenant.tenantId}
        isLoading={approvalsQuery.isLoading}
        emptyTitle="No tenants match these filters"
        emptyDescription="Paid registrations move into pending review after the mock payment flow completes."
      />
    </>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <ShieldCheck className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-950">{value}</div>
      </CardContent>
    </Card>
  );
}
