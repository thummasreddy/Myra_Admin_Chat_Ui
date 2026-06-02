import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import { DOCUMENT_REVIEW_MESSAGE, getSubscriptionPlan, SUBSCRIPTION_PLANS } from "@/features/onboarding/onboarding.data";
import { emailTemplates } from "@/features/onboarding/onboarding.copy";
import type {
  ApprovalDecision,
  BusinessRegistration,
  BusinessRegistrationInput,
  DocumentStatusUpdate,
  MockPaymentResult,
  MockPaymentIntent,
  NotificationEvent,
  PaymentRecord,
  SubscriptionPlan,
  SubscriptionRecord,
  TenantReview
} from "@/features/onboarding/onboarding.types";
import { readFallbackTenants, writeFallbackTenants } from "@/features/tenants/tenant.api";
import type { Tenant } from "@/features/tenants/tenant.types";
import { listKnowledgeSources } from "@/features/knowledge/knowledge.api";

const REGISTRATION_STORAGE_KEY = "myra-admin-fallback-registrations";
const PAYMENT_STORAGE_KEY = "myra-admin-fallback-payments";
const SUBSCRIPTION_STORAGE_KEY = "myra-admin-fallback-subscriptions";
const NOTIFICATION_STORAGE_KEY = "myra-admin-fallback-notifications";

function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

function tenantIdFromName(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `tenant_${slug}_${Date.now().toString().slice(-5)}`;
}

