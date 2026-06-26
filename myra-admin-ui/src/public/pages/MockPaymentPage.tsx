import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, LockKeyhole, ReceiptText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { completeMockPayment, getBusinessRegistration } from "@/features/onboarding/onboarding.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { PublicNav } from "@/public/pages/PublicLandingPage";

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
      <main className="min-h-screen bg-background">
        <PublicNav />
        <section className="public-section">
          <div className="public-container max-w-3xl px-4 py-12">
            <div className="public-card p-6">
              <h3 className="text-lg font-semibold leading-none tracking-normal">Registration not found</h3>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const registration = registrationQuery.data;
  const plan = getSubscriptionPlan(registration.selectedSubscriptionPlan);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <section className="public-section">
        <div className="public-container grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="public-icon-box h-11 w-11">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">Mock payment</h1>
              <p className="text-sm text-muted-foreground">Temporary MVP checkout. No real payment provider is connected.</p>
            </div>
          </div>

          <div className="public-card p-6">
            <h3 className="text-lg font-semibold leading-none tracking-normal">Payment Summary</h3>
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryItem label="Business" value={registration.businessName} />
                <SummaryItem label="Business email" value={registration.businessEmail} />
                <SummaryItem label="Website" value={registration.websiteUrl} />
                <SummaryItem label="Plan" value={plan.name} />
                <SummaryItem label="Duration" value={`${plan.durationMonths} month${plan.durationMonths > 1 ? "s" : ""}`} />
              </div>
              <div className="rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
                This is a temporary MVP payment flow. Real payment provider integration will be added later.
              </div>
              <div className="rounded-md border border-[var(--color-border)] bg-muted p-4">
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
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="public-card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold leading-none tracking-normal">
              <LockKeyhole className="h-5 w-5 text-[var(--color-success)]" />
              What happens next
            </h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <p>Subscription and payment records are created.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <p>Tenant onboarding status becomes PENDING_ADMIN_APPROVAL.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <p>The customer dashboard opens so knowledge documents can be uploaded.</p>
              </div>
            </div>
          </div>

          <div className="public-card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold leading-none tracking-normal">
              <ReceiptText className="h-5 w-5 text-primary" />
              Email notifications
            </h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Registration received</p>
              <p>Payment successful</p>
              <p>Admin approval pending</p>
            </div>
          </div>
        </aside>
      </div>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
