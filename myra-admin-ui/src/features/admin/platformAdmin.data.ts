export type MyraAdminRole = "MYRA_SUPER_ADMIN" | "MYRA_SUPPORT_ADMIN";
export type PlatformTenantStatus = "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export type PlatformTenant = {
  id: string;
  name: string;
  category: string;
  website: string;
  ownerName: string;
  ownerEmail: string;
  plan: "Starter" | "Growth" | "Scale";
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

export const platformTenants: PlatformTenant[] = [
  {
    id: "tn_frytown",
    name: "FryTown",
    category: "Restaurant",
    website: "https://frytown.example",
    ownerName: "Nina Carter",
    ownerEmail: "owner@frytown.example",
    plan: "Growth",
    status: "ACTIVE",
    createdAt: "2026-04-21T10:30:00Z",
    lastActiveAt: "2026-06-11T18:45:00Z",
    visitors: 12840,
    chatSessions: 3120,
    questionsAsked: 7250,
    answersGiven: 7210,
    leadsCaptured: 284,
    purchaseIntentCount: 418,
    purchaseCompletedCount: 119,
    failedKnowledge: false,
    widgetIssue: false,
    featureFlags: {
      lead_capture_enabled: true,
      qr_enabled: true,
      knowledge_upload_enabled: true,
      analytics_enabled: true,
      embed_enabled: true,
      purchase_tracking_enabled: true
    },
    notes: "High QR traffic during lunch hours. Watch weekend conversion."
  },
  {
    id: "tn_mana",
    name: "Mana Rythu",
    category: "Agriculture",
    website: "https://manarythu.example",
    ownerName: "Ravi Iyer",
    ownerEmail: "hello@manarythu.example",
    plan: "Scale",
    status: "PENDING_APPROVAL",
    createdAt: "2026-06-01T09:15:00Z",
    lastActiveAt: "2026-06-10T14:02:00Z",
    visitors: 3910,
    chatSessions: 780,
    questionsAsked: 1640,
    answersGiven: 1598,
    leadsCaptured: 97,
    purchaseIntentCount: 121,
    purchaseCompletedCount: 38,
    failedKnowledge: true,
    widgetIssue: false,
    featureFlags: {
      lead_capture_enabled: true,
      qr_enabled: true,
      knowledge_upload_enabled: false,
      analytics_enabled: true,
      embed_enabled: true,
      purchase_tracking_enabled: true
    },
    notes: "Approval pending document reprocess."
  },
  {
    id: "tn_corecircle",
    name: "CoreCircle Fitness",
    category: "Fitness",
    website: "https://corecircle.example",
    ownerName: "Maya Shah",
    ownerEmail: "maya@corecircle.example",
    plan: "Starter",
    status: "SUSPENDED",
    createdAt: "2026-03-03T16:45:00Z",
    lastActiveAt: "2026-05-29T11:20:00Z",
    visitors: 7440,
    chatSessions: 1320,
    questionsAsked: 2864,
    answersGiven: 2792,
    leadsCaptured: 151,
    purchaseIntentCount: 96,
    purchaseCompletedCount: 21,
    failedKnowledge: false,
    widgetIssue: true,
    featureFlags: {
      lead_capture_enabled: true,
      qr_enabled: false,
      knowledge_upload_enabled: true,
      analytics_enabled: true,
      embed_enabled: false,
      purchase_tracking_enabled: false
    },
    notes: "Suspended after billing review. Support can inspect only."
  },
  {
    id: "tn_lumora",
    name: "Lumora Dental",
    category: "Healthcare",
    website: "https://lumoradental.example",
    ownerName: "Erin Wells",
    ownerEmail: "erin@lumoradental.example",
    plan: "Growth",
    status: "REJECTED",
    createdAt: "2026-05-13T13:22:00Z",
    lastActiveAt: "2026-05-20T09:05:00Z",
    visitors: 1210,
    chatSessions: 205,
    questionsAsked: 441,
    answersGiven: 428,
    leadsCaptured: 16,
    purchaseIntentCount: 11,
    purchaseCompletedCount: 2,
    failedKnowledge: true,
    widgetIssue: true,
    featureFlags: {
      lead_capture_enabled: false,
      qr_enabled: false,
      knowledge_upload_enabled: false,
      analytics_enabled: false,
      embed_enabled: false,
      purchase_tracking_enabled: false
    },
    notes: "Rejected because business verification documents did not match."
  }
];

