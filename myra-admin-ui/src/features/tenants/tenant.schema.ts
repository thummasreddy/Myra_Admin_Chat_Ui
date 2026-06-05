import { z } from "zod";
import { CHAT_POSITIONS, RESPONSE_STYLES, TENANT_STATUSES } from "@/lib/constants";
import type { TenantCreateRequest } from "@/features/tenants/tenant.types";

export const defaultAiBehaviorCaptureValues = {
  enableMultiTurnMemory: true,
  enableStructuredExtraction: true,
  enableOrderCapture: false,
  enableAppointmentCapture: false,
  enableConversationSummary: true,
  sessionExpirationMinutes: 1440,
  leadRequiredFields: ["phone_or_email", "service_or_product_interest"],
  orderRequiredFields: ["product_or_service", "quantity_or_people_count", "phone_or_email"],
  appointmentRequiredFields: ["service_required", "preferred_date", "preferred_time", "phone_or_email"]
};

export const tenantWizardSchema = z.object({
  tenantName: z.string().min(2, "Tenant name must be at least 2 characters"),
  websiteUrl: z.string().url("Enter a valid website URL"),
  industry: z.string().min(2, "Industry is required"),
  supportEmail: z.string().email("Enter a valid support email"),
  country: z.string().min(2, "Country is required"),
  timezone: z.string().min(2, "Timezone is required"),
  assistantName: z.string().min(2, "Assistant name is required"),
  assistantIntro: z.string().min(10, "Assistant intro should be more descriptive"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #EA5455"),
  logoUrl: z.string().url("Enter a valid logo URL").or(z.literal("")).optional(),
  avatarUrl: z.string().url("Enter a valid avatar URL").or(z.literal("")).optional(),
  chatPosition: z.enum(CHAT_POSITIONS),
  systemPrompt: z.string().min(20, "System prompt must be at least 20 characters"),
  responseStyle: z.enum(RESPONSE_STYLES),
  allowedTopics: z.string().min(2, "Add at least one allowed topic"),
  blockedTopics: z.string().optional(),
  fallbackMessage: z.string().min(10, "Fallback message is required"),
  suggestedPrompts: z.string().min(5, "Add at least one suggested prompt"),
  enableWebSearch: z.boolean(),
  enableLeadCapture: z.boolean(),
  enableSuggestedPrompts: z.boolean(),
  enableAnalytics: z.boolean(),
  enableHumanEscalation: z.boolean(),
  enableMultiTurnMemory: z.boolean().default(defaultAiBehaviorCaptureValues.enableMultiTurnMemory),
  enableStructuredExtraction: z.boolean().default(defaultAiBehaviorCaptureValues.enableStructuredExtraction),
  enableOrderCapture: z.boolean().default(defaultAiBehaviorCaptureValues.enableOrderCapture),
  enableAppointmentCapture: z.boolean().default(defaultAiBehaviorCaptureValues.enableAppointmentCapture),
  enableConversationSummary: z.boolean().default(defaultAiBehaviorCaptureValues.enableConversationSummary),
  sessionExpirationMinutes: z.coerce.number().min(1).max(10080).default(defaultAiBehaviorCaptureValues.sessionExpirationMinutes),
  leadRequiredFields: z.array(z.string()).default(() => [...defaultAiBehaviorCaptureValues.leadRequiredFields]),
  orderRequiredFields: z.array(z.string()).default(() => [...defaultAiBehaviorCaptureValues.orderRequiredFields]),
  appointmentRequiredFields: z.array(z.string()).default(() => [...defaultAiBehaviorCaptureValues.appointmentRequiredFields])
});

export type TenantWizardFormValues = z.infer<typeof tenantWizardSchema>;

export const defaultTenantWizardValues: TenantWizardFormValues = {
  tenantName: "VThumma Portfolio",
  websiteUrl: "https://www.vthumma.com",
  industry: "Technology Portfolio",
  supportEmail: "support@vthumma.com",
  country: "United States",
  timezone: "America/Phoenix",
  assistantName: "Myra",
  assistantIntro: "Hi, I am Myra, Vijay's AI assistant.",
  brandColor: "#EA5455",
  logoUrl: "",
  avatarUrl: "",
  chatPosition: "bottom-right",
  systemPrompt: "You are Myra, a helpful AI assistant for this business.",
  responseStyle: "PROFESSIONAL",
  allowedTopics: "career, projects, technology",
  blockedTopics: "medical, legal",
  fallbackMessage: "I am not sure about that yet. Please contact support.",
  suggestedPrompts: "Tell me about Vijay's experience\nWhat projects has Vijay built?\nHow can I contact Vijay?",
  enableWebSearch: false,
  enableLeadCapture: true,
  enableSuggestedPrompts: true,
  enableAnalytics: true,
  enableHumanEscalation: false,
  ...defaultAiBehaviorCaptureValues
};

export const tenantDetailSchema = tenantWizardSchema.extend({
  status: z.enum(TENANT_STATUSES)
});

function splitList(value?: string) {
  return (value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toTenantCreateRequest(values: TenantWizardFormValues): TenantCreateRequest {
  return {
    ...values,
    logoUrl: values.logoUrl || undefined,
    avatarUrl: values.avatarUrl || undefined,
    allowedTopics: splitList(values.allowedTopics),
    blockedTopics: splitList(values.blockedTopics),
    suggestedPrompts: splitList(values.suggestedPrompts)
  };
}

export function toTenantWizardValues(tenant: TenantCreateRequest): TenantWizardFormValues {
  return {
    ...defaultAiBehaviorCaptureValues,
    ...tenant,
    logoUrl: tenant.logoUrl ?? "",
    avatarUrl: tenant.avatarUrl ?? "",
    allowedTopics: tenant.allowedTopics.join(", "),
    blockedTopics: tenant.blockedTopics.join(", "),
    suggestedPrompts: tenant.suggestedPrompts.join("\n")
  };
}
