export type SubscriptionPlanId = "MONTHLY" | "THREE_MONTHS" | "SIX_MONTHS" | "TWELVE_MONTHS";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  monthlyPrice: number;
  durationMonths: number;
  renewalCadence: string;
};
