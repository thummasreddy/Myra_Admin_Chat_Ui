import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAnalyticsSummary } from "@/features/analytics/analytics.api";

export function AnalyticsPage() {
  const analyticsQuery = useQuery({ queryKey: ["analytics"], queryFn: getAnalyticsSummary });
  const data = analyticsQuery.data;

  if (analyticsQuery.isLoading) return <LoadingSpinner label="Loading analytics" />;

  return (
    <>
      <PageHeader title="Analytics" description="Measure traffic, lead capture, top questions, failed responses, and tenant usage." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeries data={data?.timeline.map((point) => ({ label: point.label, value: point.conversations })) ?? []} color="#1591DC" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <BarSeries data={data?.timeline.map((point) => ({ label: point.label, value: point.leads })) ?? []} color="#059669" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.topQuestions.map((item) => (
              <ProgressRow key={item.question} label={item.question} value={item.count} max={data.topQuestions[0]?.count ?? 1} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.tenantUsage.map((item) => (
              <ProgressRow key={item.tenantName} label={item.tenantName} value={item.conversations} max={data.tenantUsage[0]?.conversations ?? 1} />
            ))}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Failed Response Count</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-amber-50 p-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-slate-950">{data?.failedResponseCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">Responses that fell back or could not answer confidently.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function BarSeries({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="flex h-72 items-end gap-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-56 w-full items-end rounded-md bg-slate-100">
            <div className="w-full rounded-md" style={{ height: `${(item.value / max) * 100}%`, backgroundColor: color }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-slate-800">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max((value / max) * 100, 8)}%` }} />
      </div>
    </div>
  );
}
