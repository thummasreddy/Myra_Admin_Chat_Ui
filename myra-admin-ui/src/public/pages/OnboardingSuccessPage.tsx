import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, MailCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DOCUMENT_REVIEW_MESSAGE } from "@/features/onboarding/onboarding.data";
import { getBusinessRegistration } from "@/features/onboarding/onboarding.api";
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
      <section className="public-section">
        <div className="public-container max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="public-card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-success-bg)] text-[var(--color-success)]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-semibold tracking-normal">Registration and payment completed successfully.</h2>
            <div className="mt-5 space-y-5">
              <p className="text-muted-foreground">
                Your Myra Assistant is now pending admin approval. After approval, your embed code will be emailed to your
                registered business email{registrationQuery.data?.businessEmail ? ` (${registrationQuery.data.businessEmail})` : ""}.
              </p>
              <div className="rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
                Please log in to your customer dashboard to upload your knowledge documents. {DOCUMENT_REVIEW_MESSAGE}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
                  <MailCheck className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">Approval emails</p>
                  <p className="mt-1 text-sm text-muted-foreground">Payment and approval-pending emails have been queued.</p>
                </div>
                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
                  <FileText className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">Knowledge upload</p>
                  <p className="mt-1 text-sm text-muted-foreground">Upload documents from the customer dashboard.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/customer/dashboard">Log In To Customer Dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Back To Website</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
