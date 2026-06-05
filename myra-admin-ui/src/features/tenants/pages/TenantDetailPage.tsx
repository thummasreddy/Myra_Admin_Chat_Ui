import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, CreditCard, KeyRound, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getTenant, regenerateTenantApiKey, setTenantStatus, updateTenant } from "@/features/tenants/tenant.api";
import {
  defaultTenantWizardValues,
  tenantWizardSchema,
  toTenantCreateRequest,
  toTenantWizardValues,
  type TenantWizardFormValues
} from "@/features/tenants/tenant.schema";
import type { TenantStatus } from "@/features/tenants/tenant.types";
import { documentReviewMessage } from "@/features/onboarding/onboarding.api";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import { formatDate } from "@/lib/utils";

function FieldError({ name, errors }: { name: keyof TenantWizardFormValues; errors: FieldErrors<TenantWizardFormValues> }) {
  const message = errors[name]?.message;
  return message ? <p className="text-sm text-red-600">{String(message)}</p> : null;
}

export function TenantDetailPage() {
  const { tenantId = "" } = useParams();
  const [pendingStatus, setPendingStatus] = useState<TenantStatus | null>(null);
  const queryClient = useQueryClient();
  const tenantQuery = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => getTenant(tenantId),
    enabled: Boolean(tenantId)
  });

  const form = useForm<TenantWizardFormValues>({
    resolver: zodResolver(tenantWizardSchema) as Resolver<TenantWizardFormValues>,
    defaultValues: defaultTenantWizardValues
  });

  useEffect(() => {
    if (tenantQuery.data) {
      form.reset(toTenantWizardValues(tenantQuery.data));
    }
  }, [form, tenantQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: TenantWizardFormValues) => updateTenant(tenantId, toTenantCreateRequest(values)),
    onSuccess: (tenant) => {
      queryClient.setQueryData(["tenant", tenantId], tenant);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({ title: "Tenant updated", variant: "success" });
    },
    onError: () => toast({ title: "Update failed", description: "Tenant settings were not saved.", variant: "error" })
  });

  const statusMutation = useMutation({
    mutationFn: (status: TenantStatus) => setTenantStatus(tenantId, status),
    onSuccess: (tenant) => {
      queryClient.setQueryData(["tenant", tenantId], tenant);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({ title: `Tenant ${tenant.status.toLowerCase()}`, variant: "success" });
      setPendingStatus(null);
    }
  });

  const keyMutation = useMutation({
    mutationFn: () => regenerateTenantApiKey(tenantId),
    onSuccess: (tenant) => {
      queryClient.setQueryData(["tenant", tenantId], tenant);
      toast({ title: "API key regenerated", variant: "success" });
    },
    onError: () => toast({ title: "Could not regenerate API key", variant: "error" })
  });

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast({ title: "Copied", variant: "success" });
  }

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading tenant" />;
  if (!tenantQuery.data) return <PageHeader title="Tenant not found" description="The requested tenant does not exist." />;

  const tenant = tenantQuery.data;
  const nextStatus: TenantStatus = tenant.status === "ACTIVE" || tenant.status === "APPROVED" ? "INACTIVE" : "ACTIVE";
  const plan = getSubscriptionPlan(tenant.selectedSubscriptionPlan);

  return (
    <>
      <PageHeader
        title={tenant.tenantName}
        description="View tenant details, edit configuration, and manage lifecycle state."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/widget/${tenant.tenantId}`}>Widget Config</Link>
            </Button>
            <Button variant="outline" onClick={() => setPendingStatus(nextStatus)}>
              <Power className="h-4 w-4" />
              {nextStatus === "ACTIVE" ? "Activate" : "Deactivate"}
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusBadge status={tenant.status} />
            <p className="text-sm text-muted-foreground">Created {formatDate(tenant.createdAt)}</p>
            <p className="text-sm text-muted-foreground">Updated {formatDate(tenant.updatedAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">{formatPlanPrice(plan)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Payment</span>
              <StatusBadge status={tenant.paymentStatus ?? "PAID"} />
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Documents</span>
              <StatusBadge status={tenant.documentProcessingStatus ?? "NOT_UPLOADED"} />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>API Key</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 break-all rounded-md bg-slate-100 px-3 py-2 text-sm">{tenant.apiKey}</code>
            <Button variant="outline" onClick={() => copy(tenant.apiKey)}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button onClick={() => keyMutation.mutate()} disabled={keyMutation.isPending}>
              <KeyRound className="h-4 w-4" />
              Regenerate
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registration Review</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Business email</p>
            <p className="font-medium text-slate-950">{tenant.businessEmail ?? tenant.supportEmail}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone number</p>
            <p className="font-medium text-slate-950">{tenant.phoneNumber ?? "N/A"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-muted-foreground">Business description</p>
            <p className="font-medium text-slate-950">{tenant.businessDescription ?? "No public registration description was provided."}</p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 md:col-span-2">
            {documentReviewMessage}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Info</CardTitle>
          </CardHeader>
          <CardContent className="form-grid">
            <div className="space-y-2">
              <Label>Tenant name</Label>
              <Input {...form.register("tenantName")} />
              <FieldError name="tenantName" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input {...form.register("websiteUrl")} />
              <FieldError name="websiteUrl" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input {...form.register("industry")} />
              <FieldError name="industry" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>Support email</Label>
              <Input type="email" {...form.register("supportEmail")} />
              <FieldError name="supportEmail" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...form.register("country")} />
              <FieldError name="country" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input {...form.register("timezone")} />
              <FieldError name="timezone" errors={form.formState.errors} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding & AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-grid">
              <div className="space-y-2">
                <Label>Assistant name</Label>
                <Input {...form.register("assistantName")} />
                <FieldError name="assistantName" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label>Brand color</Label>
                <Input {...form.register("brandColor")} />
                <FieldError name="brandColor" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label>Chat position</Label>
                <Select {...form.register("chatPosition")}>
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </Select>
                <FieldError name="chatPosition" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label>Response style</Label>
                <Select {...form.register("responseStyle")}>
                  <option value="FRIENDLY">Friendly</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="CONCISE">Concise</option>
                  <option value="SALES">Sales</option>
                </Select>
                <FieldError name="responseStyle" errors={form.formState.errors} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assistant intro</Label>
              <Textarea {...form.register("assistantIntro")} />
              <FieldError name="assistantIntro" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>System prompt</Label>
              <Textarea className="min-h-32" {...form.register("systemPrompt")} />
              <FieldError name="systemPrompt" errors={form.formState.errors} />
            </div>
            <div className="form-grid">
              <div className="space-y-2">
                <Label>Allowed topics</Label>
                <Textarea {...form.register("allowedTopics")} />
                <FieldError name="allowedTopics" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label>Blocked topics</Label>
                <Textarea {...form.register("blockedTopics")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Suggested prompts</Label>
              <Textarea {...form.register("suggestedPrompts")} />
              <FieldError name="suggestedPrompts" errors={form.formState.errors} />
            </div>
            <div className="space-y-2">
              <Label>Fallback message</Label>
              <Textarea {...form.register("fallbackMessage")} />
              <FieldError name="fallbackMessage" errors={form.formState.errors} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["enableWebSearch", "Web search"],
              ["enableLeadCapture", "Lead capture"],
              ["enableSuggestedPrompts", "Suggested prompts"],
              ["enableAnalytics", "Analytics"],
              ["enableHumanEscalation", "Human escalation"]
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium">
                <Checkbox {...form.register(name as keyof TenantWizardFormValues)} />
                {label}
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={`${pendingStatus === "ACTIVE" ? "Activate" : "Deactivate"} tenant?`}
        description="This changes whether the tenant widget can serve live conversations."
        confirmLabel={pendingStatus === "ACTIVE" ? "Activate" : "Deactivate"}
        destructive={pendingStatus === "INACTIVE"}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => pendingStatus && statusMutation.mutate(pendingStatus)}
      />
    </>
  );
}
