import { Bell, CreditCard, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { approvalQueue, platformPlans, platformTenants, type ApprovalTenant, type PlatformTenant } from "@/features/admin/platformAdmin.data";
import { formatDate } from "@/lib/utils";

type PaymentRow = {
  id: string;
  tenant: string;
  plan: string;
  amount: string;
  status: "PAID" | "PENDING" | "FAILED";
  date: string;
};

type KnowledgeDocumentRow = {
  id: string;
  tenant: string;
  document: string;
  status: "COMPLETED" | "PROCESSING" | "FAILED";
  updatedAt: string;
};

type SubscriptionRow = {
  id: string;
  tenant: string;
  plan: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  usage: string;
};

type NotificationRow = {
  id: string;
  tenant: string;
  recipient: string;
  status: "SENT" | "QUEUED" | "FAILED";
  updatedAt: string;
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

const payments: PaymentRow[] = platformTenants.map((tenant, index) => {
  const plan = platformPlans.find((candidate) => candidate.name === tenant.plan);
  return {
    id: `pay_${tenant.id}`,
    tenant: tenant.name,
    plan: tenant.plan,
    amount: `$${plan?.monthlyPrice ?? 0}`,
    status: tenant.status === "ACTIVE" ? "PAID" : tenant.status === "SUSPENDED" ? "FAILED" : "PENDING",
    date: formatDate(new Date(Date.now() - index * 86_400_000).toISOString())
  };
});

const knowledgeDocuments: KnowledgeDocumentRow[] = platformTenants.flatMap((tenant, index) => [
  {
    id: `doc_${tenant.id}_profile`,
    tenant: tenant.name,
    document: `${tenant.category.toLowerCase()}-profile.pdf`,
    status: tenant.failedKnowledge ? "FAILED" : "COMPLETED",
    updatedAt: formatDate(new Date(Date.now() - index * 120_000_000).toISOString())
  },
  {
    id: `doc_${tenant.id}_faq`,
    tenant: tenant.name,
    document: "customer-faq.txt",
    status: tenant.status === "PENDING_APPROVAL" ? "PROCESSING" : "COMPLETED",
    updatedAt: formatDate(new Date(Date.now() - index * 98_000_000).toISOString())
  }
]);

const notifications: NotificationRow[] = platformTenants.map((tenant, index) => ({
  id: `notif_${tenant.id}`,
  tenant: tenant.name,
  recipient: tenant.ownerEmail,
  status: tenant.widgetIssue ? "FAILED" : index % 2 ? "QUEUED" : "SENT",
  updatedAt: formatDate(new Date(Date.now() - index * 32_000_000).toISOString())
}));

const tenantReviewColumns: DataTableColumn<ApprovalTenant>[] = [
  { header: "Business", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.businessName}</span> },
  { header: "Category", accessor: "category" },
  { header: "Owner contact", accessor: "ownerContact" },
  { header: "Requested plan", accessor: "requestedPlan" },
  { header: "Registered", accessor: (tenant) => formatDate(tenant.registrationDate) }
];

const paymentColumns: DataTableColumn<PaymentRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Plan", accessor: "plan" },
  { header: "Amount", accessor: "amount" },
  { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
  { header: "Date", accessor: "date" }
];

const documentColumns: DataTableColumn<KnowledgeDocumentRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Document", accessor: "document" },
  { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
  { header: "Last updated", accessor: "updatedAt" }
];

const subscriptionColumns: DataTableColumn<SubscriptionRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Plan", accessor: "plan" },
  { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
  { header: "Usage", accessor: "usage" }
];

const notificationColumns: DataTableColumn<NotificationRow>[] = [
  { header: "Tenant", accessor: "tenant" },
  { header: "Recipient", accessor: "recipient" },
  { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
  { header: "Last update", accessor: "updatedAt" }
];

const knowledgeColumns: DataTableColumn<PlatformTenant>[] = [
  { header: "Tenant", accessor: (tenant) => <span className="font-medium text-[var(--color-text-main)]">{tenant.name}</span> },
  { header: "Category", accessor: "category" },
  { header: "Documents", accessor: (tenant) => (tenant.failedKnowledge ? "Needs review" : "Ready") },
  { header: "Status", accessor: (tenant) => <StatusBadge status={tenant.failedKnowledge ? "FAILED" : "COMPLETED"} /> },
  { header: "Notes", accessor: "notes" }
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

export function TenantReviewPage() {
  return (
    <>
      <PageHeader title="Tenant Review" description="Review tenant registration details, owner information, submitted documents, and requested plans." />
      <DataTable columns={tenantReviewColumns} data={approvalQueue} getRowKey={(tenant) => tenant.id} emptyTitle="No tenants awaiting review" />
    </>
  );
}

export function PaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" description="Monitor tenant payment status, plan billing, failed charges, and payment activity." />
      <MetricStrip
        items={[
          { label: "Paid invoices", value: payments.filter((payment) => payment.status === "PAID").length, icon: CreditCard },
          { label: "Pending payments", value: payments.filter((payment) => payment.status === "PENDING").length, icon: Bell },
          { label: "Failed payments", value: payments.filter((payment) => payment.status === "FAILED").length, icon: ShieldCheck }
        ]}
      />
      <DataTable columns={paymentColumns} data={payments} getRowKey={(payment) => payment.id} />
    </>
  );
}

export function KnowledgeDocumentsPage() {
  return (
    <>
      <PageHeader title="Knowledge Documents" description="Track uploaded tenant documents, ingestion status, failed uploads, and review readiness." />
      <DataTable columns={documentColumns} data={knowledgeDocuments} getRowKey={(document) => document.id} />
    </>
  );
}

export function SubscriptionsPage() {
  const rows: SubscriptionRow[] = platformTenants.map((tenant) => ({
    id: tenant.id,
    tenant: tenant.name,
    plan: tenant.plan,
    status: tenant.status === "ACTIVE" ? "ACTIVE" : tenant.status === "SUSPENDED" ? "SUSPENDED" : "PENDING",
    usage: `${tenant.chatSessions.toLocaleString()} chats / ${tenant.questionsAsked.toLocaleString()} questions`
  }));

  return (
    <>
      <PageHeader title="Subscriptions" description="Manage tenant subscription plans, plan usage, limits, and subscription status." />
      <DataTable columns={subscriptionColumns} data={rows} getRowKey={(row) => row.id} />
    </>
  );
}

export function EmailNotificationsPage() {
  return (
    <>
      <PageHeader title="Email Notifications" description="Monitor tenant notification delivery, queued emails, and failed notification attempts." />
      <DataTable columns={notificationColumns} data={notifications} getRowKey={(notification) => notification.id} />
    </>
  );
}

export function KnowledgePage() {
  return (
    <>
      <PageHeader title="Knowledge" description="Myra Admin view of tenant knowledge readiness and ingestion health across the platform." />
      <DataTable columns={knowledgeColumns} data={platformTenants} getRowKey={(tenant) => tenant.id} />
    </>
  );
}

export function ConversationsPage() {
  const rows: ConversationRow[] = platformTenants.map((tenant) => ({
    id: tenant.id,
    tenant: tenant.name,
    conversations: tenant.chatSessions,
    purchaseIntent: tenant.purchaseIntentCount,
    completed: tenant.purchaseCompletedCount
  }));

  return (
    <>
      <PageHeader title="Conversations" description="Review aggregate tenant conversation volume, purchase intent signals, and completed purchase events." />
      <DataTable columns={conversationColumns} data={rows} getRowKey={(row) => row.id} />
    </>
  );
}

export function LeadsPage() {
  const rows: LeadRow[] = platformTenants.map((tenant) => ({
    id: tenant.id,
    tenant: tenant.name,
    leads: tenant.leadsCaptured,
    conversionRate: tenant.questionsAsked ? `${((tenant.leadsCaptured / tenant.questionsAsked) * 100).toFixed(1)}%` : "0%",
    status: tenant.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"
  }));

  return (
    <>
      <PageHeader title="Leads" description="Monitor lead capture volume and conversion health across tenant widgets." />
      <DataTable columns={leadColumns} data={rows} getRowKey={(row) => row.id} />
    </>
  );
}

function MetricStrip({ items }: { items: { label: string; value: number | string; icon: typeof CreditCard }[] }) {
  return (
    <section className="mb-6 grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[var(--color-text-main)]">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
