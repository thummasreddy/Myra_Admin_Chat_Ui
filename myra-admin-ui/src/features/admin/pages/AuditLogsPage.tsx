import { useCallback, useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { listAuditLogs } from "@/features/tenants/tenants.api";
import { formatDate } from "@/lib/utils";

type AuditLogEntry = {
  id: string;
  actor_user_id: string | null;
  actor_role: string | null;
  actor_type: string | null;
  tenant_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_value_json: Record<string, unknown> | null;
  new_value_json: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export function AuditLogsPage() {
  const [action, setAction] = useState("ALL");
  const [resourceType, setResourceType] = useState("ALL");
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAuditLogs(1, 100);
      setLogs(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = useMemo(() => {
    return logs.filter((entry) => {
      return (
        (action === "ALL" || entry.action === action) &&
        (resourceType === "ALL" || entry.resource_type === resourceType)
      );
    });
  }, [action, logs, resourceType]);

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { header: "Actor", accessor: (entry) => entry.actor_user_id ?? "—" },
    { header: "Role", accessor: (entry) => entry.actor_role ?? "—" },
    { header: "Action", accessor: "action" },
    { header: "Resource type", accessor: (entry) => entry.resource_type ?? "—" },
    { header: "Resource ID", accessor: (entry) => entry.resource_id ?? "—" },
    { header: "Old value", accessor: (entry) => entry.old_value_json ? JSON.stringify(entry.old_value_json).slice(0, 50) : "—" },
    { header: "New value", accessor: (entry) => entry.new_value_json ? JSON.stringify(entry.new_value_json).slice(0, 50) : "—" },
    { header: "Timestamp", accessor: (entry) => formatDate(entry.created_at) },
    { header: "IP address", accessor: (entry) => entry.ip_address ?? "—" }
  ];

  return (
    <>
      <PageHeader title="Audit Logs" description="Permission-checked admin actions with old/new values, tenant scope, actor, and IP address." />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Select value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="ALL">All actions</option>
          <option value="APPROVE_TENANT">Approve tenant</option>
          <option value="REJECT_TENANT">Reject tenant</option>
          <option value="SUSPEND_TENANT">Suspend tenant</option>
          <option value="CHANGE_PLAN">Change plan</option>
        </Select>
        <Select value={resourceType} onChange={(event) => setResourceType(event.target.value)}>
          <option value="ALL">All resources</option>
          <option value="tenant">Tenant</option>
          <option value="knowledge_document">Knowledge document</option>
          <option value="plan">Plan</option>
        </Select>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchLogs}>
            Retry
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(entry) => entry.id}
        emptyTitle={loading ? "Loading audit logs..." : "No audit logs match these filters"}
        emptyDescription={loading ? "Fetching data." : "Admin actions will appear here after audit logging."}
      />
    </>
  );
}
