import type {
  DocumentProcessingStatus,
  OnboardingStatus,
  ApprovalStatus,
  PaymentStatus,
  SubscriptionPlanId,
  SubscriptionStatus
} from "@/features/tenants/tenant.types";
import type { KnowledgeSource } from "@/features/knowledge/knowledge.types";
import type { Tenant } from "@/features/tenants/tenant.types";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  durationMonths: number;
  priceUsd: number;
  renewalCadence: string;
};

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

export type BusinessRegistration = BusinessRegistrationInput & {
  id: string;
  tenantId?: string;
  onboardingStatus: OnboardingStatus;
  approvalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paidAt?: string;
};

export type PaymentRecord = {
  id: string;
  tenantId: string;
  registrationId: string;
  provider: "MOCK";
  status: "SUCCESS" | "FAILED";
  amountUsd: number;
  currency: "USD";
  planId?: SubscriptionPlanId;
  transactionId: string;
  paidAt: string;
};

export type SubscriptionRecord = {
  id: string;
  tenantId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  amountUsd: number;
  startedAt: string;
  renewsAt: string;
  renewalReminderAt: string;
};

export type MockPaymentIntent = {
  id: string;
  registrationId: string;
  amountUsd: number;
  currency: "USD";
  status: "INITIATED";
};

export type NotificationType =
  | "REGISTRATION_RECEIVED"
  | "PAYMENT_SUCCESSFUL"
  | "ADMIN_APPROVAL_PENDING"
  | "ASSISTANT_APPROVED"
  | "EMBED_CODE_READY"
  | "DOCUMENT_PROCESSING_COMPLETED"
  | "SUBSCRIPTION_RENEWAL_REMINDER";

export type NotificationEvent = {
  id: string;
  tenantId?: string;
  registrationId?: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  status: "QUEUED" | "SENT" | "SCHEDULED";
  createdAt: string;
  sendAt?: string;
};

export type MockPaymentResult = {
  tenantId: string;
  registration: BusinessRegistration;
  payment: PaymentRecord;
  subscription: SubscriptionRecord;
};

export type ApprovalDecision = {
  reason?: string;
};

export type DocumentStatusUpdate = {
  status: DocumentProcessingStatus;
  notes?: string;
};

export type TenantReview = {
  tenant: Tenant;
  subscription: SubscriptionRecord | null;
  payment: PaymentRecord | null;
  documents: KnowledgeSource[];
  notifications: NotificationEvent[];
};