export const approvalQueue: ApprovalTenant[] = [
  {
    id: "tn_mana",
    businessName: "Mana Rythu",
    website: "https://manarythu.example",
    category: "Agriculture",
    ownerContact: "Ravi Iyer, hello@manarythu.example",
    uploadedDocuments: ["business-license.pdf", "seed-catalog.csv"],
    requestedPlan: "Scale",
    registrationDate: "2026-06-01T09:15:00Z"
  },
  {
    id: "tn_bloom",
    businessName: "Bloom & Bark",
    website: "https://bloomandbark.example",
    category: "Retail",
    ownerContact: "Sara Lin, sara@bloomandbark.example",
    uploadedDocuments: ["storefront.pdf"],
    requestedPlan: "Starter",
    registrationDate: "2026-06-08T15:05:00Z"
  }
];

export const platformPlans: PlatformPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    chatLimit: 1000,
    questionLimit: 2500,
    leadLimit: 250,
    documentLimit: 20,
    qrAccess: true,
    analyticsAccess: true,
    embedAccess: true,
    purchaseTrackingAccess: false,
    enabled: true
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 149,
    chatLimit: 5000,
    questionLimit: 15000,
    leadLimit: 1500,
    documentLimit: 100,
    qrAccess: true,
    analyticsAccess: true,
    embedAccess: true,
    purchaseTrackingAccess: true,
    enabled: true
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 399,
    chatLimit: 25000,
    questionLimit: 75000,
    leadLimit: 10000,
    documentLimit: 500,
    qrAccess: true,
    analyticsAccess: true,
    embedAccess: true,
    purchaseTrackingAccess: true,
    enabled: true
  }
];

export const auditEntries: AuditEntry[] = [
  {
    id: "audit_1",
    adminUser: "Priya Admin",
    role: "MYRA_SUPER_ADMIN",
    action: "APPROVE_TENANT",
    tenantAffected: "FryTown",
    resourceType: "tenant",
    oldValue: "PENDING_APPROVAL",
    newValue: "ACTIVE",
    timestamp: "2026-06-11T18:12:00Z",
    ipAddress: "198.51.100.24"
  },
  {
    id: "audit_2",
    adminUser: "Sam Support",
    role: "MYRA_SUPPORT_ADMIN",
    action: "REPROCESS_DOCUMENT",
    tenantAffected: "Mana Rythu",
    resourceType: "knowledge_document",
    oldValue: "FAILED",
    newValue: "PROCESSING",
    timestamp: "2026-06-11T16:44:00Z",
    ipAddress: "198.51.100.41"
  },
  {
    id: "audit_3",
    adminUser: "Priya Admin",
    role: "MYRA_SUPER_ADMIN",
    action: "CHANGE_PLAN",
    tenantAffected: "CoreCircle Fitness",
    resourceType: "plan",
    oldValue: "Starter",
    newValue: "Growth",
    timestamp: "2026-06-10T21:09:00Z",
    ipAddress: "198.51.100.24"
  }
];

export function platformTotals() {
  const totals = platformTenants.reduce(
    (acc, tenant) => {
      acc.visitors += tenant.visitors;
      acc.chatSessions += tenant.chatSessions;
      acc.questionsAsked += tenant.questionsAsked;
      acc.answersGiven += tenant.answersGiven;
      acc.leadsCaptured += tenant.leadsCaptured;
      acc.purchaseIntentCount += tenant.purchaseIntentCount;
      acc.purchaseCompletedCount += tenant.purchaseCompletedCount;
      acc[tenant.status] += 1;
      return acc;
    },
    {
      visitors: 0,
      chatSessions: 0,
      questionsAsked: 0,
      answersGiven: 0,
      leadsCaptured: 0,
      purchaseIntentCount: 0,
      purchaseCompletedCount: 0,
      PENDING_APPROVAL: 0,
      ACTIVE: 0,
      REJECTED: 0,
      SUSPENDED: 0
    }
  );

  return {
    ...totals,
    totalTenants: platformTenants.length,
    questionToPurchase:
      totals.questionsAsked > 0 ? Number(((totals.purchaseCompletedCount / totals.questionsAsked) * 100).toFixed(1)) : 0
  };
}
