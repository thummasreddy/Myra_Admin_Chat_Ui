import { Code2, MailCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmbedCodeBox } from "@/features/widget/components/EmbedCodeBox";
import { useCustomerTenant, isEmbedReady } from "@/features/customer/customer.hooks";
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
        description="Install the Myra widget on your website after admin approval. The code is also emailed to the business email."
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
                <EmbedCodeBox tenantId={tenantId} />
                <div className="rounded-md border bg-slate-50 p-4 text-sm text-muted-foreground">
                  Place this script before the closing body tag on your website. The assistant will use approved settings and
                  processed knowledge sources.
                </div>
              </>
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Embed code is generated only after admin approval. Current status: <StatusBadge status={tenant.status} />
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
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
