import { useQuery } from "@tanstack/react-query";
import { BarChart3, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAnalyticsSummary } from "@/features/analytics/analytics.api";
import { useCustomerTenant } from "@/features/customer/customer.hooks";

export function CustomerAnalyticsPage() {
  const { tenantQuery } = useCustomerTenant();
  const analyticsQuery = useQuery({ queryKey: ["analytics", "customer-page"], queryFn: getAnalyticsSummary });

  if (tenantQuery.isLoading || analyticsQuery.isLoading) return <LoadingSpinner label="Loading analytics" />;

  const summary = analyticsQuery.data;
  const totalConversations = summary?.timeline.reduce((sum, point) => sum + point.conversations, 0) ?? 0;
  const totalLeads = summary?.timeline.reduce((sum, point) => sum + point.leads, 0) ?? 0;
  const maxConversations = Math.max(...(summary?.timeline.map((point) => point.conversations) ?? [1]));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Understand how customers use your assistant, which questions repeat, and where leads are coming from."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric title="Conversations" value={totalConversations.toLocaleString()} icon={MessageSquare} />
        <Metric title="Captured leads" value={totalLeads.toLocaleString()} icon={Users} />
        <Metric title="Fallbacks" value={(summary?.failedResponseCount ?? 0).toLocaleString()} icon={TrendingUp} />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conversation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3 rounded-md border bg-slate-950 p-4">
              {(summary?.timeline ?? []).map((point) => (
                <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end rounded-md bg-white/5 p-1">
                    <div
                      className="w-full rounded-sm bg-[#EA5455]"
                      style={{ height: `${Math.max((point.conversations / maxConversations) * 100, 8)}%` }}
                      aria-label={`${point.conversations} conversations on ${point.label}`}
                    />
                  </div>
                  <span className="truncate text-xs text-slate-300">{point.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(summary?.topQuestions ?? []).map((item) => (
              <div key={item.question} className="rounded-md border bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-950">{item.question}</p>
                  <span className="text-sm font-semibold text-primary">{item.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: typeof BarChart3 }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-950">{value}</div>
      </CardContent>
    </Card>
  );
}
