import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { listLeads, type Lead } from "@/features/leads/leads.api";
import { downloadCsv, formatDate } from "@/lib/utils";

export function LeadsPage() {
  const leadsQuery = useQuery({ queryKey: ["leads"], queryFn: listLeads });
  const columns = useMemo<DataTableColumn<Lead>[]>(
    () => [
      {
        header: "Lead",
        accessor: (lead) => (
          <div>
            <p className="font-medium text-slate-950">{lead.name}</p>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
        )
      },
      { header: "Phone", accessor: "phone" },
      { header: "Message", accessor: "message" },
      { header: "Tenant", accessor: "tenantName" },
      { header: "Created", accessor: (lead) => formatDate(lead.createdAt) }
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Leads"
        description="Captured visitor contact requests across all tenant widgets."
        actions={
          <Button variant="outline" onClick={() => downloadCsv("myra-leads.csv", leadsQuery.data ?? [])} disabled={!leadsQuery.data?.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={leadsQuery.data ?? []}
        getRowKey={(lead) => lead.id}
        isLoading={leadsQuery.isLoading}
        emptyTitle="No leads captured"
        emptyDescription="Leads will appear here when lead capture is enabled and visitors submit contact details."
      />
    </>
  );
}
