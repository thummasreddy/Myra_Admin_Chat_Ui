import { defaultAiBehaviorCaptureValues } from "@/features/tenants/tenant.schema";
import type { ResponseStyle, Tenant, TenantCreateRequest } from "@/features/tenants/tenant.types";

type TenantApiRecord = Record<string, unknown>;

export function normalizeResponseStyle(style: string): ResponseStyle {
  const upper = style.toUpperCase();
  if (upper === "PROFESSIONAL" || upper === "FRIENDLY" || upper === "CASUAL" || upper === "FORMAL") return upper;
  if (upper === "CONCISE") return "PROFESSIONAL";
  if (upper === "SALES") return "FRIENDLY";
  return "PROFESSIONAL";
}

export function toTenantCreateRequest(formValues: TenantCreateRequest): TenantApiRecord {
  return toBackendTenantPayload(formValues);
}

export function toTenantUpdateRequest(formValues: Partial<Tenant>): TenantApiRecord {
  return toBackendTenantPayload(formValues);
}

export function fromTenantListResponse(apiResponse: unknown): Tenant[] {
  const records = Array.isArray(apiResponse)
    ? apiResponse
    : Array.isArray((apiResponse as TenantApiRecord | undefined)?.data)
      ? ((apiResponse as TenantApiRecord).data as unknown[])
      : [];

  return records.map(fromTenantResponse);
}

export function fromTenantResponse(apiTenant: unknown): Tenant {
  const record = asRecord(apiTenant);
  const tenantId = stringValue(record, "tenantId", "tenant_id") || "tenant_unknown";
  const tenantName = stringValue(record, "tenantName", "tenant_name") || "Untitled tenant";
  const createdAt = stringValue(record, "createdAt", "created_at") || new Date().toISOString();
  const updatedAt = stringValue(record, "updatedAt", "updated_at") || createdAt;

  return {
    ...defaultAiBehaviorCaptureValues,
    tenantId,
    apiKey: stringValue(record, "apiKey", "api_key") || "",
    tenantName,
    websiteUrl: stringValue(record, "websiteUrl", "website_url") || "",
    industry: stringValue(record, "industry") || "",
    supportEmail: stringValue(record, "supportEmail", "support_email") || "",
    businessEmail: optionalStringValue(record, "businessEmail", "business_email"),
    phoneNumber: optionalStringValue(record, "phoneNumber", "phone_number"),
    businessDescription: optionalStringValue(record, "businessDescription", "business_description"),
    country: stringValue(record, "country") || "",
    timezone: stringValue(record, "timezone") || "",
    assistantName: stringValue(record, "assistantName", "assistant_name") || "Myra",
    assistantIntro: stringValue(record, "assistantIntro", "assistant_intro") || "Hi, I am Myra.",
    brandColor: stringValue(record, "brandColor", "brand_color") || "#EA5455",
    logoUrl: optionalStringValue(record, "logoUrl", "logo_url"),
    avatarUrl: optionalStringValue(record, "avatarUrl", "avatar_url"),
    chatPosition: stringValue(record, "chatPosition", "chat_position") === "bottom-left" ? "bottom-left" : "bottom-right",
    systemPrompt: stringValue(record, "systemPrompt", "system_prompt") || "You are Myra, a helpful AI assistant.",
    responseStyle: normalizeResponseStyle(String(value(record, "responseStyle", "response_style") ?? "PROFESSIONAL")),
    allowedTopics: stringArrayValue(record, "allowedTopics", "allowed_topics") ?? [],
    blockedTopics: stringArrayValue(record, "blockedTopics", "blocked_topics") ?? [],
    fallbackMessage: stringValue(record, "fallbackMessage", "fallback_message") || "I do not have that answer yet.",
    suggestedPrompts: stringArrayValue(record, "suggestedPrompts", "suggested_prompts") ?? [],
    enableWebSearch: booleanValue(record, "enableWebSearch", "enable_web_search") ?? false,
    enableLeadCapture: booleanValue(record, "enableLeadCapture", "enable_lead_capture") ?? false,
    enableSuggestedPrompts: booleanValue(record, "enableSuggestedPrompts", "enable_suggested_prompts") ?? false,
    enableAnalytics: booleanValue(record, "enableAnalytics", "enable_analytics") ?? false,
    enableHumanEscalation: booleanValue(record, "enableHumanEscalation", "enable_human_escalation") ?? false,
    enableMultiTurnMemory:
      booleanValue(record, "enableMultiTurnMemory", "enable_multi_turn_memory") ?? defaultAiBehaviorCaptureValues.enableMultiTurnMemory,
    enableStructuredExtraction:
      booleanValue(record, "enableStructuredExtraction", "enable_structured_extraction") ??
      defaultAiBehaviorCaptureValues.enableStructuredExtraction,
    enableOrderCapture:
      booleanValue(record, "enableOrderCapture", "enable_order_capture") ?? defaultAiBehaviorCaptureValues.enableOrderCapture,
    enableAppointmentCapture:
      booleanValue(record, "enableAppointmentCapture", "enable_appointment_capture") ??
      defaultAiBehaviorCaptureValues.enableAppointmentCapture,
    enableConversationSummary:
      booleanValue(record, "enableConversationSummary", "enable_conversation_summary") ??
      defaultAiBehaviorCaptureValues.enableConversationSummary,
    sessionExpirationMinutes:
      numberValue(record, "sessionExpirationMinutes", "session_expiration_minutes") ??
      defaultAiBehaviorCaptureValues.sessionExpirationMinutes,
    leadRequiredFields:
      stringArrayValue(record, "leadRequiredFields", "lead_required_fields") ?? defaultAiBehaviorCaptureValues.leadRequiredFields,
    orderRequiredFields:
      stringArrayValue(record, "orderRequiredFields", "order_required_fields") ?? defaultAiBehaviorCaptureValues.orderRequiredFields,
    appointmentRequiredFields:
      stringArrayValue(record, "appointmentRequiredFields", "appointment_required_fields") ??
      defaultAiBehaviorCaptureValues.appointmentRequiredFields,
    status: (stringValue(record, "status") || "ACTIVE") as Tenant["status"],
    onboardingStatus: optionalStringValue(record, "onboardingStatus", "onboarding_status") as Tenant["onboardingStatus"],
    approvalStatus: optionalStringValue(record, "approvalStatus", "approval_status") as Tenant["approvalStatus"],
    selectedSubscriptionPlan: optionalStringValue(
      record,
      "selectedSubscriptionPlan",
      "selected_subscription_plan"
    ) as Tenant["selectedSubscriptionPlan"],
    paymentStatus: optionalStringValue(record, "paymentStatus", "payment_status") as Tenant["paymentStatus"],
    subscriptionStatus: optionalStringValue(record, "subscriptionStatus", "subscription_status") as Tenant["subscriptionStatus"],
    documentProcessingStatus: optionalStringValue(
      record,
      "documentProcessingStatus",
      "document_processing_status"
    ) as Tenant["documentProcessingStatus"],
    embedCode: optionalStringValue(record, "embedCode", "embed_code"),
    embedCodeEmailSentAt: optionalStringValue(record, "embedCodeEmailSentAt", "embed_code_email_sent_at"),
    approvedAt: optionalStringValue(record, "approvedAt", "approved_at"),
    rejectedAt: optionalStringValue(record, "rejectedAt", "rejected_at"),
    rejectedReason: optionalStringValue(record, "rejectedReason", "rejected_reason"),
    createdAt,
    updatedAt
  };
}

