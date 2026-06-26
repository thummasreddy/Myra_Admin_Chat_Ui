import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CheckCircle2, CreditCard, FileText, Palette, Phone, ShieldCheck, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { DOCUMENT_REVIEW_MESSAGE, formatPlanPrice, SUBSCRIPTION_PLANS } from "@/features/onboarding/onboarding.data";
import { createBusinessRegistration, listSubscriptionPlans } from "@/features/onboarding/onboarding.api";
import { heroCopy } from "@/features/onboarding/onboarding.copy";
import type { BusinessRegistrationInput } from "@/features/onboarding/onboarding.types";
import type { SubscriptionPlanId } from "@/features/tenants/tenant.types";
import { PublicNav } from "@/public/pages/PublicLandingPage";

const SELECTED_PLAN_STORAGE_KEY = "myra-selected-plan";

const registrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  websiteUrl: z.string().url("Enter a valid website URL"),
  businessEmail: z.string().email("Enter a valid business email"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  industry: z.string().min(2, "Industry is required"),
  assistantName: z.string().min(2, "Assistant name is required"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #14B8A6"),
  businessDescription: z.string().min(30, "Add a short business description"),
  fallbackMessage: z.string().min(10, "Fallback message is required"),
  selectedSubscriptionPlan: z.enum(["MONTHLY", "THREE_MONTHS", "SIX_MONTHS", "TWELVE_MONTHS"])
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

function selectedPlanFromSearch(value: string | null): SubscriptionPlanId {
  const stored = typeof window !== "undefined" ? localStorage.getItem(SELECTED_PLAN_STORAGE_KEY) : null;
  const planId = value ?? stored;
  return SUBSCRIPTION_PLANS.some((plan) => plan.id === planId) ? (planId as SubscriptionPlanId) : "MONTHLY";
}

function FieldError({ name, errors }: { name: keyof RegistrationFormValues; errors: FieldErrors<RegistrationFormValues> }) {
  const message = errors[name]?.message;
  return message ? <p className="text-sm text-[var(--color-error)]">{String(message)}</p> : null;
}

export function RegisterBusinessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plansQuery = useQuery({ queryKey: ["subscription-plans"], queryFn: listSubscriptionPlans });
  const plans = plansQuery.data ?? SUBSCRIPTION_PLANS;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedKnowledgeFiles, setUploadedKnowledgeFiles] = useState<string[]>([]);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      businessName: "",
      websiteUrl: "https://",
      businessEmail: "",
      phoneNumber: "",
      industry: "",
      assistantName: "Myra",
      brandColor: "#14B8A6",
      businessDescription: "",
      fallbackMessage: "I do not have that answer yet. Please contact our team.",
      selectedSubscriptionPlan: selectedPlanFromSearch(searchParams.get("plan"))
    }
  });

  const selectedPlanId = form.watch("selectedSubscriptionPlan");

  const registrationMutation = useMutation({
    mutationFn: (values: BusinessRegistrationInput) => {
      localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, values.selectedSubscriptionPlan);
      return createBusinessRegistration(values);
    },
    onSuccess: (registration) => {
      toast({
        title: "Registration received",
        description: "Continue to the temporary MVP payment page.",
        variant: "success"
      });
      navigate(`/mock-payment/${registration.id}`);
    },
    onError: () =>
      toast({
        title: "Registration failed",
        description: "Please review the form and try again.",
        variant: "error"
      })
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <section className="public-pricing-hero border-b px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/10">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">Register your business for Myra AI Assistant</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Share the details Myra needs to represent your business clearly. After payment, you will upload knowledge
                documents from the customer dashboard for review and activation.
              </p>
            </div>
          </div>
          <div className="public-value-tile rounded-md p-5">
            <p className="text-sm font-semibold">Reviewed setup, not instant unsupported launch</p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              {heroCopy.trustMessage} {DOCUMENT_REVIEW_MESSAGE}
            </p>
          </div>
        </div>
      </section>

      <section className="public-section mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <form className="space-y-6" onSubmit={form.handleSubmit((values) => registrationMutation.mutate(values))}>
          <OnboardingStepper />

          <Card className="public-card">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="form-grid">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input id="businessName" {...form.register("businessName")} />
                <FieldError name="businessName" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input id="websiteUrl" placeholder="https://yourbusiness.com" {...form.register("websiteUrl")} />
                <FieldError name="websiteUrl" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business email</Label>
                <Input id="businessEmail" type="email" placeholder="owner@yourbusiness.com" {...form.register("businessEmail")} />
                <FieldError name="businessEmail" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phoneNumber" className="pl-9" {...form.register("phoneNumber")} />
                </div>
                <FieldError name="phoneNumber" errors={form.formState.errors} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="industry">Industry/category</Label>
                <Input id="industry" placeholder="Healthcare, retail, SaaS, services..." {...form.register("industry")} />
                <FieldError name="industry" errors={form.formState.errors} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessDescription">Business description</Label>
                <Textarea
                  id="businessDescription"
                  className="min-h-28"
                  placeholder="Describe your services, products, customers, locations, policies, and common questions."
                  {...form.register("businessDescription")}
                />
                <p className="text-xs text-muted-foreground">
                  Share what you offer, who you serve, and what customers usually need help understanding.
                </p>
                <FieldError name="businessDescription" errors={form.formState.errors} />
              </div>
            </CardContent>
          </Card>

          <Card className="public-card">
            <CardHeader>
              <CardTitle>Assistant Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="form-grid">
                <div className="space-y-2">
                  <Label htmlFor="assistantName">Assistant name</Label>
                  <Input id="assistantName" {...form.register("assistantName")} />
                  <FieldError name="assistantName" errors={form.formState.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandColor">Brand color</Label>
                  <div className="flex items-center gap-3">
                    <Input id="brandColor" type="color" className="h-10 w-16 p-1" {...form.register("brandColor")} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Palette className="h-4 w-4" />
                      {form.watch("brandColor")}
                    </div>
                  </div>
                  <FieldError name="brandColor" errors={form.formState.errors} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fallbackMessage">Fallback message</Label>
                <Textarea id="fallbackMessage" {...form.register("fallbackMessage")} />
                <p className="text-xs text-muted-foreground">
                  This message is used when approved information is unavailable, helping avoid unsupported answers.
                </p>
                <FieldError name="fallbackMessage" errors={form.formState.errors} />
              </div>
            </CardContent>
          </Card>

          <Card className="public-card">
            <CardHeader>
              <CardTitle>Business Knowledge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                className="w-full rounded-md border border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="mx-auto h-8 w-8 text-primary" />
                <span className="mt-3 block text-sm font-semibold text-foreground">Upload business documents</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  PDF, DOCX, TXT, CSV, FAQs, product catalogs, policies, service details, menus, or training notes.
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.csv"
                className="hidden"
                onChange={(event) => {
                  const names = Array.from(event.target.files ?? []).map((file) => file.name);
                  setUploadedKnowledgeFiles((current) => [...current, ...names]);
                  event.target.value = "";
                }}
              />
              {uploadedKnowledgeFiles.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {uploadedKnowledgeFiles.map((file) => (
                    <div key={file} className="flex items-center gap-2 rounded-md border bg-card p-3 text-sm">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{file}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No documents selected yet. You can also upload or replace files later from the customer dashboard.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="public-card">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`cursor-pointer rounded-md border p-4 transition-colors ${
                    selectedPlanId === plan.id ? "border-primary bg-primary/10 shadow-sm" : "bg-card hover:bg-muted"
                  }`}
                >
                  <input type="radio" value={plan.id} className="sr-only" {...form.register("selectedSubscriptionPlan")} />
                  <span className="block text-sm font-semibold text-foreground">{plan.name}</span>
                  <span className="mt-2 block text-2xl font-semibold">{formatPlanPrice(plan)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{plan.renewalCadence}</span>
                </label>
              ))}
              <FieldError name="selectedSubscriptionPlan" errors={form.formState.errors} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(200,154,75,0.24)] hover:bg-accent/90 hover:shadow-[0_16px_36px_rgba(200,154,75,0.28)]" disabled={registrationMutation.isPending}>
              {registrationMutation.isPending ? "Saving..." : "Continue to Mock Payment"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Card className="public-card lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-[var(--color-success)]" />
                MVP Activation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>No knowledge files are uploaded during public registration.</p>
              <p>After payment, log in to your customer dashboard to upload FAQs, service details, pricing, policies, menus, or product guides.</p>
              <p>Embed code is visible and emailed only after admin approval.</p>
              <p>Myra answers from business-provided and approved knowledge, not from unsupported guesses.</p>
            </CardContent>
          </Card>
          <Card className="public-card">
            <CardHeader>
              <CardTitle className="text-base">Business value Myra is built for</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                "Answer repeated customer questions faster",
                "Capture visitor details while interest is fresh",
                "Guide customers toward booking, quotes, contact, or purchase",
                "Keep answers consistent with approved information"
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function OnboardingStepper() {
  const steps = [
    { label: "Business Details", icon: Building2 },
    { label: "Assistant Setup", icon: Palette },
    { label: "Knowledge Upload", icon: FileText },
    { label: "Plan Selection", icon: CreditCard },
    { label: "Review", icon: ShieldCheck }
  ];

  return (
    <Card className="public-card">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2 rounded-md border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <step.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Step {index + 1}</p>
              <p className="truncate text-sm font-semibold text-foreground">{step.label}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
