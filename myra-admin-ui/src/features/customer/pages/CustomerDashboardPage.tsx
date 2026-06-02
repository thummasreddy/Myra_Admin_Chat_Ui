import { useQuery } from "@tanstack/react-query";
import { BarChart3, Code2, CreditCard, FileText, MessageSquare, MousePointerClick, Settings, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getAnalyticsSummary } from "@/features/analytics/analytics.api";
import { listKnowledgeSources } from "@/features/knowledge/knowledge.api";
import { documentReviewMessage, getSubscriptionForTenant, listNotificationEvents } from "@/features/onboarding/onboarding.api";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { customerDashboardMessages } from "@/features/onboarding/onboarding.copy";
import { useCustomerTenant, isEmbedReady } from "@/features/customer/customer.hooks";
import { formatDate } from "@/lib/utils";

export function CustomerDashboardPage() {
  const { tenantId, tenantQuery } = useCustomerTenant();
  const subscriptionQuery = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: () => getSubscriptionForTenant(tenantId),
    enabled: Boolean(tenantId)
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications", tenantId],
    queryFn: () => listNotificationEvents(tenantId),
    enabled: Boolean(tenantId)
  });
  const analyticsQuery = useQuery({ queryKey: ["analytics", "customer", tenantId], queryFn: getAnalyticsSummary, enabled: Boolean(tenantId) });
  const knowledgeQuery = useQuery({
    queryKey: ["knowledge", "customer-dashboard", tenantId],
    queryFn: () => listKnowledgeSources(tenantId),
    enabled: Boolean(tenantId)
  });

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading customer dashboard" />;
  if (!tenantQuery.data) return <PageHeader title="Customer Dashboard" description="No tenant is available for this account." />;

  const tenant = tenantQuery.data;
  const subscription = subscriptionQuery.data;
  const plan = getSubscriptionPlan(subscription?.planId ?? tenant.selectedSubscriptionPlan);
  const embedReady = isEmbedReady(tenant.status);
  const totalConversations = analyticsQuery.data?.timeline.reduce((sum, point) => sum + point.conversations, 0) ?? 0;
  const totalLeads = analyticsQuery.data?.timeline.reduce((sum, point) => sum + point.leads, 0) ?? 0;

  return (
    <>
      <PageHeader
        title={`${tenant.tenantName} Dashboard`}
        description={customerDashboardMessages.welcome}
        actions={
          <Button asChild>
            <Link to="/customer/knowledge">
              <FileText className="h-4 w-4" />
              Upload Knowledge
            </Link>
          </Button>
        }
      />

      <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        {documentReviewMessage}
      </div>

      {!embedReady ? (
        <div className="mb-6 rounded-md border bg-white px-4 py-3 text-sm font-medium text-slate-800">
          {customerDashboardMessages.approvalPending}
        </div>
      ) : (
        <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {customerDashboardMessages.embedReady}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Assistant status" value={tenant.status} icon={Settings} badge />
        <MetricCard title="Current plan" value={plan.name} helper={formatPlanPrice(plan)} icon={CreditCard} />
        <MetricCard title="Knowledge docs" value={(knowledgeQuery.data?.length ?? 0).toLocaleString()} icon={FileText} />
        <MetricCard title="Total conversations" value={totalConversations.toLocaleString()} icon={MessageSquare} />
        <MetricCard title="Captured leads" value={totalLeads.toLocaleString()} icon={BarChart3} />
        <MetricCard title="Recommendation clicks" value="86" icon={MousePointerClick} />
        <MetricCard title="Payment assistant usage" value="24" icon={WalletCards} />
        <MetricCard title="Embed code status" value={embedReady ? "READY" : "PENDING_ADMIN_APPROVAL"} icon={Code2} badge />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Plan" value={`${plan.name} (${formatPlanPrice(plan)})`} />
            <InfoRow label="Status" value={<StatusBadge status={subscription?.status ?? tenant.subscriptionStatus ?? "ACTIVE"} />} />
            <InfoRow label="Renews" value={subscription?.renewsAt ? formatDate(subscription.renewsAt) : "N/A"} />
            <InfoRow label="Renewal reminder" value={subscription?.renewalReminderAt ? formatDate(subscription.renewalReminderAt) : "N/A"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Payment" value={<StatusBadge status={tenant.paymentStatus ?? "PAID"} />} />
            <InfoRow label="Document status" value={<StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} />} />
            <InfoRow label="Embed code" value={embedReady ? "Ready in your dashboard" : customerDashboardMessages.embedHidden} />
            <InfoRow label="Email sent" value={tenant.embedCodeEmailSentAt ? formatDate(tenant.embedCodeEmailSentAt) : "Not sent yet"} />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/embed">
                  <Code2 className="h-4 w-4" />
                  Embed Code
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/customer/settings">
                  <Settings className="h-4 w-4" />
                  Assistant Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsQuery.data?.topQuestions.slice(0, 4).map((item) => (
              <div key={item.question} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <span className="font-medium text-slate-800">{item.question}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(notificationsQuery.data ?? []).slice(0, 6).map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium text-slate-950">{event.subject}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.sendAt ?? event.createdAt)}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
            {!notificationsQuery.data?.length ? <p className="text-sm text-muted-foreground">No email events yet.</p> : null}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  badge
}: {
  title: string;
  value: string;
  helper?: string;
  icon: typeof Settings;
  badge?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {badge ? <StatusBadge status={value} /> : <div className="text-2xl font-semibold text-slate-950">{value}</div>}
        {helper ? <p className="mt-1 text-sm text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}
