import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Building2, Clock, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { getDashboardSummary } from "@/features/dashboard/dashboard.api";

const metricMeta = [
  { key: "totalTenants", label: "Total Tenants", icon: Building2 },
  { key: "activeTenants", label: "Active Tenants", icon: Activity },
  { key: "totalConversations", label: "Total Conversations", icon: MessageSquare },
  { key: "leadsCaptured", label: "Leads Captured", icon: Users },
  { key: "failedResponses", label: "Failed Responses", icon: AlertTriangle },
  { key: "averageResponseTimeMs", label: "Average Response Time", icon: Clock }
] as const;

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Operational snapshot across tenants, conversations, lead capture, and response quality."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricMeta.map((metric) => {
          const Icon = metric.icon;
          const value = summaryQuery.data?.[metric.key];
          const formattedValue =
            metric.key === "averageResponseTimeMs" && typeof value === "number" ? `${value} ms` : value?.toLocaleString();

          return (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-semibold text-slate-950">{formattedValue}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Create a tenant, publish branding and AI settings, upload knowledge, then copy the widget embed script.</p>
            <p>The UI falls back to local demo data whenever the backend gateway is unavailable.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Map</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {["tenant-service", "auth-service", "knowledge-service", "chat-service", "lead-service", "analytics-service", "widget-config-service", "gateway-service"].map(
              (service) => (
                <div key={service} className="rounded-md border bg-slate-50 px-3 py-2">
                  {service}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
