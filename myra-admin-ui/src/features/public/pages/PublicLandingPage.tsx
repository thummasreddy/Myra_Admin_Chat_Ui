import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  GraduationCap,
  HeartPulse,
  Home,
  MailCheck,
  MessageCircle,
  MessageSquare,
  PanelTop,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UploadCloud,
  Users,
  Utensils,
  WandSparkles,
  Zap
} from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DOCUMENT_REVIEW_MESSAGE, formatPlanPrice, SUBSCRIPTION_PLANS } from "@/features/onboarding/onboarding.data";
import {
  businessProblems,
  featureCopy,
  howItWorksSteps,
  myraProcessItems,
  ownerBenefits,
  pricingIncludedFeatures,
  regularProcessItems,
  trustSafetyPoints,
  useCases
} from "@/features/onboarding/onboarding.copy";

type IconType = ComponentType<{ className?: string }>;

const metricCards = [
  { title: "Business assistant active", detail: "Live-ready after review", icon: Bot },
  { title: "Knowledge base connected", detail: "Approved business answers", icon: BrainCircuit },
  { title: "Lead capture enabled", detail: "Visitor details collected", icon: Users },
  { title: "Recommendations enabled", detail: "Guided next steps", icon: WandSparkles }
];

const valueCards = [
  { title: "Real conversations from visitors", description: "Turn passive browsing into guided customer conversations.", icon: MessageCircle },
  { title: "Instant approved answers", description: "Respond from the business knowledge your team provides.", icon: Zap },
  { title: "24/7 assistant support", description: "Help visitors after hours without adding a full-time team.", icon: Clock3 },
  { title: "More leads and opportunities", description: "Capture names, contact details, and customer intent.", icon: Users }
];

const capabilityCards = [
  {
    title: "Answer Questions Instantly",
    description: "Give visitors fast answers from business-provided FAQs, policies, services, and documents.",
    icon: MessageSquare
  },
  {
    title: "Explain Products and Services",
    description: "Help customers understand pricing, packages, availability, opening hours, and next steps.",
    icon: ShoppingBag
  },
  {
    title: "Capture Qualified Leads",
    description: "Collect name, email, phone, interest, and requirements while the visitor is engaged.",
    icon: Users
  },
  {
    title: "Guide Customers Forward",
    description: "Move visitors toward booking, contacting, requesting a quote, or starting a purchase.",
    icon: ChevronRight
  },
  {
    title: "Work Around The Clock",
    description: "Keep the website responsive even outside normal business hours.",
    icon: Clock3
  },
  {
    title: "Reduce Repetitive Support",
    description: "Automate common questions across calls, messages, email, and contact forms.",
    icon: Zap
  }
];

const useCaseIcons: Record<string, IconType> = {
  "E-commerce": ShoppingBag,
  "Restaurant / Food Business": Utensils,
  "Service Business": BriefcaseBusiness,
  "Clinic / Healthcare Office": HeartPulse,
  "Real Estate": Home,
  "Education / Coaching": GraduationCap,
  "Agency / Consulting": Building2
};

const featureIcons: IconType[] = [
  Code2,
  BrainCircuit,
  Users,
  ShieldCheck,
  UploadCloud,
  PanelTop,
  BarChart3,
  Sparkles,
  MessageSquare,
  Receipt,
  MailCheck,
  CheckCircle2
];

const processIcons: IconType[] = [
  Store,
  Receipt,
  Check,
  PanelTop,
  UploadCloud,
  Clock3,
  ShieldCheck,
  MailCheck,
  Code2,
  Zap
];

const planBadges: Record<string, string> = {
  MONTHLY: "Starter",
  THREE_MONTHS: "Popular",
  SIX_MONTHS: "Best Value",
  TWELVE_MONTHS: "Annual"
};

const SELECTED_PLAN_STORAGE_KEY = "myra-selected-plan";

