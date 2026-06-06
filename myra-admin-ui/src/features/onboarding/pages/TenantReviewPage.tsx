import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MailCheck, MessageSquare, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { canApproveTenant, canRegenerateEmbedCode, canUpdateDocumentStatus, canViewBilling } from "@/features/admin/admin.permissions";
import { useAuthStore } from "@/features/auth/auth.store";
import type { KnowledgeSource, KnowledgeStatus } from "@/features/knowledge/knowledge.types";
import { updateKnowledgeSourceStatus } from "@/features/knowledge/knowledge.api";
import {
  approveTenant,
  documentReviewMessage,
  getTenantReview,
  regenerateEmbedCode,
  rejectTenant,
  triggerEmbedCodeEmail,
  updateTenantDocumentStatus
} from "@/features/onboarding/onboarding.api";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import type { DocumentProcessingStatus } from "@/features/tenants/tenant.types";
import { formatDate } from "@/lib/utils";

const tenantDocumentStatuses: DocumentProcessingStatus[] = ["NOT_UPLOADED", "UPLOADED", "UNDER_REVIEW", "PROCESSING", "READY", "REJECTED", "FAILED"];
const sourceStatuses: KnowledgeStatus[] = ["UNDER_REVIEW", "PROCESSING", "READY", "REJECTED"];

