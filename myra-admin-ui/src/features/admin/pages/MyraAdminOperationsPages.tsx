import { Bell, CreditCard, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  listTenants,
  type TenantAdminRead
} from "@/features/tenants/tenants.api";
import { formatDate } from "@/lib/utils";

function useTenants() {
  const [tenants, setTenants] = useState<TenantAdminRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTenants(1, 100);
      setTenants(result.items);
    } catch {
      setError("Failed to load data from the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tenants, loading, error, refetch: fetch };
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
      {message}
      <Button variant="outline" size="sm" className="ml-3" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

const tenantReviewColumns: DataTableColumn<TenantAdminRead>[] = [
  { header: "Business", accessor: (t) => <span className="font-medium text-[var(--color-text-main)]">{t.business_name}</span> },
  { header: "Category", accessor: (t) => t.category ?? "—" },
  { header: "Email", accessor: "business_email" },
  { header: "Status", accessor: (t) => <StatusBadge status={t.approval_status} /> },
  { header: "Registered", accessor: (t) => formatDate(t.created_at) }
];

const subscriptionColumns: DataTableColumn<TenantAdminRead>[] = [
  { header: "Tenant", accessor: (t) => <span className="font-medium text-[var(--color-text-main)]">{t.business_name}</span> },
  { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> },
  { header: "Approval", accessor: (t) => <StatusBadge status={t.approval_status} /> },
  { header: "Created", accessor: (t) => formatDate(t.created_at) }
];

const knowledgeColumns: DataTableColumn<TenantAdminRead>[] = [
  { header: "Tenant", accessor: (t) => <span className="font-medium text-[var(--color-text-main)]">{t.business_name}</span> },
  { header: "Category", accessor: (t) => t.category ?? "—" },
  { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> }
];

export function TenantReviewPage() {
  const { tenants, loading, error, refetch } = useTenants();
  const pending = useMemo(
    () => tenants.filter((t) => t.approval_status === "PENDING_REVIEW" || t.status === "DRAFT"),
    [tenants]
  );

  return (
    <>
      <PageHeader title="Tenant Review" description="Review tenant registration details, owner information, and requested plans." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={tenantReviewColumns}
        data={pending}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No tenants awaiting review"}
        emptyDescription={loading ? "Fetching data." : "New registrations will appear here."}
      />
    </>
  );
}

export function PaymentsPage() {
  const { tenants, loading, error, refetch } = useTenants();
  const activeCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const draftCount = tenants.filter((t) => t.status === "DRAFT").length;
  const suspendedCount = tenants.filter((t) => t.status === "SUSPENDED").length;

  return (
    <>
      <PageHeader title="Payments" description="Monitor tenant payment status and plan billing." />
      <MetricStrip
        items={[
          { label: "Active subscriptions", value: activeCount, icon: CreditCard },
          { label: "Pending", value: draftCount, icon: Bell },
          { label: "Suspended", value: suspendedCount, icon: ShieldCheck }
        ]}
      />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={subscriptionColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No payment data"}
        emptyDescription={loading ? "Fetching data." : "Payment records will appear when tenants subscribe."}
      />
    </>
  );
}

export function KnowledgeDocumentsPage() {
  const { tenants, loading, error, refetch } = useTenants();

  return (
    <>
      <PageHeader title="Knowledge Documents" description="Track tenant knowledge ingestion status." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={knowledgeColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No knowledge data"}
        emptyDescription={loading ? "Fetching data." : "Tenant knowledge data will appear here."}
      />
    </>
  );
}

export function SubscriptionsPage() {
  const { tenants, loading, error, refetch } = useTenants();

  return (
    <>
      <PageHeader title="Subscriptions" description="Manage tenant subscription plans and status." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={subscriptionColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No subscriptions"}
        emptyDescription={loading ? "Fetching data." : "Subscription records will appear as tenants sign up."}
      />
    </>
  );
}

export function EmailNotificationsPage() {
  const { tenants, loading, error, refetch } = useTenants();

  return (
    <>
      <PageHeader title="Email Notifications" description="Monitor tenant notification delivery." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={subscriptionColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No notifications"}
        emptyDescription={loading ? "Fetching data." : "Notification records will appear here."}
      />
    </>
  );
}

export function KnowledgePage() {
  const { tenants, loading, error, refetch } = useTenants();

  return (
    <>
      <PageHeader title="Knowledge" description="Myra Admin view of tenant knowledge readiness across the platform." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={knowledgeColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No knowledge data"}
        emptyDescription={loading ? "Fetching data." : "Tenant knowledge will appear here."}
      />
    </>
  );
}

export function ConversationsPage() {
  const { tenants, loading, error, refetch } = useTenants();

  return (
    <>
      <PageHeader title="Conversations" description="Review aggregate tenant conversation volume." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={subscriptionColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No conversation data"}
        emptyDescription={loading ? "Fetching data." : "Conversation data will appear as tenants use the platform."}
      />
    </>
  );
}

export function LeadsPage() {
  const { tenants, loading, error, refetch } = useTenants();

  return (
    <>
      <PageHeader title="Leads" description="Monitor lead capture volume across tenant widgets." />
      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}
      <DataTable
        columns={subscriptionColumns}
        data={tenants}
        getRowKey={(t) => t.id}
        emptyTitle={loading ? "Loading..." : "No lead data"}
        emptyDescription={loading ? "Fetching data." : "Lead capture data will appear here."}
      />
    </>
  );
}

function MetricStrip({ items }: { items: { label: string; value: number | string; icon: typeof CreditCard }[] }) {
  return (
    <section className="mb-6 grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--color-text-main)]">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
