import type { SubscriptionPlan, SubscriptionPlanId } from "@/features/tenants/tenant.types";

export const DOCUMENT_REVIEW_MESSAGE =
  "Documents are reviewed within 3 business days. The assistant is activated only after admin approval.";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "MONTHLY",
    name: "Monthly",
    monthlyPrice: 49,
    durationMonths: 1,
    renewalCadence: "Billed monthly"
  },
  {
    id: "THREE_MONTHS",
    name: "3 Months",
    monthlyPrice: 45,
    durationMonths: 3,
    renewalCadence: "Billed every 3 months"
  },
  {
    id: "SIX_MONTHS",
    name: "6 Months",
    monthlyPrice: 40,
    durationMonths: 6,
    renewalCadence: "Billed every 6 months"
  },
  {
    id: "TWELVE_MONTHS",
    name: "12 Months",
    monthlyPrice: 35,
    durationMonths: 12,
    renewalCadence: "Billed annually"
  }
];

export function getSubscriptionPlan(planId: SubscriptionPlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) ?? SUBSCRIPTION_PLANS[0];
}

export function formatPlanPrice(plan: SubscriptionPlan): string {
  const total = plan.monthlyPrice * plan.durationMonths;
  return `$${total}`;
}
