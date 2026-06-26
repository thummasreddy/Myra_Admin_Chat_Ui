import { createApiClient } from "@/lib/apiClient";
import { appConfig } from "@/lib/config";
import { SUBSCRIPTION_PLANS } from "@/features/onboarding/onboarding.data";
import type { BusinessRegistration, BusinessRegistrationInput, MockPaymentResult } from "@/features/onboarding/onboarding.types";
import type { SubscriptionPlan } from "@/features/tenants/tenant.types";

function apiV1Url(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/v1")) return normalized;
  return `${normalized}/api/v1`;
}

const publicClient = createApiClient(apiV1Url(appConfig.VITE_API_BASE_URL));

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await publicClient.get<SubscriptionPlan[]>("/public/plans");
  return data;
}

export async function createBusinessRegistration(
  input: BusinessRegistrationInput
): Promise<BusinessRegistration> {
  const { data } = await publicClient.post<BusinessRegistration>("/public/registrations", input);
  return data;
}

export async function getBusinessRegistration(registrationId: string): Promise<BusinessRegistration> {
  const { data } = await publicClient.get<BusinessRegistration>(
    `/public/registrations/${registrationId}`
  );
  return data;
}

export async function completeMockPayment(registrationId: string): Promise<MockPaymentResult> {
  const { data } = await publicClient.post<MockPaymentResult>(
    `/public/registrations/${registrationId}/mock-payment`
  );
  return data;
}

export { SUBSCRIPTION_PLANS };