function toBackendTenantPayload(values: Partial<Tenant> & Partial<TenantCreateRequest>): TenantApiRecord {
  return compact({
    tenant_id: values.tenantId,
    tenant_name: values.tenantName,
    website_url: values.websiteUrl,
    industry: values.industry,
    support_email: values.supportEmail,
    business_email: values.businessEmail,
    phone_number: values.phoneNumber,
    business_description: values.businessDescription,
    country: values.country,
    timezone: values.timezone,
    assistant_name: values.assistantName,
    assistant_intro: values.assistantIntro,
    brand_color: values.brandColor,
    logo_url: values.logoUrl,
    avatar_url: values.avatarUrl,
    chat_position: values.chatPosition,
    system_prompt: values.systemPrompt,
    response_style: values.responseStyle ? normalizeResponseStyle(values.responseStyle) : undefined,
    allowed_topics: values.allowedTopics,
    blocked_topics: values.blockedTopics,
    fallback_message: values.fallbackMessage,
    suggested_prompts: values.suggestedPrompts,
    enable_web_search: values.enableWebSearch,
    enable_lead_capture: values.enableLeadCapture,
    enable_suggested_prompts: values.enableSuggestedPrompts,
    enable_analytics: values.enableAnalytics,
    enable_human_escalation: values.enableHumanEscalation,
    enable_multi_turn_memory: values.enableMultiTurnMemory,
    enable_structured_extraction: values.enableStructuredExtraction,
    enable_order_capture: values.enableOrderCapture,
    enable_appointment_capture: values.enableAppointmentCapture,
    enable_conversation_summary: values.enableConversationSummary,
    session_expiration_minutes: values.sessionExpirationMinutes,
    lead_required_fields: values.leadRequiredFields,
    order_required_fields: values.orderRequiredFields,
    appointment_required_fields: values.appointmentRequiredFields,
    status: values.status
  });
}

function asRecord(value: unknown): TenantApiRecord {
  return value && typeof value === "object" ? (value as TenantApiRecord) : {};
}

function value(record: TenantApiRecord, camelKey: string, snakeKey = camelKey) {
  return record[camelKey] ?? record[snakeKey];
}

function stringValue(record: TenantApiRecord, camelKey: string, snakeKey = camelKey) {
  const current = value(record, camelKey, snakeKey);
  return typeof current === "string" ? current : "";
}

function optionalStringValue(record: TenantApiRecord, camelKey: string, snakeKey = camelKey) {
  const current = stringValue(record, camelKey, snakeKey);
  return current || undefined;
}

function booleanValue(record: TenantApiRecord, camelKey: string, snakeKey = camelKey) {
  const current = value(record, camelKey, snakeKey);
  return typeof current === "boolean" ? current : undefined;
}

function numberValue(record: TenantApiRecord, camelKey: string, snakeKey = camelKey) {
  const current = value(record, camelKey, snakeKey);
  return typeof current === "number" && Number.isFinite(current) ? current : undefined;
}

function stringArrayValue(record: TenantApiRecord, camelKey: string, snakeKey = camelKey) {
  const current = value(record, camelKey, snakeKey);
  return Array.isArray(current) ? current.filter((item): item is string => typeof item === "string") : undefined;
}

function compact(record: TenantApiRecord): TenantApiRecord {
  return Object.fromEntries(Object.entries(record).filter(([, item]) => item !== undefined));
}
