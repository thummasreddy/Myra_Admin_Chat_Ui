import type { SubscriptionPlanId } from "@/features/tenants/tenant.types";

export type BusinessRegistrationInput = {
  businessName: string;
  websiteUrl: string;
  businessEmail: string;
  phoneNumber: string;
  industry: string;
  assistantName: string;
  brandColor: string;
  businessDescription: string;
  fallbackMessage: string;
  selectedSubscriptionPlan: SubscriptionPlanId;
};

export type BusinessRegistration = {
  id: string;
  businessName: string;
  websiteUrl: string;
  businessEmail: string;
  phoneNumber: string;
  industry: string;
  assistantName: string;
  brandColor: string;
  businessDescription: string;
  fallbackMessage: string;
  selectedSubscriptionPlan: SubscriptionPlanId;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

export type MockPaymentResult = {
  tenantId: string;
  registrationId: string;
  paymentStatus: string;
};
