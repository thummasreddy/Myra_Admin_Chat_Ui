export type MyraAdminRole = "MYRA_SUPER_ADMIN" | "MYRA_SUPPORT_ADMIN";
export type PlatformTenantStatus = "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export type PlatformTenant = {
  id: string;
  name: string;
  category: string;
  website: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  status: PlatformTenantStatus;
  createdAt: string;
  lastActiveAt: string;
  visitors: number;
  chatSessions: number;
  questionsAsked: number;
  answersGiven: number;
  leadsCaptured: number;
  purchaseIntentCount: number;
  purchaseCompletedCount: number;
  failedKnowledge: boolean;
  widgetIssue: boolean;
  featureFlags: Record<string, boolean>;
  notes: string;
};

export type ApprovalTenant = {
  id: string;
  businessName: string;
  website: string;
  category: string;
  ownerContact: string;
  uploadedDocuments: string[];
  requestedPlan: string;
  registrationDate: string;
};

export type PlatformPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  chatLimit: number;
  questionLimit: number;
  leadLimit: number;
  documentLimit: number;
  qrAccess: boolean;
  analyticsAccess: boolean;
  embedAccess: boolean;
  purchaseTrackingAccess: boolean;
  enabled: boolean;
};

export type AuditEntry = {
  id: string;
  adminUser: string;
  role: MyraAdminRole;
  action: string;
  tenantAffected: string;
  resourceType: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ipAddress: string;
};

export const featureFlagKeys = [
  "lead_capture_enabled",
  "qr_enabled",
  "knowledge_upload_enabled",
  "analytics_enabled",
  "embed_enabled",
  "purchase_tracking_enabled"
] as const;
