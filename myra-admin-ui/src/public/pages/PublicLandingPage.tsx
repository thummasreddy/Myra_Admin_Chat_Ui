import {
  Bot,
  CheckCircle2,
  Clock3,
  Code2,
  FileCheck2,
  MailCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DOCUMENT_REVIEW_MESSAGE, formatPlanPrice, SUBSCRIPTION_PLANS } from "@/features/onboarding/onboarding.data";

const benefits = [
  "AI chatbot widget for business websites",
  "Business-specific knowledge assistant",
  "Customer question answering",
  "Lead capture support",
  "Admin-reviewed onboarding",
  "Easy website embed code"
];

const processSteps = [
  { title: "Register your business", description: "Share business details and assistant settings.", icon: FileCheck2 },
  { title: "Choose a subscription plan", description: "Select Monthly, 3 Months, 6 Months, or 12 Months.", icon: CheckCircle2 },
  { title: "Complete payment", description: "Finish the temporary MVP checkout.", icon: CheckCircle2 },
  { title: "Upload knowledge documents", description: "Use the customer dashboard after registration.", icon: Clock3 },
  { title: "Document review", description: "Our team reviews and processes documents within 3 business days.", icon: ShieldCheck },
  { title: "Receive embed code", description: "Your embed code is emailed after approval.", icon: MailCheck },
  { title: "Add Myra to your website", description: "Install the script on your business website.", icon: Code2 }
];

export function PublicLandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <section
        className="public-hero relative flex min-h-[680px] items-center px-4 py-24 text-white sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,23,42,0.94), rgba(15,23,42,0.72), rgba(15,23,42,0.42)), url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1800&q=80')"
        }}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_460px] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/90">
              <Sparkles className="h-4 w-4" />
              Multi-tenant AI assistant onboarding
            </div>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">Add Myra AI Assistant to Your Business Website</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Let your customers ask questions, get instant answers, and connect with your business using an AI assistant
              trained on your knowledge.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>

          <div className="public-card rounded-lg p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Myra for Acme Dental</p>
                  <p className="text-xs text-muted-foreground">Pending admin approval</p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--color-warning-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-warning)]">Review</span>
            </div>
            <div className="space-y-3">
              <div className="rounded-md bg-muted p-3 text-sm">What services do you offer?</div>
              <div className="ml-8 rounded-md bg-primary p-3 text-sm text-white">
                I can help with appointments, insurance questions, service details, and office contact information.
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="public-value-tile rounded-md p-2">
                  <p className="font-semibold text-foreground">3 days</p>
                  <p className="text-muted-foreground">Doc review</p>
                </div>
                <div className="public-value-tile rounded-md p-2">
                  <p className="font-semibold text-foreground">1 script</p>
                  <p className="text-muted-foreground">Install</p>
                </div>
                <div className="public-value-tile rounded-md p-2">
                  <p className="font-semibold text-foreground">24/7</p>
                  <p className="text-muted-foreground">Answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal">What Myra Provides</h2>
            <p className="mt-3 text-muted-foreground">Everything a business needs to launch a reviewed AI assistant on its own website.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="public-card p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" />
                  <p className="text-sm font-medium text-foreground">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-band">
        <div className="public-container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal">How It Works</h2>
            <p className="mt-3 text-muted-foreground">
              The MVP keeps activation manual. Customers register and pay first, then upload knowledge after signing in.
              Admins approve the assistant only after details and documents are reviewed.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="public-card p-6">
                  <div className="mb-3">
                    <div className="public-icon-box mb-2 h-10 w-10">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold leading-none tracking-normal">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm font-medium text-[var(--color-warning)]">
            {DOCUMENT_REVIEW_MESSAGE}
          </div>
          <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-sm font-medium text-foreground">
            For quality and safety, every business assistant is reviewed before activation.
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold tracking-normal">Pricing plans</h2>
              <p className="mt-3 text-muted-foreground">
                Plans only differ by price in the MVP. All plans include onboarding review, dashboard access, knowledge uploads,
                analytics, and embed code delivery after approval.
              </p>
              <Button asChild className="mt-6">
                <Link to="/pricing">Compare Plans</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div key={plan.id} className="public-card public-plan-card p-6">
                  <h3 className="text-lg font-semibold leading-none tracking-normal">{plan.name}</h3>
                  <div className="mt-2">
                    <p className="text-3xl font-semibold">{formatPlanPrice(plan)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.renewalCadence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-band">
        <div className="public-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Ready to onboard a business?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Register the business, complete mock payment, upload documents from the dashboard, then wait for approval.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <Link to="/register">Start Registration</Link>
              </Button>
              <Button asChild variant="outline" className="border-[var(--color-border)] bg-transparent hover:bg-muted">
                <Link to="/login">
                  <MailCheck className="h-4 w-4" />
                  Admin Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PublicNav() {
  return (
    <header className="public-nav public-nav-light sticky top-0 z-30 border-b backdrop-blur">
      <div className="public-container flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="public-icon-box h-9 w-9">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Myra AI</p>
            <p className="text-xs text-muted-foreground">Assistant Platform</p>
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
