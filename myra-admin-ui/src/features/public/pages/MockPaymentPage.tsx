import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, LockKeyhole, ReceiptText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { completeMockPayment, getBusinessRegistration } from "@/features/onboarding/onboarding.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { PublicNav } from "@/features/public/pages/PublicLandingPage";

export function MockPaymentPage() {
  const { registrationId = "" } = useParams();
  const navigate = useNavigate();
  const setSelectedTenantId = useAuthStore((state) => state.setSelectedTenantId);

  const registrationQuery = useQuery({
    queryKey: ["business-registration", registrationId],
    queryFn: () => getBusinessRegistration(registrationId),
    enabled: Boolean(registrationId)
  });

  const paymentMutation = useMutation({
    mutationFn: () => completeMockPayment(registrationId),
    onSuccess: (result) => {
      toast({
        title: "Payment successful",
        description: "Admin approval is now pending.",
        variant: "success"
      });
      setSelectedTenantId(result.tenantId);
      navigate(`/onboarding-success/${registrationId}?tenantId=${result.tenantId}`, { replace: true });
    },
    onError: () => toast({ title: "Mock payment failed", description: "Please try again.", variant: "error" })
  });

  if (registrationQuery.isLoading) return <LoadingSpinner label="Loading payment details" />;
  if (!registrationQuery.data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <PublicNav />
        <section className="mx-auto max-w-3xl px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Registration not found</CardTitle>
            </CardHeader>
          </Card>
        </section>
      </main>
    );
  }

  const registration = registrationQuery.data;
  const plan = getSubscriptionPlan(registration.selectedSubscriptionPlan);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicNav />
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">Mock payment</h1>
              <p className="text-sm text-muted-foreground">Temporary MVP checkout. No real payment provider is connected.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryItem label="Business" value={registration.businessName} />
                <SummaryItem label="Business email" value={registration.businessEmail} />
                <SummaryItem label="Website" value={registration.websiteUrl} />
                <SummaryItem label="Plan" value={plan.name} />
                <SummaryItem label="Duration" value={`${plan.durationMonths} month${plan.durationMonths > 1 ? "s" : ""}`} />
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                This is a temporary MVP payment flow. Real payment provider integration will be added later.
              </div>
              <div className="rounded-md border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total due today</p>
                    <p className="text-4xl font-semibold">{formatPlanPrice(plan)}</p>
                  </div>
                  <StatusBadge status={registration.paymentStatus} />
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={() => paymentMutation.mutate()} disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? "Processing..." : "Complete Payment"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LockKeyhole className="h-5 w-5 text-emerald-600" />
                What happens next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>Subscription and payment records are created.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>Tenant onboarding status becomes PENDING_ADMIN_APPROVAL.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>The customer dashboard opens so knowledge documents can be uploaded.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ReceiptText className="h-5 w-5 text-primary" />
                Email notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Registration received</p>
              <p>Payment successful</p>
              <p>Admin approval pending</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
