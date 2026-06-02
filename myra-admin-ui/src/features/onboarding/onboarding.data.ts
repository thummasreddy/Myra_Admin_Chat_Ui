import type { SubscriptionPlan } from "@/features/onboarding/onboarding.types";
import type { SubscriptionPlanId } from "@/features/tenants/tenant.types";

export const DOCUMENT_REVIEW_MESSAGE = "Documents are usually reviewed and processed within 3 business days.";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "MONTHLY", name: "Starter", durationMonths: 1, priceUsd: 49, renewalCadence: "Renews monthly" },
  { id: "THREE_MONTHS", name: "Growth", durationMonths: 3, priceUsd: 129, renewalCadence: "Renews every 3 months" },
  { id: "SIX_MONTHS", name: "Pro", durationMonths: 6, priceUsd: 239, renewalCadence: "Renews every 6 months" },
  { id: "TWELVE_MONTHS", name: "Enterprise", durationMonths: 12, priceUsd: 449, renewalCadence: "Renews yearly" }
];

export function getSubscriptionPlan(planId?: SubscriptionPlanId) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) ?? SUBSCRIPTION_PLANS[0];
}

export function formatPlanPrice(plan: SubscriptionPlan) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(plan.priceUsd);
}
