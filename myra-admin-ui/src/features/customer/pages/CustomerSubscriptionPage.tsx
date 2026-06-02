import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomerTenant } from "@/features/customer/customer.hooks";
import { getSubscriptionForTenant } from "@/features/onboarding/onboarding.api";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { formatDate } from "@/lib/utils";

export function CustomerSubscriptionPage() {
  const { tenantId, tenantQuery } = useCustomerTenant();
  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "customer-page", tenantId],
    queryFn: () => getSubscriptionForTenant(tenantId),
    enabled: Boolean(tenantId)
  });

  if (tenantQuery.isLoading || subscriptionQuery.isLoading) return <LoadingSpinner label="Loading subscription" />;
  if (!tenantQuery.data) return <PageHeader title="Subscription" description="No tenant is available for this account." />;

  const tenant = tenantQuery.data;
  const subscription = subscriptionQuery.data;
  const plan = getSubscriptionPlan(subscription?.planId ?? tenant.selectedSubscriptionPlan);

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Review plan, payment status, renewal timing, and what is included in your Myra assistant subscription."
      />

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="mt-1 text-4xl font-semibold text-slate-950">{plan.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{formatPlanPrice(plan)} · {plan.renewalCadence}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Payment" value={<StatusBadge status={tenant.paymentStatus ?? "PENDING"} />} />
              <Info label="Subscription" value={<StatusBadge status={subscription?.status ?? tenant.subscriptionStatus ?? "PENDING_PAYMENT"} />} />
              <Info label="Started" value={subscription?.startedAt ? formatDate(subscription.startedAt) : "Pending"} />
              <Info label="Renews" value={subscription?.renewsAt ? formatDate(subscription.renewsAt) : "Not scheduled"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Included
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              "AI assistant widget",
              "Business dashboard",
              "Knowledge document upload",
              "Admin-reviewed activation",
              "Embed code delivery",
              "Lead capture support",
              "Basic analytics",
              "Email onboarding updates"
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-md border bg-slate-50 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}
