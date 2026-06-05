import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bot, CheckCircle2, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOCUMENT_REVIEW_MESSAGE, formatPlanPrice, SUBSCRIPTION_PLANS } from "@/features/onboarding/onboarding.data";
import { listSubscriptionPlans } from "@/features/onboarding/onboarding.api";
import { pricingIncludedFeatures } from "@/features/onboarding/onboarding.copy";
import { PublicNav } from "@/features/public/pages/PublicLandingPage";

const SELECTED_PLAN_STORAGE_KEY = "myra-selected-plan";

const planCapabilities = {
  MONTHLY: ["2,000 messages/month", "5 knowledge documents", "Lead capture", "Basic analytics", "Email support"],
  THREE_MONTHS: ["7,500 messages/term", "20 knowledge documents", "Lead capture", "Product recommendations", "Priority email support"],
  SIX_MONTHS: ["18,000 messages/term", "50 knowledge documents", "Web search ready", "Payment assistant ready", "Advanced analytics"],
  TWELVE_MONTHS: ["Custom message limits", "Unlimited knowledge documents", "Payment assistant ready", "Analytics reviews", "Admin launch support"]
};

export function PricingPage() {
  const plansQuery = useQuery({ queryKey: ["subscription-plans"], queryFn: listSubscriptionPlans });
  const plans = plansQuery.data ?? SUBSCRIPTION_PLANS;

  return (
    <main className="min-h-screen bg-[#222831] text-white">
      <PublicNav />
      <section className="public-pricing-hero border-b px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
              <Bot className="h-6 w-6" />
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/90">
              <Sparkles className="h-4 w-4" />
              Same features in every MVP plan
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl">Choose the plan duration that fits your business</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Start with Myra AI Assistant, customer dashboard access, knowledge document upload, admin-reviewed activation,
              lead capture support, and embed code delivery after approval. For MVP, plans differ only by price and duration.
            </p>
          </div>
          <div className="public-value-tile rounded-md p-5">
            <p className="text-sm font-semibold text-white">Activation path</p>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span>Register and complete mock payment</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span>Upload documents from the dashboard after login</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span>Embed code appears only after admin approval</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Activation happens after registration, payment, knowledge document upload, review, and approval. {DOCUMENT_REVIEW_MESSAGE}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <Card key={plan.id} className={`public-card public-plan-card flex flex-col ${index === 3 ? "border-primary/40" : ""}`}>
              <CardHeader>
                {index === 3 ? (
                  <div className="mb-2 w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Longest duration
                  </div>
                ) : null}
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.renewalCadence}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-4xl font-semibold">{formatPlanPrice(plan)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Duration: {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}</p>
                <div className="mt-6 space-y-3">
                  {[...planCapabilities[plan.id], ...pricingIncludedFeatures.slice(0, 4)].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
