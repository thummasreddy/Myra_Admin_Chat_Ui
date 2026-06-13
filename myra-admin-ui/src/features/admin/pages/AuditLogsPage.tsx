import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { AuditEntry } from "@/features/admin/admin.types";
import { fetchAuditEntries } from "@/features/admin/admin.api";
import { formatDate } from "@/lib/utils";

export function AuditLogsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("ALL");
  const [tenant, setTenant] = useState("");
  const [resourceType, setResourceType] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAuditEntries()
      .then((data) => { if (!cancelled) setEntries(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const timestamp = new Date(entry.timestamp).getTime();
      return (
        (!actor || entry.adminUser.toLowerCase().includes(actor.toLowerCase())) &&
        (action === "ALL" || entry.action === action) &&
        (!tenant || entry.tenantAffected.toLowerCase().includes(tenant.toLowerCase())) &&
        (resourceType === "ALL" || entry.resourceType === resourceType) &&
        (!dateFrom || timestamp >= new Date(dateFrom).getTime()) &&
        (!dateTo || timestamp <= new Date(`${dateTo}T23:59:59`).getTime())
      );
    });
  }, [action, actor, dateFrom, dateTo, entries, resourceType, tenant]);

  const columns: DataTableColumn<AuditEntry>[] = [
    { header: "Admin user", accessor: "adminUser" },
    { header: "Role", accessor: (entry) => <StatusBadge status={entry.role} /> },
    { header: "Action", accessor: "action" },
    { header: "Tenant affected", accessor: "tenantAffected" },
    { header: "Resource type", accessor: "resourceType" },
    { header: "Old value", accessor: "oldValue" },
    { header: "New value", accessor: "newValue" },
    { header: "Timestamp", accessor: (entry) => formatDate(entry.timestamp) },
    { header: "IP address", accessor: "ipAddress" }
  ];

  if (loading) {
    return (
      <>
        <PageHeader title="Audit Logs" description="Loading audit log data…" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Audit Logs" description="Permission-checked admin actions with old/new values, tenant scope, actor, and IP address." />

      <div className="mb-4 grid gap-3 md:grid-cols-6">
        <Input value={actor} onChange={(event) => setActor(event.target.value)} placeholder="Actor" />
        <Select value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="ALL">All actions</option>
          <option value="APPROVE_TENANT">Approve tenant</option>
          <option value="REPROCESS_DOCUMENT">Reprocess document</option>
          <option value="CHANGE_PLAN">Change plan</option>
        </Select>
        <Input value={tenant} onChange={(event) => setTenant(event.target.value)} placeholder="Tenant" />
        <Select value={resourceType} onChange={(event) => setResourceType(event.target.value)}>
          <option value="ALL">All resources</option>
          <option value="tenant">Tenant</option>
          <option value="knowledge_document">Knowledge document</option>
          <option value="plan">Plan</option>
        </Select>
        <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Date from" />
        <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Date to" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(entry) => entry.id}
        emptyTitle="No audit logs match these filters"
        emptyDescription="Critical admin actions will appear here after backend audit logging."
      />
    </>
  );
}
