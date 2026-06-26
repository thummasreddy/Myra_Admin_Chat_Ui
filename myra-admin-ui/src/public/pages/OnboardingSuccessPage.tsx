import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, MailCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DOCUMENT_REVIEW_MESSAGE } from "@/features/onboarding/onboarding.data";
import { getBusinessRegistration } from "@/features/onboarding/onboarding.api";
import { customerDashboardMessages } from "@/features/onboarding/onboarding.copy";
import { PublicNav } from "@/public/pages/PublicLandingPage";

export function OnboardingSuccessPage() {
  const { registrationId = "" } = useParams();
  const registrationQuery = useQuery({
    queryKey: ["business-registration", registrationId],
    queryFn: () => getBusinessRegistration(registrationId),
    enabled: Boolean(registrationId)
  });

  if (registrationQuery.isLoading) return <LoadingSpinner label="Loading onboarding status" />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <section className="public-pricing-hero border-b px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-[var(--color-success)]/15 text-[var(--color-success)] dark:bg-emerald-500/15 dark:text-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">Payment successful.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Your business assistant setup is now pending admin approval. Our admin team will review your business details
            and documents. Once approved, your embed code will be emailed to you
            {registrationQuery.data?.businessEmail ? ` at ${registrationQuery.data.businessEmail}` : ""}.
          </p>
        </div>
      </section>

      <section className="public-section mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="public-card">
          <CardHeader>
            <CardTitle className="text-2xl tracking-normal">What to do next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground">
              Log in to your customer dashboard, upload your knowledge documents, and monitor onboarding status while the
              Myra team completes review.
            </p>
            <div className="rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
              Tenant status: PENDING_ADMIN_APPROVAL.
            </div>
            <StatusTimeline />
            <div className="rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
              Please log in to your customer dashboard to upload your knowledge documents. {customerDashboardMessages.knowledgeUpload}{" "}
              {DOCUMENT_REVIEW_MESSAGE}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-primary/15 bg-card p-4">
                <MailCheck className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Approval emails</p>
                <p className="mt-1 text-sm text-muted-foreground">Payment and approval-pending emails have been queued.</p>
              </div>
              <div className="rounded-md border border-primary/15 bg-card p-4">
                <FileText className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Knowledge upload</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload documents from the customer dashboard.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(200,154,75,0.24)] hover:bg-accent/90 hover:shadow-[0_16px_36px_rgba(200,154,75,0.28)]">
                <Link to="/customer/dashboard">Log In To Customer Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Back To Website</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatusTimeline() {
  const steps = [
    "Payment completed",
    "Business details submitted",
    "Documents under review",
    "Admin approval pending",
    "Embed code will be emailed after approval"
  ];

  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3 rounded-md border bg-card p-3 text-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </div>
          <span className="font-medium text-foreground">{step}</span>
        </div>
      ))}
    </div>
  );
}
