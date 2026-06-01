import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOCUMENT_REVIEW_MESSAGE, formatPlanPrice } from "@/features/onboarding/onboarding.data";
import { listSubscriptionPlans } from "@/features/onboarding/onboarding.api";
import { PublicNav } from "@/features/public/pages/PublicLandingPage";

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
    <main className="min-h-screen bg-white text-slate-950">
      <PublicNav />
      <section className="border-b bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal sm:text-5xl">Pricing</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Monthly, 3 Months, 6 Months, and 12 Months plans include the same features for the MVP. Plans only differ by price.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {DOCUMENT_REVIEW_MESSAGE}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.renewalCadence}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-4xl font-semibold">{formatPlanPrice(plan)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Duration: {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}</p>
                <div className="mt-6 space-y-3">
                  {included.map((item) => (
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
