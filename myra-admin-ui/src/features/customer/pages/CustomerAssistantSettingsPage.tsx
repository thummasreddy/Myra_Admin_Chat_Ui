import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, BrainCircuit, Palette, Save, Sparkles, Workflow, Zap } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { TestExtractionPanel } from "@/features/customer/components/TestExtractionPanel";
import { updateTenant } from "@/features/tenants/tenant.api";
import { RESPONSE_STYLES } from "@/lib/constants";
import { defaultAiBehaviorCaptureValues } from "@/features/tenants/tenant.schema";
import { useCustomerTenant } from "@/features/customer/customer.hooks";

type RequiredFieldName = "leadRequiredFields" | "orderRequiredFields" | "appointmentRequiredFields";

type RequiredFieldOption = {
  value: string;
  label: string;
  description: string;
};

const contactFieldValues = new Set(["phone_or_email", "phone", "email"]);

const leadFieldOptions: RequiredFieldOption[] = [
  {
    value: "name",
    label: "Customer name",
    description: "Useful for follow-up and CRM matching."
  },
  {
    value: "phone_or_email",
    label: "Phone or email",
    description: "Requires at least one contact channel."
  },
  {
    value: "service_or_product_interest",
    label: "Service or product interest",
    description: "Captures what the visitor wants help with."
  },
  {
    value: "message",
    label: "Customer message",
    description: "Stores the original request for context."
  }
];

const orderFieldOptions: RequiredFieldOption[] = [
  {
    value: "product_or_service",
    label: "Product or service",
    description: "Identifies what the customer wants to order."
  },
  {
    value: "quantity_or_people_count",
    label: "Quantity or people count",
    description: "Captures units, seats, guests, or project size."
  },
  {
    value: "phone_or_email",
    label: "Phone or email",
    description: "Keeps the team able to confirm the request."
  },
  {
    value: "delivery_or_pickup_preference",
    label: "Delivery or pickup preference",
    description: "Optional fulfillment preference for the order."
  }
];

const appointmentFieldOptions: RequiredFieldOption[] = [
  {
    value: "service_required",
    label: "Service required",
    description: "Clarifies the appointment type."
  },
  {
    value: "preferred_date",
    label: "Preferred date",
    description: "Collects the customer's first date choice."
  },
  {
    value: "preferred_time",
    label: "Preferred time",
    description: "Collects the requested time window."
  },
  {
    value: "phone_or_email",
    label: "Phone or email",
    description: "Allows confirmation before booking."
  }
];

const sessionExpirationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "24 hours" },
  { value: 10080, label: "7 days" }
];

