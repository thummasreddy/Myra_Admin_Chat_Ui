import type { CHAT_POSITIONS, RESPONSE_STYLES, TENANT_STATUSES } from "@/lib/constants";

export type TenantStatus = (typeof TENANT_STATUSES)[number];
export type ChatPosition = (typeof CHAT_POSITIONS)[number];
export type ResponseStyle = (typeof RESPONSE_STYLES)[number];

export type TenantFeatureToggles = {
  enableWebSearch: boolean;
  enableLeadCapture: boolean;
  enableSuggestedPrompts: boolean;
  enableAnalytics: boolean;
  enableHumanEscalation: boolean;
};

export type TenantCreateRequest = TenantFeatureToggles & {
  tenantName: string;
  websiteUrl: string;
  industry: string;
  supportEmail: string;
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
