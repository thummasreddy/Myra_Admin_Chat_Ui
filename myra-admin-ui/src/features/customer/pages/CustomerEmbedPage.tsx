import { Code2, MailCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmbedCodeBox } from "@/features/widget/components/EmbedCodeBox";
import { useCustomerTenant, isEmbedReady } from "@/features/customer/customer.hooks";
import { customerDashboardMessages } from "@/features/onboarding/onboarding.copy";
import { formatDate } from "@/lib/utils";

export function CustomerEmbedPage() {
  const { tenantId, tenantQuery } = useCustomerTenant();

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading embed code" />;
  if (!tenantQuery.data) return <PageHeader title="Embed Code" description="No tenant is available for this account." />;

  const tenant = tenantQuery.data;
  const ready = isEmbedReady(tenant.status);

  return (
    <>
      <PageHeader
        title="Embed Code"
        description={ready ? customerDashboardMessages.embedReady : customerDashboardMessages.embedHidden}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Website Install Script
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ready ? (
              <>
                <EmbedCodeBox tenantId={tenantId} publicWidgetKey={tenant.apiKey} />
                <div className="rounded-md border bg-[var(--color-bg-muted)] p-4 text-sm text-muted-foreground">
                  Place this script before the closing body tag on your website. The assistant will use approved settings and
                  processed knowledge sources to help customers ask questions, get answers, and move toward contact, booking,
                  quote request, or purchase.
                </div>
              </>
            ) : (
              <div className="rounded-md border border-amber-400/30 bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]">
                {customerDashboardMessages.embedHidden} Current status: <StatusBadge status={tenant.status} />
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-[var(--color-success)]" />
                Approval Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Tenant</span>
                <StatusBadge status={tenant.status} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Documents</span>
                <StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Approved</span>
                <span className="text-right font-medium">{tenant.approvedAt ? formatDate(tenant.approvedAt) : "Not approved yet"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MailCheck className="h-5 w-5 text-primary" />
                Email Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Embed code is sent to {tenant.businessEmail ?? tenant.supportEmail} after admin approval.</p>
              <p>{tenant.embedCodeEmailSentAt ? `Sent ${formatDate(tenant.embedCodeEmailSentAt)}` : "Not sent yet"}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
