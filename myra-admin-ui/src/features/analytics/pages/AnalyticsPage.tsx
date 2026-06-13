import { BarChart3, MessageSquare, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import type { PlatformTenant } from "@/features/admin/admin.types";
import { fetchTenants } from "@/features/admin/admin.api";

function computeTotals(tenants: PlatformTenant[]) {
  const totals = tenants.reduce(
    (acc, tenant) => {
      acc.visitors += tenant.visitors;
      acc.chatSessions += tenant.chatSessions;
      acc.questionsAsked += tenant.questionsAsked;
      acc.answersGiven += tenant.answersGiven;
      acc.leadsCaptured += tenant.leadsCaptured;
      acc.purchaseIntentCount += tenant.purchaseIntentCount;
      acc.purchaseCompletedCount += tenant.purchaseCompletedCount;
      return acc;
    },
    { visitors: 0, chatSessions: 0, questionsAsked: 0, answersGiven: 0, leadsCaptured: 0, purchaseIntentCount: 0, purchaseCompletedCount: 0 }
  );
  return {
    ...totals,
    totalTenants: tenants.length,
    questionToPurchase: totals.questionsAsked > 0 ? Number(((totals.purchaseCompletedCount / totals.questionsAsked) * 100).toFixed(1)) : 0
  };
}

const engagementColumns: DataTableColumn<PlatformTenant>[] = [
  { header: "Tenant", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.name}</span> },
  { header: "Category", accessor: "category" },
  { header: "Visitors", accessor: (tenant) => tenant.visitors.toLocaleString() },
  { header: "Sessions", accessor: (tenant) => tenant.chatSessions.toLocaleString() },
  { header: "Purchases", accessor: (tenant) => tenant.purchaseCompletedCount.toLocaleString() }
];

export function AnalyticsPage() {
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTenants()
      .then((data) => { if (!cancelled) setTenants(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Platform Analytics" description="Loading analytics data…" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </>
    );
  }

  const totals = computeTotals(tenants);
  const widgetLoads = totals.visitors;
  const visitorToChat = totals.visitors ? Number(((totals.chatSessions / totals.visitors) * 100).toFixed(1)) : 0;
  const chatToPurchase = totals.chatSessions ? Number(((totals.purchaseCompletedCount / totals.chatSessions) * 100).toFixed(1)) : 0;
  const topTenants = [...tenants].sort((a, b) => b.chatSessions - a.chatSessions);
  const lowConversion = tenants.filter((tenant) => tenant.questionsAsked > 0 && tenant.purchaseCompletedCount / tenant.questionsAsked < 0.01);
  const categoryUsage = Array.from(
    tenants.reduce((acc, tenant) => {
      if (tenant.category) acc.set(tenant.category, (acc.get(tenant.category) ?? 0) + tenant.chatSessions);
      return acc;
    }, new Map<string, number>())
  );

  return (
    <>
      <PageHeader
        title="Platform Analytics"
        description="Platform-wide visitor, widget, chat, lead, purchase, conversion, growth, category, and engagement analytics."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total visitors" value={totals.visitors} icon={Users} />
        <Metric label="Widget loads" value={widgetLoads} icon={BarChart3} />
        <Metric label="Chat sessions" value={totals.chatSessions} icon={MessageSquare} />
        <Metric label="Questions asked" value={totals.questionsAsked} icon={MessageSquare} />
        <Metric label="Answers given" value={totals.answersGiven} icon={MessageSquare} />
        <Metric label="Leads captured" value={totals.leadsCaptured} icon={Users} />
        <Metric label="Purchase intent" value={totals.purchaseIntentCount} icon={ShoppingCart} />
        <Metric label="Purchase completed" value={totals.purchaseCompletedCount} icon={ShoppingCart} />
        <Metric label="Q to purchase" value={`${totals.questionToPurchase}%`} icon={TrendingUp} />
        <Metric label="Visitor to chat" value={`${visitorToChat}%`} icon={TrendingUp} />
        <Metric label="Chat to purchase" value={`${chatToPurchase}%`} icon={TrendingUp} />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Usage by category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryUsage.length > 0 ? (
              categoryUsage.map(([category, value]) => (
                <Bar key={category} label={category} value={value} max={Math.max(...categoryUsage.map(([, sessions]) => sessions), 1)} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No category data available.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low conversion tenants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowConversion.length ? (
              lowConversion.map((tenant) => (
                <div key={tenant.id} className="rounded-md border bg-[var(--color-bg-muted)] p-3">
                  <p className="font-medium text-[var(--color-text-main)]">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">{tenant.purchaseCompletedCount} purchases from {tenant.questionsAsked.toLocaleString()} questions</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No low-conversion tenants detected.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={engagementColumns} data={topTenants} getRowKey={(tenant) => tenant.id} emptyTitle="No tenants" emptyDescription="No tenant data available." />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-[var(--color-text-main)]">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-[var(--color-text-main)]">{value.toLocaleString()}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-[var(--color-bg-muted)]">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
