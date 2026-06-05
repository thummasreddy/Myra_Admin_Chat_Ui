import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Building2,
  Clock,
  DollarSign,
  FileWarning,
  MessageSquare,
  ShieldCheck,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getAnalyticsSummary } from "@/features/analytics/analytics.api";
import { getDashboardSummary } from "@/features/dashboard/dashboard.api";
import { listKnowledgeSources } from "@/features/knowledge/knowledge.api";
import { listAdminPayments, listApprovalTenants } from "@/features/onboarding/onboarding.api";
import { getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { listTenants } from "@/features/tenants/tenant.api";

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const tenantsQuery = useQuery({ queryKey: ["tenants", "admin-dashboard"], queryFn: () => listTenants() });
  const approvalsQuery = useQuery({ queryKey: ["approval-tenants", "dashboard"], queryFn: listApprovalTenants });
  const paymentsQuery = useQuery({ queryKey: ["payments", "dashboard"], queryFn: listAdminPayments });
  const knowledgeQuery = useQuery({ queryKey: ["knowledge", "dashboard"], queryFn: () => listKnowledgeSources() });
  const analyticsQuery = useQuery({ queryKey: ["analytics", "dashboard"], queryFn: getAnalyticsSummary });

  const tenants = tenantsQuery.data ?? [];
  const pendingApprovals = (approvalsQuery.data ?? tenants).filter((tenant) => tenant.status === "PENDING_ADMIN_APPROVAL" || tenant.approvalStatus === "PENDING_REVIEW");
  const inactiveTenants = tenants.filter((tenant) => tenant.status === "INACTIVE").length;
  const failedUploads = (knowledgeQuery.data ?? []).filter((source) => source.status === "FAILED").length;
  const revenueEstimate = (paymentsQuery.data ?? []).reduce((sum, payment) => sum + (payment.status === "SUCCESS" ? payment.amountUsd : 0), 0);
  const planDistribution = tenants.reduce<Record<string, number>>((acc, tenant) => {
    const plan = getSubscriptionPlan(tenant.selectedSubscriptionPlan).name;
    acc[plan] = (acc[plan] ?? 0) + 1;
    return acc;
  }, {});

  const metrics = [
    { label: "Total tenants", value: tenantsQuery.isLoading ? undefined : tenants.length, icon: Building2 },
    { label: "Pending approvals", value: pendingApprovals.length, icon: ShieldCheck },
    { label: "Active tenants", value: summaryQuery.data?.activeTenants, icon: Activity },
    { label: "Inactive tenants", value: inactiveTenants, icon: AlertTriangle },
    { label: "Total conversations", value: summaryQuery.data?.totalConversations, icon: MessageSquare },
    { label: "Total leads", value: summaryQuery.data?.leadsCaptured, icon: Users },
    { label: "Revenue estimate", value: revenueEstimate, icon: DollarSign, currency: true },
    { label: "Failed uploads", value: failedUploads, icon: FileWarning }
  ];

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform control center for tenant approvals, usage health, revenue signals, leads, and knowledge processing."
        actions={
          <Button asChild>
            <Link to="/approvals">
              <ShieldCheck className="h-4 w-4" />
              Review Queue
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} loading={summaryQuery.isLoading && metric.value === undefined} />
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending Business Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.slice(0, 5).map((tenant) => (
              <div key={tenant.tenantId} className="flex items-center justify-between gap-3 rounded-md border bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{tenant.tenantName}</p>
                  <p className="truncate text-xs text-muted-foreground">{tenant.websiteUrl}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={tenant.status} />
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/tenant-review/${tenant.tenantId}`}>Review</Link>
                  </Button>
                </div>
              </div>
            ))}
            {!pendingApprovals.length ? <p className="text-sm text-muted-foreground">No businesses are waiting for approval.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(planDistribution).map(([plan, count]) => {
              const width = tenants.length ? Math.max((count / tenants.length) * 100, 8) : 0;
              return (
                <div key={plan}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{plan}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#EA5455]" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tenants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenants.slice(0, 5).map((tenant) => (
              <div key={tenant.tenantId} className="flex items-center justify-between gap-3 rounded-md border bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{tenant.tenantName}</p>
                  <p className="truncate text-xs text-muted-foreground">{tenant.industry}</p>
                </div>
                <StatusBadge status={tenant.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Platform Usage Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {(analyticsQuery.data?.tenantUsage ?? []).map((tenant) => (
                <div key={tenant.tenantName} className="rounded-md border bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-950">{tenant.tenantName}</span>
                    <span className="text-muted-foreground">{tenant.conversations.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white">
                    <div className="h-2 rounded-full bg-[#16A596]" style={{ width: `${Math.min(tenant.conversations / 6, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <HealthRow label="Tenant service" status="ACTIVE" />
            <HealthRow label="Knowledge service" status={failedUploads ? "FAILED" : "ACTIVE"} />
            <HealthRow label="Chat service" status="ACTIVE" />
            <HealthRow label="Lead service" status="ACTIVE" />
            <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Avg response time: {summaryQuery.data?.averageResponseTimeMs ?? 0} ms
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
  currency
}: {
  label: string;
  value?: number;
  icon: typeof Building2;
  loading?: boolean;
  currency?: boolean;
}) {
  const formatted = currency
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value ?? 0)
    : (value ?? 0).toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-semibold text-slate-950">{formatted}</div>}</CardContent>
    </Card>
  );
}

function HealthRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-slate-50 p-3 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <StatusBadge status={status} />
    </div>
  );
}
