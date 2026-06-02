import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, BrainCircuit, Palette, Save, Sparkles, Workflow, Zap } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
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
import { updateTenant } from "@/features/tenants/tenant.api";
import { useCustomerTenant } from "@/features/customer/customer.hooks";

const settingsSchema = z.object({
  assistantName: z.string().min(2, "Assistant name is required"),
  assistantIntro: z.string().min(10, "Intro message should be more descriptive"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #14B8A6"),
  responseStyle: z.enum(["friendly", "professional", "concise", "sales"]),
  businessDescription: z.string().min(30, "Business description should be at least 30 characters"),
  allowedTopics: z.string().min(2, "Choose at least one allowed topic"),
  fallbackMessage: z.string().min(10, "Fallback message is required"),
  suggestedPrompts: z.string().min(5, "Add at least one suggested prompt"),
  systemPrompt: z.string().min(20, "System prompt should be at least 20 characters"),
  enableLeadCapture: z.boolean(),
  enableSuggestedPrompts: z.boolean(),
  enableAnalytics: z.boolean(),
  enableHumanEscalation: z.boolean(),
  enableWebSearch: z.boolean()
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const featureToggles: { name: keyof Pick<SettingsFormValues, "enableLeadCapture" | "enableSuggestedPrompts" | "enableAnalytics" | "enableHumanEscalation" | "enableWebSearch">; title: string; description: string }[] = [
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
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      assistantName: "Myra",
      assistantIntro: "Hi, I am Myra. I can help with questions, services, pricing, and next steps.",
      brandColor: "#14B8A6",
      responseStyle: "professional",
      businessDescription: "",
      allowedTopics: "products, pricing, services, appointments, policies, support",
      fallbackMessage: "I do not have that answer yet. Please contact our team.",
      suggestedPrompts: "What services do you offer?\nHow can I get pricing?\nCan someone contact me?",
      systemPrompt: "You are Myra, a helpful AI assistant for this business. Answer from approved business knowledge.",
      enableLeadCapture: true,
      enableSuggestedPrompts: true,
      enableAnalytics: true,
      enableHumanEscalation: true,
      enableWebSearch: false
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
        enableWebSearch: tenantQuery.data.enableWebSearch
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

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading assistant settings" />;

  const values = form.watch();
  const prompts = splitList(values.suggestedPrompts).slice(0, 3);

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

      <form id="assistant-settings-form" className="grid gap-6 xl:grid-cols-[1fr_380px]" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
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
              </TabsList>

              <TabsContent value="branding" className="space-y-4">
                <div className="form-grid">
                  <Field label="Assistant name" error={form.formState.errors.assistantName?.message}>
                    <Input {...form.register("assistantName")} />
                  </Field>
                  <Field label="Response style" error={form.formState.errors.responseStyle?.message}>
                    <Select {...form.register("responseStyle")}>
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                      <option value="concise">Concise</option>
                      <option value="sales">Sales assisted</option>
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
                <Field label="Fallback message" error={form.formState.errors.fallbackMessage?.message} helper="This message is shown when the assistant does not know the answer.">
                  <Textarea className="min-h-24" {...form.register("fallbackMessage")} />
                </Field>
                <Field label="Suggested prompts" error={form.formState.errors.suggestedPrompts?.message} helper="Put each prompt on a new line. These appear as quick starts inside the assistant.">
                  <Textarea className="min-h-28" {...form.register("suggestedPrompts")} />
                </Field>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-4">
                <Field label="Business description" error={form.formState.errors.businessDescription?.message}>
                  <Textarea className="min-h-28" {...form.register("businessDescription")} />
                </Field>
                <Field label="Allowed topics" error={form.formState.errors.allowedTopics?.message} helper="Choose what your assistant is allowed to answer, such as products, pricing, appointments, delivery, support, or business FAQs.">
                  <Textarea className="min-h-24" {...form.register("allowedTopics")} />
                </Field>
                <Field label="Business-specific system prompt" error={form.formState.errors.systemPrompt?.message}>
                  <Textarea className="min-h-32 font-mono text-sm" {...form.register("systemPrompt")} />
                </Field>
              </TabsContent>

              <TabsContent value="features" className="grid gap-3 md:grid-cols-2">
                {featureToggles.map((feature) => (
                  <label key={feature.name} className="flex cursor-pointer gap-3 rounded-md border bg-slate-50 p-4 transition-colors hover:bg-white">
                    <Checkbox {...form.register(feature.name)} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">{feature.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{feature.description}</span>
                    </span>
                  </label>
                ))}
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
                    Style: {values.responseStyle}. Lead capture {values.enableLeadCapture ? "enabled" : "disabled"}.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>
    </>
  );
}

function Field({
  label,
  error,
  helper,
  children
}: {
  label: string;
  error?: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
