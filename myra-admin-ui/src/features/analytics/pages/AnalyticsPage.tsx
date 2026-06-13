import { BarChart3, MessageSquare, QrCode, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { platformTenants, platformTotals, type PlatformTenant } from "@/features/admin/platformAdmin.data";

const totals = platformTotals();
const widgetLoads = totals.visitors + 4200;
const qrScans = 3180;
const visitorToChat = totals.visitors ? Number(((totals.chatSessions / totals.visitors) * 100).toFixed(1)) : 0;
const chatToPurchase = totals.chatSessions ? Number(((totals.purchaseCompletedCount / totals.chatSessions) * 100).toFixed(1)) : 0;

const engagementColumns: DataTableColumn<PlatformTenant>[] = [
  { header: "Tenant", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.name}</span> },
  { header: "Category", accessor: "category" },
  { header: "Visitors", accessor: (tenant) => tenant.visitors.toLocaleString() },
  { header: "Sessions", accessor: (tenant) => tenant.chatSessions.toLocaleString() },
  { header: "Purchases", accessor: (tenant) => tenant.purchaseCompletedCount.toLocaleString() }
];

export function AnalyticsPage() {
  const topTenants = [...platformTenants].sort((a, b) => b.chatSessions - a.chatSessions);
  const lowConversion = platformTenants.filter((tenant) => tenant.questionsAsked > 0 && tenant.purchaseCompletedCount / tenant.questionsAsked < 0.01);
  const categoryUsage = Array.from(
    platformTenants.reduce((acc, tenant) => {
      acc.set(tenant.category, (acc.get(tenant.category) ?? 0) + tenant.chatSessions);
      return acc;
    }, new Map<string, number>())
  );

  return (
    <>
      <PageHeader
        title="Platform Analytics"
        description="Platform-wide visitor, widget, QR, chat, lead, purchase, conversion, growth, category, and engagement analytics."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total visitors" value={totals.visitors} icon={Users} />
        <Metric label="Widget loads" value={widgetLoads} icon={BarChart3} />
        <Metric label="QR scans" value={qrScans} icon={QrCode} />
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
            <CardTitle>Tenant growth</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar label="Pending" value={totals.PENDING_APPROVAL} max={totals.totalTenants} />
            <Bar label="Active" value={totals.ACTIVE} max={totals.totalTenants} />
            <Bar label="Suspended" value={totals.SUSPENDED} max={totals.totalTenants} />
            <Bar label="Rejected" value={totals.REJECTED} max={totals.totalTenants} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage by category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryUsage.map(([category, value]) => (
              <Bar key={category} label={category} value={value} max={Math.max(...categoryUsage.map(([, sessions]) => sessions), 1)} />
            ))}
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
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-main)]">Top tenants by engagement</h2>
        <DataTable columns={engagementColumns} data={topTenants} getRowKey={(tenant) => tenant.id} />
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
