import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomerTenant } from "@/features/customer/customer.hooks";
import { listLeads, type Lead } from "@/features/leads/leads.api";
import { formatDate } from "@/lib/utils";

export function CustomerLeadsPage() {
  const { tenantQuery } = useCustomerTenant();
  const leadsQuery = useQuery({ queryKey: ["leads", "customer"], queryFn: listLeads });

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading leads" />;
  const tenant = tenantQuery.data;
  const leads = (leadsQuery.data ?? []).filter((lead) => !tenant || lead.tenantName === tenant.tenantName);

  const columns: DataTableColumn<Lead>[] = [
    {
      header: "Customer",
      accessor: (lead) => (
        <div>
          <p className="font-medium text-[var(--color-text-main)]">{lead.name}</p>
          <p className="text-sm text-muted-foreground">{lead.message}</p>
        </div>
      )
    },
    {
      header: "Email",
      accessor: (lead) => (
        <span className="inline-flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          {lead.email}
        </span>
      )
    },
    {
      header: "Phone",
      accessor: (lead) => (
        <span className="inline-flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          {lead.phone}
        </span>
      )
    },
    { header: "Captured", accessor: (lead) => formatDate(lead.createdAt) },
    { header: "Status", accessor: () => <StatusBadge status="QUEUED" /> }
  ];

  return (
    <>
      <PageHeader
        title="Captured Leads"
        description="Review customer details collected by Myra and follow up while intent is still fresh."
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <LeadMetric title="Total leads" value={leads.length.toLocaleString()} />
        <LeadMetric title="This week" value={leads.length.toLocaleString()} />
        <LeadMetric title="Follow-up queue" value={leads.length.toLocaleString()} />
      </section>

      <DataTable
        columns={columns}
        data={leads}
        getRowKey={(lead) => lead.id}
        isLoading={leadsQuery.isLoading}
        emptyTitle="No captured leads yet"
        emptyDescription="When Myra collects a customer name, email, phone, or requirement, it will appear here."
      />
    </>
  );
}

function LeadMetric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Users className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[var(--color-text-main)]">{value}</div>
      </CardContent>
    </Card>
  );
}