export function TenantReviewPage() {
  const { tenantId = "" } = useParams();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const reviewQuery = useQuery({
    queryKey: ["tenant-review", tenantId],
    queryFn: () => getTenantReview(tenantId),
    enabled: Boolean(tenantId)
  });

  function invalidateReview() {
    queryClient.invalidateQueries({ queryKey: ["tenant-review", tenantId] });
    queryClient.invalidateQueries({ queryKey: ["approval-tenants"] });
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  }

  const approveMutation = useMutation({
    mutationFn: approveTenant,
    onSuccess: () => {
      invalidateReview();
      setApproveOpen(false);
      toast({ title: "Tenant approved", description: "Embed code generated and email notification triggered.", variant: "success" });
    },
    onError: (error) =>
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Tenant was not approved.",
        variant: "error"
      })
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectTenant(tenantId, { reason: rejectionReason }),
    onSuccess: () => {
      invalidateReview();
      setRejectOpen(false);
      setRejectionReason("");
      toast({ title: "Tenant rejected", variant: "success" });
    },
    onError: () => toast({ title: "Reject failed", variant: "error" })
  });

  const documentMutation = useMutation({
    mutationFn: (status: DocumentProcessingStatus) => updateTenantDocumentStatus(tenantId, { status }),
    onSuccess: () => {
      invalidateReview();
      toast({ title: "Document status updated", variant: "success" });
    }
  });

  const sourceMutation = useMutation({
    mutationFn: ({ sourceId, status }: { sourceId: string; status: KnowledgeStatus }) =>
      updateKnowledgeSourceStatus(sourceId, { status }),
    onSuccess: () => {
      invalidateReview();
      toast({ title: "Knowledge document updated", variant: "success" });
    }
  });

  const embedMutation = useMutation({
    mutationFn: regenerateEmbedCode,
    onSuccess: () => {
      invalidateReview();
      toast({ title: "Embed code regenerated", variant: "success" });
    }
  });

  const emailMutation = useMutation({
    mutationFn: triggerEmbedCodeEmail,
    onSuccess: () => {
      invalidateReview();
      toast({ title: "Embed code email triggered", variant: "success" });
    }
  });

  const documentColumns = useMemo<DataTableColumn<KnowledgeSource>[]>(
    () => [
      { header: "File name", accessor: "name" },
      { header: "File type", accessor: "type" },
      { header: "Upload date", accessor: (source) => formatDate(source.createdAt) },
      {
        header: "Status",
        accessor: (source) =>
          canUpdateDocumentStatus(user) ? (
            <Select
              value={source.status}
              onChange={(event) => sourceMutation.mutate({ sourceId: source.id, status: event.target.value as KnowledgeStatus })}
              disabled={sourceMutation.isPending}
            >
              {sourceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          ) : (
            <StatusBadge status={source.status} />
          )
      },
      { header: "Review notes", accessor: (source) => source.reviewNotes || "No notes" },
      { header: "Uploaded by", accessor: (source) => source.uploadedBy || "Tenant Owner" }
    ],
    [sourceMutation, user]
  );

  if (reviewQuery.isLoading) return <LoadingSpinner label="Loading tenant review" />;
  if (!reviewQuery.data) return <PageHeader title="Tenant Review" description="Tenant review details were not found." />;

  const { tenant, subscription, payment, documents, notifications } = reviewQuery.data;
  const plan = getSubscriptionPlan(tenant.selectedSubscriptionPlan);
  const paid = tenant.paymentStatus === "SUCCESS" || tenant.paymentStatus === "PAID";
  const approver = canApproveTenant(user);
  const canApprove = approver && paid;

  function requestMoreInformation() {
    toast({
      title: "Information request queued",
      description: "notification-service can send this request once the backend endpoint is connected.",
      variant: "success"
    });
  }

  return (
    <>
      <PageHeader
        title={`Review ${tenant.tenantName}`}
        description="Review business details, assistant configuration, billing, documents, notification history, and approval actions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setApproveOpen(true)} disabled={!canApprove || approveMutation.isPending}>
              <CheckCircle2 className="h-4 w-4" />
              Approve Tenant
            </Button>
            <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={!approver || rejectMutation.isPending}>
              <XCircle className="h-4 w-4" />
              Reject Tenant
            </Button>
            <Button variant="outline" onClick={requestMoreInformation}>
              <MessageSquare className="h-4 w-4" />
              Request Info
            </Button>
          </div>
        }
      />

      {!paid ? (
        <div className="mb-6 rounded-md border border-amber-400/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
          Admin cannot approve this tenant until payment status is SUCCESS.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <ReviewCard title="Business Details">
          <InfoRow label="Business name" value={tenant.tenantName} />
          <InfoRow label="Website URL" value={tenant.websiteUrl} />
          <InfoRow label="Business email" value={tenant.businessEmail ?? tenant.supportEmail} />
          <InfoRow label="Phone number" value={tenant.phoneNumber ?? "N/A"} />
          <InfoRow label="Industry/category" value={tenant.industry} />
          <InfoRow label="Description" value={tenant.businessDescription ?? "N/A"} />
        </ReviewCard>

        <ReviewCard title="Assistant Configuration">
          <InfoRow label="Assistant name" value={tenant.assistantName} />
          <InfoRow label="Brand color" value={tenant.brandColor} />
          <InfoRow label="Fallback message" value={tenant.fallbackMessage} />
          <InfoRow label="Tenant status" value={<StatusBadge status={tenant.status} />} />
          <InfoRow label="Approval status" value={<StatusBadge status={tenant.approvalStatus ?? "NOT_SUBMITTED"} />} />
        </ReviewCard>

        <ReviewCard title="Subscription Details">
          <InfoRow label="Plan" value={`${plan.name} (${formatPlanPrice(plan)})`} />
          <InfoRow label="Subscription status" value={<StatusBadge status={subscription?.status ?? tenant.subscriptionStatus ?? "PENDING_PAYMENT"} />} />
          <InfoRow label="Renews" value={subscription?.renewsAt ? formatDate(subscription.renewsAt) : "N/A"} />
          <InfoRow label="Reminder" value={subscription?.renewalReminderAt ? formatDate(subscription.renewalReminderAt) : "N/A"} />
        </ReviewCard>

        <ReviewCard title="Payment Details">
          {canViewBilling(user) ? (
            <>
              <InfoRow label="Payment provider" value={payment?.provider ?? "MOCK"} />
              <InfoRow label="Payment status" value={<StatusBadge status={payment?.status ?? tenant.paymentStatus ?? "PENDING"} />} />
              <InfoRow label="Amount" value={`${payment?.currency ?? "USD"} ${payment?.amountUsd ?? plan.priceUsd}`} />
              <InfoRow label="Paid date" value={payment?.paidAt ? formatDate(payment.paidAt) : "Not paid yet"} />
              <InfoRow label="Subscription plan" value={plan.name} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Billing details are visible to ADMIN and BILLING_ADMIN roles.</p>
          )}
        </ReviewCard>

        <ReviewCard title="Risk and Review Notes">
          <InfoRow label="Review owner" value={user?.name ?? "Admin"} />
          <InfoRow label="Risk signal" value={tenant.documentProcessingStatus === "REJECTED" ? "Document issue detected" : "No blocking issue"} />
          <InfoRow label="Requested action" value={tenant.approvalStatus === "PENDING_REVIEW" ? "Approve, reject, or request more information" : "No pending action"} />
          <p className="rounded-md border bg-[var(--color-bg-muted)] p-3 text-sm text-muted-foreground">
            Review website legitimacy, uploaded knowledge quality, payment status, assistant configuration, and any business-specific compliance concerns before activation.
          </p>
        </ReviewCard>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Uploaded Knowledge Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-amber-400/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
            Customer has been informed that documents are usually reviewed and processed within 3 business days.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-muted-foreground">Tenant document status</span>
            {canUpdateDocumentStatus(user) ? (
              <Select
                className="w-full sm:w-64"
                value={tenant.documentProcessingStatus ?? "NOT_UPLOADED"}
                onChange={(event) => documentMutation.mutate(event.target.value as DocumentProcessingStatus)}
                disabled={documentMutation.isPending}
              >
                {tenantDocumentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            ) : (
              <StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} />
            )}
          </div>
          <DataTable
            columns={documentColumns}
            data={documents}
            getRowKey={(source) => source.id}
            emptyTitle="No knowledge documents"
            emptyDescription={documentReviewMessage}
          />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ReviewCard title="Embed Code">
          {tenant.embedCode ? <code className="block break-all rounded-md bg-slate-950 p-3 text-sm text-white">{tenant.embedCode}</code> : <p className="text-sm text-muted-foreground">Embed code is generated only after approval.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => embedMutation.mutate(tenant.tenantId)}
              disabled={!canRegenerateEmbedCode(user) || embedMutation.isPending}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate Embed Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => emailMutation.mutate(tenant.tenantId)}
              disabled={!tenant.embedCode || !approver || emailMutation.isPending}
            >
              <MailCheck className="h-4 w-4" />
              Resend Embed Code Email
            </Button>
          </div>
        </ReviewCard>

        <ReviewCard title="Email Notification History">
          <div className="space-y-3">
            {notifications.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-main)]">{event.subject}</p>
                  <p className="text-xs text-muted-foreground">{event.recipient}</p>
                  {event.body ? <p className="mt-1 text-xs text-muted-foreground">{event.body}</p> : null}
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
            {!notifications.length ? <p className="text-sm text-muted-foreground">No email notification events yet.</p> : null}
          </div>
        </ReviewCard>
      </div>

      <ConfirmDialog
        open={approveOpen}
        title="Approve tenant?"
        description="This generates the embed code, activates the tenant, activates the subscription, and triggers approval emails."
        confirmLabel="Approve"
        onCancel={() => setApproveOpen(false)}
        onConfirm={() => approveMutation.mutate(tenant.tenantId)}
      />

      {rejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-[var(--color-bg-card)] p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Reject tenant</h2>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">A rejection reason is required.</p>
            <Textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="min-h-28" />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={rejectionReason.trim().length < 3 || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate()}
              >
                Reject Tenant
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ReviewCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] break-words text-right font-medium text-[var(--color-text-main)]">{value}</span>
    </div>
  );
}
