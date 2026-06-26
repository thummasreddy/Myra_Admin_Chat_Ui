import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DOCUMENT_REVIEW_MESSAGE, formatPlanPrice } from "@/features/onboarding/onboarding.data";
import { listSubscriptionPlans } from "@/features/onboarding/onboarding.api";
import { PublicNav } from "@/public/pages/PublicLandingPage";

const included = [
  "Myra AI Assistant widget",
  "Customer dashboard",
  "Knowledge document upload",
  "Admin-reviewed activation",
  "Embed code after approval",
  "Basic analytics"
];

const SELECTED_PLAN_STORAGE_KEY = "myra-selected-plan";

export function PricingPage() {
  const plansQuery = useQuery({ queryKey: ["subscription-plans"], queryFn: listSubscriptionPlans });
  const plans = plansQuery.data ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <section className="public-pricing-hero border-b px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="public-container">
          <div className="public-icon-box h-12 w-12">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal sm:text-5xl">Pricing</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Monthly, 3 Months, 6 Months, and 12 Months plans include the same features for the MVP. Plans only differ by price.
          </p>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
            {DOCUMENT_REVIEW_MESSAGE}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div key={plan.id} className="public-card public-plan-card flex flex-col p-6">
                <h3 className="text-lg font-semibold leading-none tracking-normal">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.renewalCadence}</p>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="text-4xl font-semibold">{formatPlanPrice(plan)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Duration: {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}</p>
                  <div className="mt-6 space-y-3">
                    {included.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild className="mt-6">
                    <Link to={`/register?plan=${plan.id}`} onClick={() => localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, plan.id)}>
                      Choose Plan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
