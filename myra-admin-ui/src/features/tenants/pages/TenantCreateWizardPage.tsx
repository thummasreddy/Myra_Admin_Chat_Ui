import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { createTenant } from "@/features/tenants/tenant.api";
import {
  defaultTenantWizardValues,
  tenantWizardSchema,
  toTenantCreateRequest,
  type TenantWizardFormValues
} from "@/features/tenants/tenant.schema";
import type { TenantCreateResponse } from "@/features/tenants/tenant.types";
import { AiConfigStep } from "@/features/tenants/components/AiConfigStep";
import { BrandingStep } from "@/features/tenants/components/BrandingStep";
import { BusinessInfoStep } from "@/features/tenants/components/BusinessInfoStep";
import { FeatureToggleStep } from "@/features/tenants/components/FeatureToggleStep";
import { ReviewPublishStep } from "@/features/tenants/components/ReviewPublishStep";
import { TenantWizardSteps, wizardSteps } from "@/features/tenants/components/TenantWizardSteps";

const stepFields: (keyof TenantWizardFormValues)[][] = [
  ["tenantName", "websiteUrl", "industry", "supportEmail", "country", "timezone"],
  ["assistantName", "assistantIntro", "brandColor", "logoUrl", "avatarUrl", "chatPosition"],
  ["systemPrompt", "responseStyle", "allowedTopics", "blockedTopics", "fallbackMessage", "suggestedPrompts"],
  ["enableWebSearch", "enableLeadCapture", "enableSuggestedPrompts", "enableAnalytics", "enableHumanEscalation"],
  []
];

export function TenantCreateWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [created, setCreated] = useState<TenantCreateResponse | null>(null);
  const queryClient = useQueryClient();
  const form = useForm<TenantWizardFormValues>({
    resolver: zodResolver(tenantWizardSchema) as Resolver<TenantWizardFormValues>,
    defaultValues: defaultTenantWizardValues,
    mode: "onBlur"
  });

  const createMutation = useMutation({
    mutationFn: (values: TenantWizardFormValues) => createTenant(toTenantCreateRequest(values)),
    onSuccess: (response) => {
      setCreated(response);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({ title: "Tenant created", description: `${response.tenant.tenantName} is ready to configure.`, variant: "success" });
    },
    onError: () => {
      toast({ title: "Tenant creation failed", description: "Review the form and try again.", variant: "error" });
    }
  });

  async function nextStep() {
    const valid = await form.trigger(stepFields[currentStep]);
    if (valid) setCurrentStep((step) => Math.min(step + 1, wizardSteps.length - 1));
  }

  function previousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast({ title: `${label} copied`, variant: "success" });
  }

  const stepContent = [
    <BusinessInfoStep key="business" />,
    <BrandingStep key="branding" />,
    <AiConfigStep key="ai" />,
    <FeatureToggleStep key="features" />,
    <ReviewPublishStep key="review" />
  ][currentStep];

  if (created) {
    return (
      <>
        <PageHeader title="Tenant Published" description="Save the generated credentials and continue to widget configuration." />
        <Card>
          <CardHeader>
            <CardTitle>{created.tenant.tenantName}</CardTitle>
            <CardDescription>Tenant creation completed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border bg-[var(--color-bg-muted)] p-4">
                <p className="text-sm font-medium text-muted-foreground">tenantId</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <code className="break-all text-sm font-semibold">{created.tenantId}</code>
                  <Button variant="outline" size="icon" onClick={() => copy(created.tenantId, "Tenant ID")} aria-label="Copy tenant ID">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-md border bg-[var(--color-bg-muted)] p-4">
                <p className="text-sm font-medium text-muted-foreground">apiKey</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <code className="break-all text-sm font-semibold">{created.apiKey}</code>
                  <Button variant="outline" size="icon" onClick={() => copy(created.apiKey, "API key")} aria-label="Copy API key">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link to={`/widget/${created.tenantId}`}>
                Open Widget Config
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Create Tenant" description="Configure business details, branding, AI behavior, and enabled features." />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))} className="space-y-6">
          <TenantWizardSteps currentStep={currentStep} />

          <Card>
            <CardHeader>
              <CardTitle>{wizardSteps[currentStep].title}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {wizardSteps.length}
              </CardDescription>
            </CardHeader>
            <CardContent>{stepContent}</CardContent>
          </Card>

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={previousStep} disabled={currentStep === 0 || createMutation.isPending}>
              Back
            </Button>
            {currentStep < wizardSteps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Publishing..." : "Publish Tenant"}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </>
  );
}