function addMonths(value: Date, months: number) {
  const next = new Date(value);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function notificationSubject(type: NotificationEvent["type"]) {
  return emailTemplates[type].subject;
}

function readRegistrations() {
  return readStorage<BusinessRegistration[]>(REGISTRATION_STORAGE_KEY, []);
}

function writeRegistrations(registrations: BusinessRegistration[]) {
  writeStorage(REGISTRATION_STORAGE_KEY, registrations);
}

function readPayments() {
  return readStorage<PaymentRecord[]>(PAYMENT_STORAGE_KEY, []);
}

function writePayments(payments: PaymentRecord[]) {
  writeStorage(PAYMENT_STORAGE_KEY, payments);
}

function readSubscriptions() {
  return readStorage<SubscriptionRecord[]>(SUBSCRIPTION_STORAGE_KEY, []);
}

function writeSubscriptions(subscriptions: SubscriptionRecord[]) {
  writeStorage(SUBSCRIPTION_STORAGE_KEY, subscriptions);
}

function readNotifications() {
  return readStorage<NotificationEvent[]>(NOTIFICATION_STORAGE_KEY, []);
}

function writeNotifications(notifications: NotificationEvent[]) {
  writeStorage(NOTIFICATION_STORAGE_KEY, notifications);
}

function recordNotification(input: Omit<NotificationEvent, "id" | "subject" | "createdAt">) {
  const notification: NotificationEvent = {
    ...input,
    id: id("email"),
    subject: notificationSubject(input.type),
    body: emailTemplates[input.type].body,
    createdAt: new Date().toISOString()
  };
  writeNotifications([notification, ...readNotifications()]);
  return notification;
}

function createEmbedCode(tenantId: string) {
  return `<script
  src="https://cdn.myra.ai/widget.js"
  data-tenant-id="${tenantId}"
  data-api-key="PUBLIC_WIDGET_KEY">
</script>`;
}

function buildTenantFromRegistration(registration: BusinessRegistration, tenantId: string, now: string): Tenant {
  return {
    tenantId,
    apiKey: `mk_live_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
    tenantName: registration.businessName,
    websiteUrl: registration.websiteUrl,
    industry: registration.industry,
    supportEmail: registration.businessEmail,
    businessEmail: registration.businessEmail,
    phoneNumber: registration.phoneNumber,
    businessDescription: registration.businessDescription,
    country: "United States",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix",
    assistantName: registration.assistantName,
    assistantIntro: `Hi, I am ${registration.assistantName}, the AI assistant for ${registration.businessName}.`,
    brandColor: registration.brandColor,
    chatPosition: "bottom-right",
    systemPrompt: `You are ${registration.assistantName}, a helpful AI assistant for ${registration.businessName}. Business context: ${registration.businessDescription}`,
    responseStyle: "professional",
    allowedTopics: [registration.industry, "services", "pricing", "support"],
    blockedTopics: ["medical diagnosis", "legal advice", "financial advice"],
    fallbackMessage: registration.fallbackMessage,
    suggestedPrompts: ["What services do you offer?", "How can I contact the team?", "What should I know before getting started?"],
    enableWebSearch: false,
    enableLeadCapture: true,
    enableSuggestedPrompts: true,
    enableAnalytics: true,
    enableHumanEscalation: true,
    status: "PAYMENT_PENDING",
    onboardingStatus: "PAYMENT_PENDING",
    approvalStatus: "NOT_SUBMITTED",
    selectedSubscriptionPlan: registration.selectedSubscriptionPlan,
    paymentStatus: "PENDING",
    subscriptionStatus: "PENDING_PAYMENT",
    documentProcessingStatus: "NOT_UPLOADED",
    createdAt: now,
    updatedAt: now
  };
}

function upsertTenant(tenant: Tenant) {
  const tenants = readFallbackTenants();
  const exists = tenants.some((item) => item.tenantId === tenant.tenantId);
  writeFallbackTenants(exists ? tenants.map((item) => (item.tenantId === tenant.tenantId ? tenant : item)) : [tenant, ...tenants]);
}

function deriveSubscription(tenant: Tenant): SubscriptionRecord {
  const plan = getSubscriptionPlan(tenant.selectedSubscriptionPlan);
  const startedAt = tenant.approvedAt ?? tenant.createdAt;
  const renewsAt = addMonths(new Date(startedAt), plan.durationMonths).toISOString();
  return {
    id: `sub_${tenant.tenantId}`,
    tenantId: tenant.tenantId,
    planId: plan.id,
    status: tenant.subscriptionStatus ?? "ACTIVE",
    amountUsd: plan.priceUsd,
    startedAt,
    renewsAt,
    renewalReminderAt: addDays(new Date(renewsAt), -7).toISOString()
  };
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data } = await apiClient.get<SubscriptionPlan[]>("/subscriptions/plans");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return SUBSCRIPTION_PLANS;
  }
}

export async function createBusinessRegistration(payload: BusinessRegistrationInput): Promise<BusinessRegistration> {
  try {
    const { data } = await apiClient.post<BusinessRegistration>("/onboarding/register", payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenantId = tenantIdFromName(payload.businessName);
    const registration: BusinessRegistration = {
      ...payload,
      id: id("reg"),
      tenantId,
      onboardingStatus: "PAYMENT_PENDING",
      approvalStatus: "NOT_SUBMITTED",
      paymentStatus: "PENDING",
      createdAt: new Date().toISOString()
    };
    const tenant = buildTenantFromRegistration(registration, tenantId, registration.createdAt);
    const plan = getSubscriptionPlan(registration.selectedSubscriptionPlan);
    const renewsAt = addMonths(new Date(registration.createdAt), plan.durationMonths).toISOString();
    const subscription: SubscriptionRecord = {
      id: id("sub"),
      tenantId,
      planId: plan.id,
      status: "PENDING_PAYMENT",
      amountUsd: plan.priceUsd,
      startedAt: registration.createdAt,
      renewsAt,
      renewalReminderAt: addDays(new Date(renewsAt), -7).toISOString()
    };
    upsertTenant(tenant);
    writeSubscriptions([subscription, ...readSubscriptions()]);
    writeRegistrations([registration, ...readRegistrations()]);
    recordNotification({
      registrationId: registration.id,
      type: "REGISTRATION_RECEIVED",
      recipient: registration.businessEmail,
      status: "QUEUED"
    });
    return registration;
  }
}

export async function getBusinessRegistration(registrationId: string): Promise<BusinessRegistration> {
  try {
    const { data } = await apiClient.get<BusinessRegistration>(`/onboarding/registrations/${registrationId}`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const registration = readRegistrations().find((item) => item.id === registrationId);
    if (!registration) throw new Error("Registration not found");
    return registration;
  }
}

export async function completeMockPayment(registrationId: string): Promise<MockPaymentResult> {
  try {
    const intent = await apiClient.post<MockPaymentIntent>("/payments/mock/initiate", { registrationId });
    const { data } = await apiClient.post<MockPaymentResult>("/payments/mock/confirm", { paymentIntentId: intent.data.id, registrationId });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;

    const registrations = readRegistrations();
    const registration = registrations.find((item) => item.id === registrationId);
    if (!registration) throw new Error("Registration not found");

    if (registration.tenantId) {
      const existingPayment = readPayments().find((payment) => payment.registrationId === registration.id);
      const existingSubscription = readSubscriptions().find((subscription) => subscription.tenantId === registration.tenantId);
      if (existingPayment && existingSubscription) {
        return { tenantId: registration.tenantId, registration, payment: existingPayment, subscription: existingSubscription };
      }
    }

    const now = new Date();
    const paidAt = now.toISOString();
    const tenantId = registration.tenantId ?? tenantIdFromName(registration.businessName);
    const plan = getSubscriptionPlan(registration.selectedSubscriptionPlan);
    const existingTenant = readFallbackTenants().find((item) => item.tenantId === tenantId);
    const tenant: Tenant = {
      ...(existingTenant ?? buildTenantFromRegistration(registration, tenantId, paidAt)),
      status: "PENDING_ADMIN_APPROVAL",
      onboardingStatus: "PENDING_ADMIN_APPROVAL",
      approvalStatus: "PENDING_REVIEW",
      paymentStatus: "SUCCESS",
      subscriptionStatus: "PENDING_ADMIN_APPROVAL",
      updatedAt: paidAt
    };
    const payment: PaymentRecord = {
      id: id("pay"),
      tenantId,
      registrationId,
      provider: "MOCK",
      status: "SUCCESS",
      amountUsd: plan.priceUsd,
      currency: "USD",
      planId: plan.id,
      transactionId: `MOCK-${Date.now()}`,
      paidAt
    };
    const renewsAt = addMonths(now, plan.durationMonths).toISOString();
    const subscription: SubscriptionRecord = {
      id: id("sub"),
      tenantId,
      planId: plan.id,
      status: "PENDING_ADMIN_APPROVAL",
      amountUsd: plan.priceUsd,
      startedAt: paidAt,
      renewsAt,
      renewalReminderAt: addDays(new Date(renewsAt), -7).toISOString()
    };
    const updatedRegistration: BusinessRegistration = {
      ...registration,
      tenantId,
      onboardingStatus: "PENDING_ADMIN_APPROVAL",
      approvalStatus: "PENDING_REVIEW",
      paymentStatus: "SUCCESS",
      paidAt
    };

    upsertTenant(tenant);
    writePayments([payment, ...readPayments()]);
    writeSubscriptions([subscription, ...readSubscriptions().filter((item) => item.tenantId !== tenantId)]);
    writeRegistrations(registrations.map((item) => (item.id === registration.id ? updatedRegistration : item)));
    recordNotification({ tenantId, registrationId, type: "PAYMENT_SUCCESSFUL", recipient: registration.businessEmail, status: "QUEUED" });
    recordNotification({ tenantId, registrationId, type: "ADMIN_APPROVAL_PENDING", recipient: registration.businessEmail, status: "QUEUED" });
    recordNotification({
      tenantId,
      registrationId,
      type: "SUBSCRIPTION_RENEWAL_REMINDER",
      recipient: registration.businessEmail,
      status: "SCHEDULED",
      sendAt: subscription.renewalReminderAt
    });

    return { tenantId, registration: updatedRegistration, payment, subscription };
  }
}

export async function getSubscriptionForTenant(tenantId: string): Promise<SubscriptionRecord | null> {
  try {
    const { data } = await apiClient.get<SubscriptionRecord | null>(`/admin/tenants/${tenantId}/subscription`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const subscription = readSubscriptions().find((item) => item.tenantId === tenantId);
    if (subscription) return subscription;
    const tenant = readFallbackTenants().find((item) => item.tenantId === tenantId);
    return tenant ? deriveSubscription(tenant) : null;
  }
}

export async function getPaymentForTenant(tenantId: string): Promise<PaymentRecord | null> {
  try {
    const { data } = await apiClient.get<PaymentRecord | null>(`/admin/tenants/${tenantId}/payment`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return readPayments().find((item) => item.tenantId === tenantId) ?? null;
  }
}

export async function listNotificationEvents(tenantId?: string): Promise<NotificationEvent[]> {
  try {
    const { data } = await apiClient.get<NotificationEvent[]>("/admin/email-notifications", { params: { tenantId } });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return readNotifications().filter((event) => !tenantId || event.tenantId === tenantId);
  }
}

export async function listApprovalTenants(): Promise<Tenant[]> {
  try {
    const { data } = await apiClient.get<Tenant[]>("/admin/tenants/pending-approval");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return readFallbackTenants().filter((tenant) =>
      ["PAYMENT_PENDING", "PENDING_ADMIN_APPROVAL", "ACTIVE", "APPROVED", "REJECTED"].includes(tenant.status)
    );
  }
}

export async function getTenantReview(tenantId: string): Promise<TenantReview> {
  try {
    const { data } = await apiClient.get<TenantReview>(`/admin/tenants/${tenantId}/review`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenant = readFallbackTenants().find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const [documents, subscription, payment, notifications] = await Promise.all([
      listKnowledgeSources(tenantId),
      getSubscriptionForTenant(tenantId),
      getPaymentForTenant(tenantId),
      listNotificationEvents(tenantId)
    ]);
    return { tenant, documents, subscription, payment, notifications };
  }
}

export async function listAdminPayments(): Promise<PaymentRecord[]> {
  try {
    const { data } = await apiClient.get<PaymentRecord[]>("/admin/payments");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return readPayments();
  }
}

export async function listAdminSubscriptions(): Promise<SubscriptionRecord[]> {
  try {
    const { data } = await apiClient.get<SubscriptionRecord[]>("/admin/subscriptions");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const explicitSubscriptions = readSubscriptions();
    const derived = readFallbackTenants()
      .filter((tenant) => !explicitSubscriptions.some((subscription) => subscription.tenantId === tenant.tenantId))
      .map(deriveSubscription);
    return [...explicitSubscriptions, ...derived];
  }
}

export async function regenerateEmbedCode(tenantId: string): Promise<Tenant> {
  try {
    const { data } = await apiClient.post<Tenant>(`/admin/tenants/${tenantId}/embed-code/regenerate`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenants = readFallbackTenants();
    const tenant = tenants.find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const updatedTenant = {
      ...tenant,
      embedCode: createEmbedCode(tenantId),
      updatedAt: new Date().toISOString()
    };
    writeFallbackTenants(tenants.map((item) => (item.tenantId === tenantId ? updatedTenant : item)));
    return updatedTenant;
  }
}

export async function approveTenant(tenantId: string): Promise<Tenant> {
  try {
    const { data } = await apiClient.post<Tenant>(`/admin/tenants/${tenantId}/approve`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenants = readFallbackTenants();
    const tenant = tenants.find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    if (tenant.paymentStatus !== "SUCCESS" && tenant.paymentStatus !== "PAID") {
      throw new Error("Cannot approve an unpaid tenant");
    }
    const now = new Date().toISOString();
    const updatedTenant: Tenant = {
      ...tenant,
      status: "ACTIVE",
      onboardingStatus: "APPROVED",
      approvalStatus: "APPROVED",
      subscriptionStatus: "ACTIVE",
      embedCode: tenant.embedCode ?? createEmbedCode(tenant.tenantId),
      embedCodeEmailSentAt: now,
      approvedAt: now,
      updatedAt: now
    };
    writeFallbackTenants(tenants.map((item) => (item.tenantId === tenantId ? updatedTenant : item)));
    const subscriptions = readSubscriptions();
    writeSubscriptions(
      subscriptions.map((subscription) =>
        subscription.tenantId === tenantId ? { ...subscription, status: "ACTIVE" } : subscription
      )
    );
    recordNotification({
      tenantId,
      type: "ASSISTANT_APPROVED",
      recipient: tenant.businessEmail ?? tenant.supportEmail,
      status: "QUEUED"
    });
    recordNotification({
      tenantId,
      type: "EMBED_CODE_READY",
      recipient: tenant.businessEmail ?? tenant.supportEmail,
      status: "QUEUED"
    });
    return updatedTenant;
  }
}

export async function rejectTenant(tenantId: string, decision?: ApprovalDecision): Promise<Tenant> {
  try {
    const { data } = await apiClient.post<Tenant>(`/admin/tenants/${tenantId}/reject`, decision ?? {});
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenants = readFallbackTenants();
    const tenant = tenants.find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const now = new Date().toISOString();
    const updatedTenant: Tenant = {
      ...tenant,
      status: "REJECTED",
      onboardingStatus: "REJECTED",
      approvalStatus: "REJECTED",
      rejectedAt: now,
      rejectedReason: decision?.reason,
      updatedAt: now
    };
    writeFallbackTenants(tenants.map((item) => (item.tenantId === tenantId ? updatedTenant : item)));
    return updatedTenant;
  }
}

export async function triggerEmbedCodeEmail(tenantId: string): Promise<Tenant> {
  try {
    const { data } = await apiClient.post<Tenant>(`/admin/tenants/${tenantId}/embed-code/email`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenants = readFallbackTenants();
    const tenant = tenants.find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const now = new Date().toISOString();
    const updatedTenant: Tenant = {
      ...tenant,
      embedCode: tenant.embedCode ?? createEmbedCode(tenant.tenantId),
      embedCodeEmailSentAt: now,
      updatedAt: now
    };
    writeFallbackTenants(tenants.map((item) => (item.tenantId === tenantId ? updatedTenant : item)));
    recordNotification({
      tenantId,
      type: "EMBED_CODE_READY",
      recipient: tenant.businessEmail ?? tenant.supportEmail,
      status: "SENT"
    });
    return updatedTenant;
  }
}

export async function updateTenantDocumentStatus(tenantId: string, payload: DocumentStatusUpdate): Promise<Tenant> {
  try {
    const { data } = await apiClient.patch<Tenant>(`/admin/tenants/${tenantId}/documents/status`, payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const tenants = readFallbackTenants();
    const tenant = tenants.find((item) => item.tenantId === tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const updatedTenant: Tenant = {
      ...tenant,
      documentProcessingStatus: payload.status,
      updatedAt: new Date().toISOString()
    };
    writeFallbackTenants(tenants.map((item) => (item.tenantId === tenantId ? updatedTenant : item)));
    if (payload.status === "READY" || payload.status === "COMPLETED") {
      recordNotification({
        tenantId,
        type: "DOCUMENT_PROCESSING_COMPLETED",
        recipient: tenant.businessEmail ?? tenant.supportEmail,
        status: "QUEUED"
      });
    }
    return updatedTenant;
  }
}

export const documentReviewMessage = DOCUMENT_REVIEW_MESSAGE;
