import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Palette, Phone, ShieldCheck } from "lucide-react";
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
import type { BusinessRegistrationInput } from "@/features/onboarding/onboarding.types";
import type { SubscriptionPlanId } from "@/features/tenants/tenant.types";
import { PublicNav } from "@/features/public/pages/PublicLandingPage";

const SELECTED_PLAN_STORAGE_KEY = "myra-selected-plan";

const registrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  websiteUrl: z.string().url("Enter a valid website URL"),
  businessEmail: z.string().email("Enter a valid business email"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  industry: z.string().min(2, "Industry is required"),
  assistantName: z.string().min(2, "Assistant name is required"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #1591DC"),
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
  return message ? <p className="text-sm text-red-600">{String(message)}</p> : null;
}

export function RegisterBusinessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plansQuery = useQuery({ queryKey: ["subscription-plans"], queryFn: listSubscriptionPlans });
  const plans = plansQuery.data ?? SUBSCRIPTION_PLANS;

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      businessName: "",
      websiteUrl: "https://",
      businessEmail: "",
      phoneNumber: "",
      industry: "",
      assistantName: "Myra",
      brandColor: "#1591DC",
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
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicNav />
      <section className="border-b bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">Register your business</h1>
              <p className="text-sm text-muted-foreground">Documents are uploaded later from the customer dashboard.</p>
            </div>
          </div>
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {DOCUMENT_REVIEW_MESSAGE}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <form className="space-y-6" onSubmit={form.handleSubmit((values) => registrationMutation.mutate(values))}>
          <Card>
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
                <Input id="websiteUrl" {...form.register("websiteUrl")} />
                <FieldError name="websiteUrl" errors={form.formState.errors} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business email</Label>
                <Input id="businessEmail" type="email" {...form.register("businessEmail")} />
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
                <Textarea id="businessDescription" className="min-h-28" {...form.register("businessDescription")} />
                <FieldError name="businessDescription" errors={form.formState.errors} />
              </div>
            </CardContent>
          </Card>

          <Card>
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
                <FieldError name="fallbackMessage" errors={form.formState.errors} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`cursor-pointer rounded-md border p-4 transition-colors ${
                    selectedPlanId === plan.id ? "border-primary bg-primary/10" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <input type="radio" value={plan.id} className="sr-only" {...form.register("selectedSubscriptionPlan")} />
                  <span className="block text-sm font-semibold text-slate-950">{plan.name}</span>
                  <span className="mt-2 block text-2xl font-semibold">{formatPlanPrice(plan)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{plan.renewalCadence}</span>
                </label>
              ))}
              <FieldError name="selectedSubscriptionPlan" errors={form.formState.errors} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={registrationMutation.isPending}>
              {registrationMutation.isPending ? "Saving..." : "Continue to Mock Payment"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                MVP Activation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>No knowledge files are uploaded during public registration.</p>
              <p>After mock payment, the tenant status becomes PENDING_ADMIN_APPROVAL.</p>
              <p>Embed code is visible and emailed only after admin approval.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
