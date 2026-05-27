import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenantWizardFormValues } from "@/features/tenants/tenant.schema";

export function ReviewPublishStep() {
  const { watch } = useFormContext<TenantWizardFormValues>();
  const values = watch();
  const enabled = Object.entries(values).filter(([key, value]) => key.startsWith("enable") && value);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Tenant:</span> {values.tenantName}</p>
          <p><span className="font-medium">Website:</span> {values.websiteUrl}</p>
          <p><span className="font-medium">Industry:</span> {values.industry}</p>
          <p><span className="font-medium">Support:</span> {values.supportEmail}</p>
          <p><span className="font-medium">Region:</span> {values.country} / {values.timezone}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Name:</span> {values.assistantName}</p>
          <p><span className="font-medium">Style:</span> {values.responseStyle}</p>
          <p><span className="font-medium">Position:</span> {values.chatPosition}</p>
          <p><span className="font-medium">Brand:</span> <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: values.brandColor }} />{values.brandColor}</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="line-clamp-4 text-muted-foreground">{values.systemPrompt}</p>
          <div>
            <p className="font-medium">Allowed topics</p>
            <p className="text-muted-foreground">{values.allowedTopics}</p>
          </div>
          <div>
            <p className="font-medium">Blocked topics</p>
            <p className="text-muted-foreground">{values.blockedTopics || "None"}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Enabled Features</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {enabled.map(([key]) => (
            <Badge key={key} variant="secondary">{key.replace("enable", "")}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
