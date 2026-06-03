import type { CHAT_POSITIONS, RESPONSE_STYLES, TENANT_STATUSES } from "@/lib/constants";

export type TenantStatus = (typeof TENANT_STATUSES)[number];
export type ChatPosition = (typeof CHAT_POSITIONS)[number];
export type ResponseStyle = (typeof RESPONSE_STYLES)[number];

export type SubscriptionPlanId = "MONTHLY" | "THREE_MONTHS" | "SIX_MONTHS" | "TWELVE_MONTHS";
export type PaymentStatus = "PENDING" | "PAID" | "SUCCESS" | "FAILED";
export type SubscriptionStatus = "PENDING_PAYMENT" | "PENDING_ADMIN_APPROVAL" | "ACTIVE" | "PAST_DUE" | "CANCELED";
export type DocumentProcessingStatus =
  | "NOT_UPLOADED"
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED";
export type OnboardingStatus = "PAYMENT_PENDING" | "PENDING_ADMIN_APPROVAL" | "APPROVED" | "REJECTED";
export type ApprovalStatus = "NOT_SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type TenantFeatureToggles = {
  enableWebSearch: boolean;
  enableLeadCapture: boolean;
  enableSuggestedPrompts: boolean;
  enableAnalytics: boolean;
  enableHumanEscalation: boolean;
};

export type TenantAiBehaviorCaptureSettings = {
  enableMultiTurnMemory?: boolean;
  enableStructuredExtraction?: boolean;
  enableOrderCapture?: boolean;
  enableAppointmentCapture?: boolean;
  enableConversationSummary?: boolean;
  sessionExpirationMinutes?: number;
  leadRequiredFields?: string[];
  orderRequiredFields?: string[];
  appointmentRequiredFields?: string[];
};

export type TenantCreateRequest = TenantFeatureToggles &
  TenantAiBehaviorCaptureSettings & {
    tenantName: string;
    websiteUrl: string;
    industry: string;
    supportEmail: string;
    businessEmail?: string;
    phoneNumber?: string;
    businessDescription?: string;
    country: string;
    timezone: string;
    assistantName: string;
    assistantIntro: string;
    brandColor: string;
    logoUrl?: string;
    avatarUrl?: string;
    chatPosition: ChatPosition;
    systemPrompt: string;
    responseStyle: ResponseStyle;
    allowedTopics: string[];
    blockedTopics: string[];
    fallbackMessage: string;
    suggestedPrompts: string[];
  };

export type Tenant = TenantCreateRequest & {
  tenantId: string;
  apiKey: string;
  status: TenantStatus;
  onboardingStatus?: OnboardingStatus;
  approvalStatus?: ApprovalStatus;
  selectedSubscriptionPlan?: SubscriptionPlanId;
  paymentStatus?: PaymentStatus;
  subscriptionStatus?: SubscriptionStatus;
  documentProcessingStatus?: DocumentProcessingStatus;
  embedCode?: string;
  embedCodeEmailSentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type TenantListFilters = {
  search?: string;
  status?: TenantStatus | "ALL";
};

export type TenantCreateResponse = {
  tenant: Tenant;
  tenantId: string;
  apiKey: string;
};

export type TenantUpdateRequest = Partial<TenantCreateRequest>;

export type TenantResponse = Tenant;

export type TenantPublicConfig = Pick<
  Tenant,
  | "tenantId"
  | "tenantName"
  | "assistantName"
  | "assistantIntro"
  | "brandColor"
  | "fallbackMessage"
  | "responseStyle"
  | "suggestedPrompts"
  | "enableWebSearch"
  | "enableLeadCapture"
  | "enableSuggestedPrompts"
  | "status"
>;

export type TestExtractionRequest = {
  message: string;
};

export type TestExtractionResponse = {
  intent: string;
  leadData: Record<string, unknown>;
  orderData: Record<string, unknown>;
  appointmentData?: Record<string, unknown>;
  missingFields: string[];
  isMock?: boolean;
};