export function PublicLandingPage() {
  return (
    <main className="min-h-screen bg-[#222831] text-white">
      <PublicNav />
      <HeroSection />
      <MetricStrip />
      <BusinessValueSection />
      <CapabilitiesSection />
      <ProblemsSection />
      <ComparisonSection />
      <UseCasesSection />
      <FeaturesSection />
      <TrustSection />
      <ProcessSection />
      <PricingSection />
      <FinalCtaSection />
      <PublicFooter />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="public-hero relative overflow-hidden bg-[#222831] px-6 pb-20 pt-24 text-white sm:pb-24 sm:pt-28 lg:pb-28">
      <div className="public-container grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="max-w-3xl">
          <Badge tone="dark">AI Website Assistant for Businesses</Badge>
          <h1 className="mt-6 max-w-4xl text-[2.25rem] font-bold leading-[1.04] tracking-normal sm:text-[3.5rem]">
            Turn website visitors into customers with Myra AI
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Launch a reviewed AI assistant that answers questions, captures leads, recommends products or services, and guides visitors
            using your approved business knowledge.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CTAButton to="/register">Start Free / Register</CTAButton>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/10 text-white shadow-none hover:bg-white/15 hover:text-white"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-300">
            Reviewed before launch | Business-specific knowledge | Lead capture ready
          </p>
        </div>

        <ProductMockup />
      </div>
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="public-product-shell">
      <div className="public-product-card">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EA5455]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Myra Assistant</p>
              <p className="text-xs text-slate-400">Reviewed business knowledge</p>
            </div>
          </div>
          <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Online</div>
        </div>

        <div className="space-y-4 p-5">
          <div className="ml-auto max-w-[82%] rounded-md bg-[#EA5455] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/20">
            Do you offer weekend appointments?
          </div>
          <div className="max-w-[88%] rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100">
            Yes. Weekend appointments are available on Saturday from 10 AM to 4 PM. I can collect your details so the team
            can confirm a time.
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {["Knowledge connected", "Lead captured", "Admin approved"].map((status) => (
              <div key={status} className="rounded-md border border-white/10 bg-white/[0.08] p-3">
                <CheckCircle2 className="h-4 w-4 text-[#EA5455]" />
                <p className="mt-2 text-xs font-semibold text-white">{status}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Captured lead</p>
              <span className="rounded-full bg-red-400/15 px-2.5 py-1 text-xs font-semibold text-red-200">New</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
              <span>Name: Sarah M.</span>
              <span>Interest: Weekend booking</span>
              <span>Phone: Collected</span>
              <span>Status: Ready for follow-up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricStrip() {
  return (
    <section className="relative z-10 -mt-10 px-6">
      <div className="public-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((item) => (
          <FeatureCard key={item.title} title={item.title} description={item.detail} icon={item.icon} compact />
        ))}
      </div>
    </section>
  );
}

function BusinessValueSection() {
  return (
    <section className="public-section px-6">
      <div className="public-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Business value"
            title="Built to turn website visits into useful conversations"
            description="Myra helps business owners answer common questions, capture lead details, reduce repetitive support work, and guide customers toward booking, contacting, requesting a quote, or buying."
          />
          <CTAButton to="/register" className="mt-7 w-fit">
            Start registration
          </CTAButton>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {valueCards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="public-band px-6">
      <div className="public-container">
        <SectionHeader
          eyebrow="What Myra AI Assistant Does"
          title="A modern assistant workflow for customer questions, leads, and next steps"
          description="Everything a business needs to launch a reviewed AI assistant on its own website."
          centered
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {capabilityCards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemsSection() {
  return (
    <section className="public-section px-6">
      <div className="public-container">
        <SectionHeader
          eyebrow="Why businesses need Myra"
          title="Fast, consistent answers create a better website experience"
          description="Myra gives businesses a practical way to respond faster while staying grounded in reviewed information."
          centered
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <InsightPanel
            title="Business Problems"
            icon={ShieldAlert}
            tone="warning"
            items={businessProblems.slice(0, 6)}
          />
          <InsightPanel title="How Myra Helps" icon={ShieldCheck} tone="success" items={ownerBenefits.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="public-band px-6">
      <div className="public-container">
        <SectionHeader
          eyebrow="Comparison"
          title="Myra vs Regular Process"
          description="Contact forms and manual replies can be slow. Myra creates instant engagement while keeping answers grounded in approved business information."
          centered
        />
        <div className="public-comparison mt-10 grid gap-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_24px_70px_rgba(34,40,49,0.1)] lg:grid-cols-2">
          <ComparisonCard title="Regular Process" items={regularProcessItems} icon={Clock3} />
          <ComparisonCard title="Myra AI Assistant" items={myraProcessItems} icon={Zap} highlighted />
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="public-section px-6">
      <div className="public-container">
        <SectionHeader
          eyebrow="Use cases"
          title="Useful across the businesses customers already search for"
          description="Myra works for small and medium businesses that need faster answers, cleaner lead capture, and a more helpful website experience."
          centered
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.type} useCase={useCase} icon={useCaseIcons[useCase.type] ?? Store} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="public-band px-6">
      <div className="public-container">
        <SectionHeader
          eyebrow="Key features"
          title="Premium onboarding, assistant control, and dashboard workflows"
          description="A practical assistant workflow designed for reviewed business onboarding."
          centered
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCopy.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={featureIcons[index] ?? Sparkles}
              gradientTop
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="px-6 py-14 sm:py-24">
      <div className="public-container overflow-hidden rounded-md bg-[#222831] text-white shadow-[0_28px_80px_rgba(34,40,49,0.22)]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 sm:p-12">
            <Badge tone="dark">Trust and safety</Badge>
            <h2 className="mt-5 text-3xl font-bold tracking-normal sm:text-4xl">Reviewed before going live</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              Myra is reviewed before launch so the assistant can stay aligned with approved business information and use a
              fallback message when information is unavailable.
            </p>
          </div>
          <div className="grid gap-3 bg-white/5 p-6 sm:grid-cols-2 sm:p-8">
            {trustSafetyPoints.slice(1, 8).map((point) => (
              <div key={point} className="rounded-md border border-white/10 bg-white/[0.08] p-4">
                <ShieldCheck className="h-5 w-5 text-[#EA5455]" />
                <p className="mt-3 text-sm font-medium leading-6 text-slate-100">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="public-section px-6">
      <div className="public-container">
        <SectionHeader
          eyebrow="How it works"
          title="From registration to approved website assistant"
          description="Activation happens after registration, payment, customer document upload, review, and approval."
          centered
        />
        <div className="public-timeline mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {howItWorksSteps.map((step, index) => (
            <ProcessStep key={step} step={step} index={index} icon={processIcons[index] ?? CheckCircle2} />
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Notice tone="warning">{DOCUMENT_REVIEW_MESSAGE}</Notice>
          <Notice tone="success">For quality and safety, every business assistant is reviewed before activation.</Notice>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="public-band px-6" id="pricing">
      <div className="public-container">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Pricing"
              title="Choose the plan duration that fits your business"
              description="All plans include onboarding review, customer dashboard, knowledge uploads, lead capture, analytics, and embed code delivery after approval. In the MVP, plans differ only by price and duration."
            />
            <Button asChild variant="secondary" className="mt-7">
              <Link to="/pricing">Compare plans</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} badge={planBadges[plan.id]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="px-6 pb-16 pt-4 sm:pb-24">
      <div className="public-container rounded-md bg-[#222831] px-6 py-12 text-center text-white shadow-[0_28px_80px_rgba(34,40,49,0.24)] sm:px-10">
        <Badge tone="dark">Launch after approval</Badge>
        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
          Ready to launch your business AI assistant?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
          Register your business, upload your knowledge, and let Myra help your visitors instantly after approval.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <CTAButton to="/register">Register Now</CTAButton>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/25 bg-white/10 text-white shadow-none hover:bg-white/15 hover:text-white"
          >
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#222831] px-6 py-10 text-white">
      <div className="public-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-semibold">Myra AI</p>
              <p className="text-sm text-slate-400">Assistant Platform</p>
            </div>
          </Link>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Reviewed AI assistants for business websites, lead capture, customer guidance, and dashboard-based onboarding.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
          <Link className="hover:text-white" to="/pricing">
            Pricing
          </Link>
          <Link className="hover:text-white" to="/login">
            Login
          </Link>
          <Link className="hover:text-white" to="/register">
            Register
          </Link>
          <a className="hover:text-white" href="#privacy">
            Privacy Policy
          </a>
          <a className="hover:text-white" href="#terms">
            Terms
          </a>
        </nav>
      </div>
      <div className="public-container mt-8 border-t border-white/10 pt-6 text-sm text-slate-500">
        Copyright {new Date().getFullYear()} Myra AI. All rights reserved.
      </div>
    </footer>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  compact,
  gradientTop
}: {
  title: string;
  description: string;
  icon: IconType;
  compact?: boolean;
  gradientTop?: boolean;
}) {
  return (
    <article className={`public-card public-feature-card ${gradientTop ? "public-gradient-top" : ""} ${compact ? "p-5" : "p-6"}`}>
      <div className="public-icon-box">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className={`mt-5 font-semibold tracking-normal text-slate-950 ${compact ? "text-base" : "text-lg"}`}>{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function InsightPanel({
  title,
  items,
  icon: Icon,
  tone
}: {
  title: string;
  items: string[];
  icon: IconType;
  tone: "warning" | "success";
}) {
  return (
    <article className={`public-insight-card ${tone === "warning" ? "public-insight-warning" : "public-insight-success"}`}>
      <div className="flex items-center gap-3">
        <div className="public-icon-box">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold tracking-normal text-slate-950">{title}</h3>
      </div>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function ComparisonCard({ title, items, icon: Icon, highlighted }: { title: string; items: string[]; icon: IconType; highlighted?: boolean }) {
  return (
    <article className={`p-6 sm:p-8 ${highlighted ? "public-comparison-highlight" : "bg-white"}`}>
      <div className="flex items-center gap-3">
        <div className="public-icon-box">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold tracking-normal text-slate-950">{title}</h3>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-6">
            <CheckCircle2 className={`mt-1 h-4 w-4 shrink-0 ${highlighted ? "text-[#EA5455]" : "text-slate-400"}`} />
            <span className={highlighted ? "font-medium text-slate-800" : "text-slate-500"}>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function UseCaseCard({ useCase, icon: Icon }: { useCase: { type: string; examples: string[] }; icon: IconType }) {
  return (
    <article className="public-card public-gradient-top p-6">
      <div className="flex items-center gap-3">
        <div className="public-icon-box">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold tracking-normal text-slate-950">{useCase.type}</h3>
      </div>
      <div className="mt-5 space-y-3">
        {useCase.examples.slice(0, 5).map((example) => (
          <div key={example} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#EA5455]" />
            <span>{example}</span>
          </div>
        ))}
      </div>
      {useCase.type.includes("Healthcare") ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-800">
          Myra should not provide medical diagnosis or treatment advice.
        </p>
      ) : null}
    </article>
  );
}

function ProcessStep({ step, index, icon: Icon }: { step: string; index: number; icon: IconType }) {
  return (
    <article className="public-card relative p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#EA5455] text-sm font-bold text-white shadow-[0_12px_28px_rgba(234,84,85,0.22)]">
          {index + 1}
        </div>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{step}</p>
    </article>
  );
}

function PricingCard({ plan, badge }: { plan: (typeof SUBSCRIPTION_PLANS)[number]; badge: string }) {
  const included = pricingIncludedFeatures.slice(0, 5);

  return (
    <article className="public-card public-plan-card flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold tracking-normal text-slate-950">{plan.name}</p>
          <p className="mt-1 text-sm text-slate-500">{plan.renewalCadence}</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">{badge}</span>
      </div>
      <p className="mt-7 text-4xl font-bold tracking-normal text-slate-950">{formatPlanPrice(plan)}</p>
      <p className="mt-2 text-sm text-slate-500">
        {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""} of access
      </p>
      <div className="mt-6 flex-1 space-y-3">
        {included.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#EA5455]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Button asChild className="mt-7 w-full">
        <Link to={`/register?plan=${plan.id}`} onClick={() => localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, plan.id)}>
          Choose Plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  centered
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">{description}</p>
    </div>
  );
}

function Badge({ children, tone = "light" }: { children: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-normal ${
        tone === "dark" ? "border-white/15 bg-white/10 text-red-100" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function CTAButton({ to, children, className = "" }: { to: string; children: string; className?: string }) {
  return (
    <Button asChild size="lg" className={className}>
      <Link to={to}>
        {children}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

function Notice({ children, tone }: { children: string; tone: "warning" | "success" }) {
  return (
    <div
      className={`rounded-md border px-4 py-4 text-sm font-medium ${
        tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {children}
    </div>
  );
}

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#EA5455] text-white shadow-lg shadow-red-500/20">
      <Bot className="h-5 w-5" />
    </div>
  );
}

export function PublicNav() {
  return (
    <header className="public-nav sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="public-container flex h-16 items-center gap-4 px-6">
        <Link to="/" className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold text-white">Myra AI</p>
            <p className="text-xs text-slate-300">Assistant Platform</p>
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white">
            <Link to="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden text-slate-200 hover:bg-white/10 hover:text-white sm:inline-flex">
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
