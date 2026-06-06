import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, PowerOff, Send, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { approveTenant, rejectTenant, triggerEmbedCodeEmail } from "@/features/onboarding/onboarding.api";
import { getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { listTenants, updateTenant } from "@/features/tenants/tenant.api";
import type { PaymentStatus, SubscriptionPlanId, Tenant, TenantStatus } from "@/features/tenants/tenant.types";
import { formatDate } from "@/lib/utils";

export function TenantListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TenantStatus | "ALL">("ALL");
  const [plan, setPlan] = useState<SubscriptionPlanId | "ALL">("ALL");
  const [payment, setPayment] = useState<PaymentStatus | "ALL">("ALL");
  const [industry, setIndustry] = useState("ALL");
  const [createdDate, setCreatedDate] = useState("");
  const queryClient = useQueryClient();
  const tenantsQuery = useQuery({
    queryKey: ["tenants", "management"],
    queryFn: () => listTenants()
  });

  function refreshTenants() {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    queryClient.invalidateQueries({ queryKey: ["approval-tenants"] });
  }

  const approveMutation = useMutation({
    mutationFn: approveTenant,
    onSuccess: () => {
      refreshTenants();
      toast({ title: "Tenant approved", variant: "success" });
    }
  });
  const rejectMutation = useMutation({
    mutationFn: (tenantId: string) => rejectTenant(tenantId, { reason: "Rejected from tenant management." }),
    onSuccess: () => {
      refreshTenants();
      toast({ title: "Tenant rejected", variant: "success" });
    }
  });
  const deactivateMutation = useMutation({
    mutationFn: (tenantId: string) => updateTenant(tenantId, { status: "INACTIVE" }),
    onSuccess: () => {
      refreshTenants();
      toast({ title: "Tenant deactivated", variant: "success" });
    }
  });
  const emailMutation = useMutation({
    mutationFn: triggerEmbedCodeEmail,
    onSuccess: () => toast({ title: "Embed code email queued", variant: "success" })
  });

  const industries = useMemo(() => {
    return Array.from(new Set((tenantsQuery.data ?? []).map((tenant) => tenant.industry).filter(Boolean))).sort();
  }, [tenantsQuery.data]);

  const filteredTenants = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return (tenantsQuery.data ?? []).filter((tenant) => {
      const createdMatches = !createdDate || tenant.createdAt.slice(0, 10) === createdDate;
      const searchMatches =
        !searchTerm ||
        tenant.tenantName.toLowerCase().includes(searchTerm) ||
        tenant.websiteUrl.toLowerCase().includes(searchTerm) ||
        (tenant.businessEmail ?? tenant.supportEmail).toLowerCase().includes(searchTerm);

      return (
        searchMatches &&
        (status === "ALL" || tenant.status === status) &&
        (plan === "ALL" || tenant.selectedSubscriptionPlan === plan) &&
        (payment === "ALL" || tenant.paymentStatus === payment) &&
        (industry === "ALL" || tenant.industry === industry) &&
        createdMatches
      );
    });
  }, [createdDate, industry, payment, plan, search, status, tenantsQuery.data]);

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      {
        header: "Tenant name",
        accessor: (tenant) => (
          <div>
            <p className="font-medium text-[var(--color-text-main)]">{tenant.tenantName}</p>
            <p className="text-sm text-muted-foreground">{tenant.businessEmail ?? tenant.supportEmail}</p>
          </div>
        )
      },
      { header: "Website", accessor: (tenant) => <span className="break-all text-sm">{tenant.websiteUrl}</span> },
      { header: "Plan", accessor: (tenant) => getSubscriptionPlan(tenant.selectedSubscriptionPlan).name },
      { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.status} /> },
      { header: "Payment", accessor: (tenant) => <StatusBadge status={tenant.paymentStatus ?? "PENDING"} /> },
      { header: "Documents", accessor: (tenant) => <StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} /> },
      { header: "Created", accessor: (tenant) => formatDate(tenant.createdAt) },
      {
        header: "Actions",
        className: "text-right",
        accessor: (tenant) => (
          <div className="flex flex-wrap justify-end gap-1">
            <Button asChild variant="outline" size="sm">
              <Link to={`/tenants/${tenant.tenantId}`}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/tenant-review/${tenant.tenantId}`}>Review</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate(tenant.tenantId)} aria-label={`Approve ${tenant.tenantName}`}>
              <ShieldCheck className="h-4 w-4 text-[var(--color-success)]" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => rejectMutation.mutate(tenant.tenantId)} aria-label={`Reject ${tenant.tenantName}`}>
              <XCircle className="h-4 w-4 text-destructive" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deactivateMutation.mutate(tenant.tenantId)} aria-label={`Deactivate ${tenant.tenantName}`}>
              <PowerOff className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => emailMutation.mutate(tenant.tenantId)} disabled={!tenant.embedCode} aria-label={`Resend embed code for ${tenant.tenantName}`}>
              <Send className="h-4 w-4 text-primary" />
            </Button>
          </div>
        )
      }
    ],
    [approveMutation, deactivateMutation, emailMutation, rejectMutation]
  );

  return (
    <>
      <PageHeader
        title="Tenant Management"
        description="Search, filter, approve, reject, deactivate, and inspect business tenants from one operations workspace."
        actions={
          <Button asChild>
            <Link to="/tenants/new">
              <Plus className="h-4 w-4" />
              Create Tenant
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tenant, website, email" />
        <Select value={status} onChange={(event) => setStatus(event.target.value as TenantStatus | "ALL")}>
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PAYMENT_PENDING">Payment pending</option>
          <option value="PAYMENT_COMPLETED">Payment completed</option>
          <option value="PENDING_ADMIN_APPROVAL">Pending admin approval</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </Select>
        <Select value={plan} onChange={(event) => setPlan(event.target.value as SubscriptionPlanId | "ALL")}>
          <option value="ALL">All plans</option>
          <option value="MONTHLY">Starter</option>
          <option value="THREE_MONTHS">Growth</option>
          <option value="SIX_MONTHS">Pro</option>
          <option value="TWELVE_MONTHS">Enterprise</option>
        </Select>
        <Select value={payment} onChange={(event) => setPayment(event.target.value as PaymentStatus | "ALL")}>
          <option value="ALL">All payments</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </Select>
        <Select value={industry} onChange={(event) => setIndustry(event.target.value)}>
          <option value="ALL">All industries</option>
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Input type="date" value={createdDate} onChange={(event) => setCreatedDate(event.target.value)} aria-label="Created date" />
      </div>

      <DataTable
        columns={columns}
        data={filteredTenants}
        getRowKey={(tenant) => tenant.tenantId}
        isLoading={tenantsQuery.isLoading}
        emptyTitle="No tenants found"
        emptyDescription="Create a tenant or adjust filters to inspect business configuration, approval status, and embed delivery."
      />
    </>
  );
}
