import { useEffect, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ApprovalTenant, PlatformTenant } from "@/features/admin/admin.types";
import { fetchApprovalQueue, fetchTenants } from "@/features/admin/admin.api";
import { formatDate } from "@/lib/utils";

type SubscriptionRow = {
  id: string;
  tenant: string;
  plan: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  usage: string;
};

type ConversationRow = {
  id: string;
  tenant: string;
  conversations: number;
  purchaseIntent: number;
  completed: number;
};

type LeadRow = {
  id: string;
  tenant: string;
  leads: number;
  conversionRate: string;
  status: "ACTIVE" | "INACTIVE";
};

const tenantReviewColumns: DataTableColumn<ApprovalTenant>[] = [
  { header: "Business", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.businessName}</span> },
  { header: "Category", accessor: "category" },
  { header: "Owner contact", accessor: "ownerContact" },
  { header: "Requested plan", accessor: "requestedPlan" },
  { header: "Registered", accessor: (tenant) => formatDate(tenant.registrationDate) }
];

const subscriptionColumns: DataTableColumn<SubscriptionRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Plan", accessor: "plan" },
  { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
  { header: "Usage", accessor: "usage" }
];

const conversationColumns: DataTableColumn<ConversationRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Conversations", accessor: (row) => row.conversations.toLocaleString() },
  { header: "Purchase intent", accessor: (row) => row.purchaseIntent.toLocaleString() },
  { header: "Completed", accessor: (row) => row.completed.toLocaleString() }
];

const leadColumns: DataTableColumn<LeadRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Leads", accessor: (row) => row.leads.toLocaleString() },
  { header: "Conversion rate", accessor: "conversionRate" },
  { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> }
];

const knowledgeColumns: DataTableColumn<PlatformTenant>[] = [
  { header: "Tenant", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.name}</span> },
  { header: "Category", accessor: "category" },
  { header: "Documents", accessor: (tenant) => (tenant.failedKnowledge ? "Needs review" : "Ready") },
  { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.failedKnowledge ? "FAILED" : "COMPLETED"} /> },
  { header: "Notes", accessor: "notes" }
];

function useTenants() {
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetchTenants()
      .then((data) => { if (!cancelled) setTenants(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  return { tenants, loading };
}

export function TenantReviewPage() {
  const [queue, setQueue] = useState<ApprovalTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchApprovalQueue()
      .then((data) => { if (!cancelled) setQueue(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageHeader title="Tenant Review" description="Loading…" />;

  return (
    <>
      <PageHeader title="Tenant Review" description="Review tenant registration details, owner information, submitted documents, and requested plans." />
      <DataTable columns={tenantReviewColumns} data={queue} getRowKey={(tenant) => tenant.id} emptyTitle="No tenants awaiting review" emptyDescription="Pending registrations will appear here." />
    </>
  );
}

export function PaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" description="Monitor tenant payment status, plan billing, failed charges, and payment activity." />
      <p className="text-sm text-muted-foreground">Payment data will appear here once the backend payment API is available.</p>
    </>
  );
}

export function KnowledgeDocumentsPage() {
  return (
    <>
      <PageHeader title="Knowledge Documents" description="Track uploaded tenant documents, ingestion status, failed uploads, and review readiness." />
      <p className="text-sm text-muted-foreground">Document data will appear here once the backend document management API is available.</p>
    </>
  );
}

export function SubscriptionsPage() {
  const { tenants, loading } = useTenants();

  if (loading) return <PageHeader title="Subscriptions" description="Loading…" />;

  const rows: SubscriptionRow[] = tenants.map((tenant) => ({
    id: tenant.id,
    tenant: tenant.name,
    plan: tenant.plan || "—",
    status: tenant.status === "ACTIVE" ? "ACTIVE" : tenant.status === "SUSPENDED" ? "SUSPENDED" : "PENDING",
    usage: `${tenant.chatSessions.toLocaleString()} chats / ${tenant.questionsAsked.toLocaleString()} questions`
  }));

  return (
    <>
      <PageHeader title="Subscriptions" description="Manage tenant subscription plans, plan usage, limits, and subscription status." />
      <DataTable columns={subscriptionColumns} data={rows} getRowKey={(row) => row.id} emptyTitle="No subscriptions" emptyDescription="Tenant subscriptions will appear here." />
    </>
  );
}

export function EmailNotificationsPage() {
  return (
    <>
      <PageHeader title="Email Notifications" description="Monitor tenant notification delivery, queued emails, and failed notification attempts." />
      <p className="text-sm text-muted-foreground">Notification data will appear here once the backend notification API is available.</p>
    </>
  );
}

export function KnowledgePage() {
  const { tenants, loading } = useTenants();
  if (loading) return <PageHeader title="Knowledge" description="Loading…" />;

  return (
    <>
      <PageHeader title="Knowledge" description="Myra Admin view of tenant knowledge readiness and ingestion health across the platform." />
      <DataTable columns={knowledgeColumns} data={tenants} getRowKey={(tenant) => tenant.id} emptyTitle="No tenants" emptyDescription="No tenants available." />
    </>
  );
}

export function ConversationsPage() {
  const { tenants, loading } = useTenants();
  if (loading) return <PageHeader title="Conversations" description="Loading…" />;

  const rows: ConversationRow[] = tenants.map((tenant) => ({
    id: tenant.id,
    tenant: tenant.name,
    conversations: tenant.chatSessions,
    purchaseIntent: tenant.purchaseIntentCount,
    completed: tenant.purchaseCompletedCount
  }));

  return (
    <>
      <PageHeader title="Conversations" description="Review aggregate tenant conversation volume, purchase intent signals, and completed purchase events." />
      <DataTable columns={conversationColumns} data={rows} getRowKey={(row) => row.id} emptyTitle="No conversations" emptyDescription="Conversation data will appear here." />
    </>
  );
}

export function LeadsPage() {
  const { tenants, loading } = useTenants();
  if (loading) return <PageHeader title="Leads" description="Loading…" />;

  const rows: LeadRow[] = tenants.map((tenant) => ({
    id: tenant.id,
    tenant: tenant.name,
    leads: tenant.leadsCaptured,
    conversionRate: tenant.questionsAsked ? `${((tenant.leadsCaptured / tenant.questionsAsked) * 100).toFixed(1)}%` : "0%",
    status: tenant.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"
  }));

  return (
    <>
      <PageHeader title="Leads" description="Monitor lead capture volume and conversion health across tenant widgets." />
      <DataTable columns={leadColumns} data={rows} getRowKey={(row) => row.id} emptyTitle="No leads" emptyDescription="Lead data will appear here." />
    </>
  );
}
