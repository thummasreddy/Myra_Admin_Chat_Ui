import { Building2, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getMyraAdminDashboard, type MyraAdminDashboard } from "@/features/dashboard/dashboard.api";
import {
  listTenants,
  type TenantAdminRead
} from "@/features/tenants/tenants.api";
import { formatDate } from "@/lib/utils";

const tenantColumns: DataTableColumn<TenantAdminRead>[] = [
  { header: "Tenant", accessor: (t) => <span className="font-medium text-[var(--color-text-main)]">{t.business_name}</span> },
  { header: "Category", accessor: (t) => t.category ?? "—" },
  { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> },
  { header: "Created", accessor: (t) => formatDate(t.created_at) }
];

export function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<MyraAdminDashboard | null>(null);
  const [tenants, setTenants] = useState<TenantAdminRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, tenantData] = await Promise.all([
        getMyraAdminDashboard(),
        listTenants(1, 100)
      ]);
      setDashboard(dashboardData);
      setTenants(tenantData.items);
    } catch {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <>
        <PageHeader title="Platform Analytics" description="Platform-wide analytics." />
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error ?? "Failed to load data."}
          <Button variant="outline" size="sm" className="ml-3" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </>
    );
  }

  const activeCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedCount = tenants.filter((t) => t.status === "SUSPENDED").length;
  const draftCount = tenants.filter((t) => t.status === "DRAFT").length;

  return (
    <>
      <PageHeader
        title="Platform Analytics"
        description="Platform-wide tenant, conversation, lead, and user analytics."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total tenants" value={dashboard.total_tenants} icon={Building2} />
        <Metric label="Active tenants" value={dashboard.active_tenants} icon={Building2} />
        <Metric label="Pending approvals" value={dashboard.pending_approvals} icon={ShieldCheck} />
        <Metric label="Total users" value={dashboard.total_users} icon={Users} />
        <Metric label="Total conversations" value={dashboard.total_conversations} icon={MessageSquare} />
        <Metric label="Total leads" value={dashboard.total_leads} icon={Users} />
        <Metric label="Suspended" value={dashboard.suspended_tenants} icon={Building2} />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tenant status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar label="Active" value={activeCount} max={dashboard.total_tenants || 1} />
            <Bar label="Suspended" value={suspendedCount} max={dashboard.total_tenants || 1} />
            <Bar label="Draft" value={draftCount} max={dashboard.total_tenants || 1} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-main)]">All tenants</h2>
        <DataTable columns={tenantColumns} data={tenants} getRowKey={(t) => t.id} />
      </section>
    </>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Users }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[var(--color-text-main)]">{typeof value === "number" ? value.toLocaleString() : value}</div>
      </CardContent>
    </Card>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-[var(--color-text-main)]">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-bg-muted)]">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max((value / max) * 100, 4)}%` }} />
      </div>
    </div>
  );
}