const settingsSchema = z.object({
  assistantName: z.string().min(2, "Assistant name is required"),
  assistantIntro: z.string().min(10, "Intro message should be more descriptive"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #EA5455"),
  responseStyle: z.enum(RESPONSE_STYLES),
  businessDescription: z.string().min(30, "Business description should be at least 30 characters"),
  allowedTopics: z.string().min(2, "Choose at least one allowed topic"),
  fallbackMessage: z.string().min(10, "Fallback message is required"),
  suggestedPrompts: z.string().min(5, "Add at least one suggested prompt"),
  systemPrompt: z.string().min(20, "System prompt should be at least 20 characters"),
  enableLeadCapture: z.boolean(),
  enableSuggestedPrompts: z.boolean(),
  enableAnalytics: z.boolean(),
  enableHumanEscalation: z.boolean(),
  enableWebSearch: z.boolean(),
  enableMultiTurnMemory: z.boolean().default(defaultAiBehaviorCaptureValues.enableMultiTurnMemory),
  enableStructuredExtraction: z.boolean().default(defaultAiBehaviorCaptureValues.enableStructuredExtraction),
  enableOrderCapture: z.boolean().default(defaultAiBehaviorCaptureValues.enableOrderCapture),
  enableAppointmentCapture: z.boolean().default(defaultAiBehaviorCaptureValues.enableAppointmentCapture),
  enableConversationSummary: z.boolean().default(defaultAiBehaviorCaptureValues.enableConversationSummary),
  sessionExpirationMinutes: z.coerce
    .number()
    .min(1, "Session expiration must be at least 1 minute")
    .max(10080, "Session expiration cannot exceed 7 days")
    .default(defaultAiBehaviorCaptureValues.sessionExpirationMinutes),
  leadRequiredFields: z.array(z.string()).default(() => [...defaultAiBehaviorCaptureValues.leadRequiredFields]),
  orderRequiredFields: z.array(z.string()).default(() => [...defaultAiBehaviorCaptureValues.orderRequiredFields]),
  appointmentRequiredFields: z.array(z.string()).default(() => [...defaultAiBehaviorCaptureValues.appointmentRequiredFields])
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const featureToggles: {
  name: keyof Pick<
    SettingsFormValues,
    "enableLeadCapture" | "enableSuggestedPrompts" | "enableAnalytics" | "enableHumanEscalation" | "enableWebSearch"
  >;
  title: string;
  description: string;
}[] = [
  {
    name: "enableLeadCapture",
    title: "Lead capture",
    description: "Collect name, email, phone, and customer requirements when visitors need follow-up."
  },
  {
    name: "enableSuggestedPrompts",
    title: "Suggested prompts",
    description: "Show quick-start prompts that help customers ask useful first questions."
  },
  {
    name: "enableAnalytics",
    title: "Analytics",
    description: "Track conversations, lead activity, fallback rates, and top customer questions."
  },
  {
    name: "enableHumanEscalation",
    title: "Human handoff",
    description: "Guide complex conversations toward contact, phone, email, or support follow-up."
  },
  {
    name: "enableWebSearch",
    title: "Web search",
    description: "Allow approved web lookup when backend support is enabled for this business."
  }
];

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CustomerAssistantSettingsPage() {
  const { tenantId, tenantQuery } = useCustomerTenant();
  const queryClient = useQueryClient();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsFormValues>,
    defaultValues: {
      assistantName: "Myra",
      assistantIntro: "Hi, I am Myra. I can help with questions, services, pricing, and next steps.",
      brandColor: "#EA5455",
      responseStyle: "PROFESSIONAL",
      businessDescription: "",
      allowedTopics: "products, pricing, services, appointments, policies, support",
      fallbackMessage: "I do not have that answer yet. Please contact our team.",
      suggestedPrompts: "What services do you offer?\nHow can I get pricing?\nCan someone contact me?",
      systemPrompt: "You are Myra, a helpful AI assistant for this business. Answer from approved business knowledge.",
      enableLeadCapture: true,
      enableSuggestedPrompts: true,
      enableAnalytics: true,
      enableHumanEscalation: true,
      enableWebSearch: false,
      ...defaultAiBehaviorCaptureValues
    }
  });

  useEffect(() => {
    if (tenantQuery.data) {
      form.reset({
        assistantName: tenantQuery.data.assistantName,
        assistantIntro: tenantQuery.data.assistantIntro,
        brandColor: tenantQuery.data.brandColor,
        responseStyle: tenantQuery.data.responseStyle,
        businessDescription: tenantQuery.data.businessDescription ?? "",
        allowedTopics: tenantQuery.data.allowedTopics.join(", "),
        fallbackMessage: tenantQuery.data.fallbackMessage,
        suggestedPrompts: tenantQuery.data.suggestedPrompts.join("\n"),
        systemPrompt: tenantQuery.data.systemPrompt,
        enableLeadCapture: tenantQuery.data.enableLeadCapture,
        enableSuggestedPrompts: tenantQuery.data.enableSuggestedPrompts,
        enableAnalytics: tenantQuery.data.enableAnalytics,
        enableHumanEscalation: tenantQuery.data.enableHumanEscalation,
        enableWebSearch: tenantQuery.data.enableWebSearch,
        enableMultiTurnMemory: tenantQuery.data.enableMultiTurnMemory ?? defaultAiBehaviorCaptureValues.enableMultiTurnMemory,
        enableStructuredExtraction:
          tenantQuery.data.enableStructuredExtraction ?? defaultAiBehaviorCaptureValues.enableStructuredExtraction,
        enableOrderCapture: tenantQuery.data.enableOrderCapture ?? defaultAiBehaviorCaptureValues.enableOrderCapture,
        enableAppointmentCapture: tenantQuery.data.enableAppointmentCapture ?? defaultAiBehaviorCaptureValues.enableAppointmentCapture,
        enableConversationSummary: tenantQuery.data.enableConversationSummary ?? defaultAiBehaviorCaptureValues.enableConversationSummary,
        sessionExpirationMinutes: tenantQuery.data.sessionExpirationMinutes ?? defaultAiBehaviorCaptureValues.sessionExpirationMinutes,
        leadRequiredFields: tenantQuery.data.leadRequiredFields ?? [...defaultAiBehaviorCaptureValues.leadRequiredFields],
        orderRequiredFields: tenantQuery.data.orderRequiredFields ?? [...defaultAiBehaviorCaptureValues.orderRequiredFields],
        appointmentRequiredFields: tenantQuery.data.appointmentRequiredFields ?? [
          ...defaultAiBehaviorCaptureValues.appointmentRequiredFields
        ]
      });
    }
  }, [form, tenantQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      updateTenant(tenantId, {
        ...values,
        allowedTopics: splitList(values.allowedTopics),
        suggestedPrompts: splitList(values.suggestedPrompts)
      }),
    onSuccess: (tenant) => {
      queryClient.setQueryData(["tenant", tenantId], tenant);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({ title: "Assistant configuration saved", variant: "success" });
    },
    onError: () => toast({ title: "Settings were not saved", variant: "error" })
  });

  const structuredExtractionEnabled = form.watch("enableStructuredExtraction");

  useEffect(() => {
    if (!structuredExtractionEnabled) {
      if (form.getValues("enableOrderCapture")) {
        form.setValue("enableOrderCapture", false, { shouldDirty: true, shouldValidate: true });
      }
      if (form.getValues("enableAppointmentCapture")) {
        form.setValue("enableAppointmentCapture", false, { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [form, structuredExtractionEnabled]);

  function toggleRequiredField(fieldName: RequiredFieldName, fieldValue: string, checked: boolean) {
    const currentValues = form.getValues(fieldName) ?? [];
    const nextValues = checked
      ? Array.from(new Set([...currentValues, fieldValue]))
      : currentValues.filter((value) => value !== fieldValue);

    form.setValue(fieldName, nextValues, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }

  function handleSave(values: SettingsFormValues) {
    if (values.sessionExpirationMinutes < 1 || values.sessionExpirationMinutes > 10080) {
      form.setError("sessionExpirationMinutes", {
        type: "validate",
        message: "Session expiration must be between 1 minute and 7 days"
      });
      toast({
        title: "Review session expiration",
        description: "Choose a value between 1 minute and 7 days.",
        variant: "error"
      });
      return;
    }

    if (values.enableLeadCapture && !values.leadRequiredFields.some((field) => contactFieldValues.has(field))) {
      form.setError("leadRequiredFields", {
        type: "validate",
        message: "Lead capture requires phone or email."
      });
      toast({
        title: "Lead capture needs a contact field",
        description: "Select phone or email before saving.",
        variant: "error"
      });
      return;
    }

    saveMutation.mutate({
      ...values,
      enableOrderCapture: values.enableStructuredExtraction && values.enableOrderCapture,
      enableAppointmentCapture: values.enableStructuredExtraction && values.enableAppointmentCapture
    });
  }

  function handleInvalidSubmit(errors: FieldErrors<SettingsFormValues>) {
    const firstError = Object.values(errors).find((error) => error && "message" in error);
    const description =
      firstError && "message" in firstError && typeof firstError.message === "string"
        ? firstError.message
        : "Fix the highlighted settings and try again.";

    toast({
      title: "Review assistant settings",
      description,
      variant: "error"
    });
  }

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading assistant settings" />;

  const values = form.watch();
  const prompts = splitList(values.suggestedPrompts).slice(0, 3);
  const leadRequiredFieldsError = form.formState.errors.leadRequiredFields?.message;
  const sessionExpirationError = form.formState.errors.sessionExpirationMinutes?.message;

  return (
    <>
      <PageHeader
        title="Assistant Setup"
        description="Configure how Myra greets customers, what it can discuss, which features are enabled, and how it behaves on your website."
        actions={
          <Button form="assistant-settings-form" type="submit" disabled={saveMutation.isPending || !tenantId}>
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Setup"}
          </Button>
        }
      />

      <form
        id="assistant-settings-form"
        className="grid gap-6 xl:grid-cols-[1fr_380px]"
        onSubmit={form.handleSubmit(handleSave, handleInvalidSubmit)}
      >
        <Card>
          <CardContent className="p-5">
            <Tabs defaultValue="branding">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100">
                <TabsTrigger value="branding">
                  <Palette className="mr-2 h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="behavior">
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Behavior
                </TabsTrigger>
                <TabsTrigger value="knowledge">
                  <Workflow className="mr-2 h-4 w-4" />
                  Knowledge
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Zap className="mr-2 h-4 w-4" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="ai-capture">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Behavior & Capture
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-4">
                <div className="form-grid">
                  <Field label="Assistant name" error={form.formState.errors.assistantName?.message}>
                    <Input {...form.register("assistantName")} />
                  </Field>
                  <Field label="Response style" error={form.formState.errors.responseStyle?.message}>
                    <Select {...form.register("responseStyle")}>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="FRIENDLY">Friendly</option>
                      <option value="CASUAL">Casual</option>
                      <option value="FORMAL">Formal</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Assistant intro message" error={form.formState.errors.assistantIntro?.message}>
                  <Textarea className="min-h-24" {...form.register("assistantIntro")} />
                </Field>
                <Field label="Brand color" error={form.formState.errors.brandColor?.message}>
                  <div className="flex items-center gap-3">
                    <Input type="color" className="h-10 w-16 p-1" {...form.register("brandColor")} />
                    <span className="text-sm font-medium text-muted-foreground">{values.brandColor}</span>
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <Field
                  label="Fallback message"
                  error={form.formState.errors.fallbackMessage?.message}
                  helper="This message is shown when the assistant does not know the answer."
                >
                  <Textarea className="min-h-24" {...form.register("fallbackMessage")} />
                </Field>
                <Field
                  label="Suggested prompts"
                  error={form.formState.errors.suggestedPrompts?.message}
                  helper="Put each prompt on a new line. These appear as quick starts inside the assistant."
                >
                  <Textarea className="min-h-28" {...form.register("suggestedPrompts")} />
                </Field>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-4">
                <Field label="Business description" error={form.formState.errors.businessDescription?.message}>
                  <Textarea className="min-h-28" {...form.register("businessDescription")} />
                </Field>
                <Field
                  label="Allowed topics"
                  error={form.formState.errors.allowedTopics?.message}
                  helper="Choose what your assistant is allowed to answer, such as products, pricing, appointments, delivery, support, or business FAQs."
                >
                  <Textarea className="min-h-24" {...form.register("allowedTopics")} />
                </Field>
                <Field label="Business-specific system prompt" error={form.formState.errors.systemPrompt?.message}>
                  <Textarea className="min-h-32 font-mono text-sm" {...form.register("systemPrompt")} />
                </Field>
              </TabsContent>

              <TabsContent value="features" className="grid gap-3 md:grid-cols-2">
                {featureToggles.map((feature) => (
                  <label
                    key={feature.name}
                    className="flex cursor-pointer gap-3 rounded-md border bg-slate-50 p-4 transition-colors hover:bg-white"
                  >
                    <Checkbox {...form.register(feature.name)} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">{feature.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{feature.description}</span>
                    </span>
                  </label>
                ))}
              </TabsContent>

              <TabsContent value="ai-capture" className="space-y-5">
                <SectionBlock
                  title="Feature toggles"
                  description="Control how much conversational context Myra keeps and whether it extracts structured customer requests."
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer gap-3 rounded-md border bg-slate-50 p-4 transition-colors hover:bg-white">
                      <Checkbox {...form.register("enableMultiTurnMemory")} />
                      <span>
                        <span className="block text-sm font-semibold text-slate-950">Multi-turn memory</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Remember context within a session so follow-up questions feel continuous.
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer gap-3 rounded-md border bg-slate-50 p-4 transition-colors hover:bg-white">
                      <Checkbox {...form.register("enableStructuredExtraction")} />
                      <span>
                        <span className="block text-sm font-semibold text-slate-950">Structured extraction</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Detect intent and extract lead, order, and appointment fields from conversations.
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer gap-3 rounded-md border bg-slate-50 p-4 transition-colors hover:bg-white">
                      <Checkbox {...form.register("enableConversationSummary")} />
                      <span>
                        <span className="block text-sm font-semibold text-slate-950">Conversation summary</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Summarize important details for admin review and human follow-up.
                        </span>
                      </span>
                    </label>
                  </div>
                </SectionBlock>

                <SectionBlock
                  title="Lead Capture Configuration"
                  description="Choose which fields Myra must collect before creating a lead."
                >
                  <InfoBox>
                    Lead quality rules keep captured leads actionable. When lead capture is enabled, at least one contact option must stay
                    selected.
                  </InfoBox>
                  {!values.enableLeadCapture ? (
                    <InfoBox variant="warning">
                      Lead capture is disabled in the Features tab. Required fields are preserved but cannot be changed while the feature is
                      off.
                    </InfoBox>
                  ) : null}
                  <RequiredFieldChecklist
                    options={leadFieldOptions}
                    selected={values.leadRequiredFields ?? []}
                    disabled={!values.enableLeadCapture}
                    onToggle={(fieldValue, checked) => toggleRequiredField("leadRequiredFields", fieldValue, checked)}
                  />
                  {typeof leadRequiredFieldsError === "string" ? <p className="text-sm text-red-600">{leadRequiredFieldsError}</p> : null}
                </SectionBlock>

                <SectionBlock
                  title="Order Capture Configuration"
                  description="Let Myra collect order intent and hand the request to your team for confirmation."
                >
                  <label
                    className={`flex gap-3 rounded-md border bg-slate-50 p-4 transition-colors ${
                      values.enableStructuredExtraction ? "cursor-pointer hover:bg-white" : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Checkbox {...form.register("enableOrderCapture")} disabled={!values.enableStructuredExtraction} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">Enable order capture</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Collect order details after the assistant detects a purchase or quote request.
                      </span>
                    </span>
                  </label>
                  <InfoBox variant="warning">
                    Order capture records intent only. Myra does not process payments, reserve inventory, or finalize purchases.
                  </InfoBox>
                  {!values.enableStructuredExtraction ? (
                    <InfoBox variant="warning">Turn on structured extraction before enabling order capture.</InfoBox>
                  ) : null}
                  {values.enableOrderCapture && values.enableStructuredExtraction ? (
                    <RequiredFieldChecklist
                      options={orderFieldOptions}
                      selected={values.orderRequiredFields ?? []}
                      onToggle={(fieldValue, checked) => toggleRequiredField("orderRequiredFields", fieldValue, checked)}
                    />
                  ) : null}
                </SectionBlock>

                <SectionBlock
                  title="Appointment Capture Configuration"
                  description="Collect scheduling details so staff can confirm an appointment."
                >
                  <label
                    className={`flex gap-3 rounded-md border bg-slate-50 p-4 transition-colors ${
                      values.enableStructuredExtraction ? "cursor-pointer hover:bg-white" : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Checkbox {...form.register("enableAppointmentCapture")} disabled={!values.enableStructuredExtraction} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">Enable appointment capture</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Ask for service, date, time, and contact details before passing the request to staff.
                      </span>
                    </span>
                  </label>
                  {!values.enableStructuredExtraction ? (
                    <InfoBox variant="warning">Appointment capture depends on structured extraction being enabled.</InfoBox>
                  ) : null}
                  {values.enableAppointmentCapture && values.enableStructuredExtraction ? (
                    <RequiredFieldChecklist
                      options={appointmentFieldOptions}
                      selected={values.appointmentRequiredFields ?? []}
                      onToggle={(fieldValue, checked) => toggleRequiredField("appointmentRequiredFields", fieldValue, checked)}
                    />
                  ) : null}
                </SectionBlock>

                <SectionBlock
                  title="Conversation Memory Settings"
                  description="Set how long session-scoped conversation memory remains active."
                >
                  <Field
                    label="Session expiration"
                    error={typeof sessionExpirationError === "string" ? sessionExpirationError : undefined}
                    helper="Memory expires after this window. The maximum is 7 days."
                  >
                    <Select {...form.register("sessionExpirationMinutes", { valueAsNumber: true })}>
                      {sessionExpirationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <InfoBox>
                    Conversation memory is session-based and should be treated as short-lived context, not permanent customer history.
                  </InfoBox>
                </SectionBlock>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border bg-slate-950 text-white shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 p-4" style={{ backgroundColor: values.brandColor }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{values.assistantName || "Myra"}</p>
                    <p className="text-xs text-white/75">Online now</p>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="max-w-[85%] rounded-md bg-white/10 p-3 text-sm leading-6">{values.assistantIntro}</div>
                  {prompts.length ? (
                    <div className="flex flex-wrap gap-2">
                      {prompts.map((prompt) => (
                        <span key={prompt} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/85">
                          {prompt}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="rounded-md border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                    Style: {values.responseStyle}. Lead capture {values.enableLeadCapture ? "enabled" : "disabled"}. Multi-turn memory{" "}
                    {values.enableMultiTurnMemory ? "enabled" : "disabled"}. Structured extraction{" "}
                    {values.enableStructuredExtraction ? "enabled" : "disabled"}.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <TestExtractionPanel tenantId={tenantId} />
        </aside>
      </form>
    </>
  );
}

function Field({ label, error, helper, children }: { label: string; error?: string; helper?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SectionBlock({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border bg-white p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function InfoBox({ children, variant = "info" }: { children: ReactNode; variant?: "info" | "warning" }) {
  const className =
    variant === "warning"
      ? "rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
      : "rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900";

  return <div className={className}>{children}</div>;
}

function RequiredFieldChecklist({
  options,
  selected,
  disabled = false,
  onToggle
}: {
  options: RequiredFieldOption[];
  selected: string[];
  disabled?: boolean;
  onToggle: (fieldValue: string, checked: boolean) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex gap-3 rounded-md border bg-slate-50 p-3 transition-colors ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-white"
          }`}
        >
          <Checkbox
            checked={selected.includes(option.value)}
            disabled={disabled}
            onChange={(event) => onToggle(option.value, event.currentTarget.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-slate-950">{option.label}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
