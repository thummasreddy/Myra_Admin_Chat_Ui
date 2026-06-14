import type { ComponentType } from "react";
import { useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  HeartPulse,
  Home,
  Mail,
  MessageCircle,
  MessageSquare,
  Palette,
  Receipt,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Upload,
  UserCheck,
  Users,
  Utensils,
  Zap
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";

type IconType = ComponentType<{ className?: string }>;

const trustBadges = ["Reviewed before launch", "Business-specific knowledge", "Lead capture ready"];

const heroFeatureTags = [
  "Business assistant active",
  "Live-ready after review",
  "Knowledge base connected",
  "Approved business answers",
  "Lead capture enabled",
  "Visitor details collected",
  "Recommendations enabled",
  "Guided next steps"
];

const businessValueCards = [
  {
    icon: MessageCircle,
    title: "Real conversations from visitors",
    description: "Turn passive browsing into guided customer conversations."
  },
  {
    icon: Zap,
    title: "Instant approved answers",
    description: "Respond from the business knowledge your team provides."
  },
  {
    icon: Clock3,
    title: "24/7 assistant support",
    description: "Help visitors after hours without adding a full-time team."
  },
  {
    icon: Users,
    title: "More leads and opportunities",
    description: "Capture names, contact details, and customer intent."
  }
];

const capabilityCards = [
  {
    icon: MessageSquare,
    title: "Answer Questions Instantly",
    description: "Give visitors fast answers from business-provided FAQs, policies, services, and documents."
  },
  {
    icon: ShoppingBag,
    title: "Explain Products and Services",
    description: "Help customers understand pricing, packages, availability, opening hours, and next steps."
  },
  {
    icon: UserCheck,
    title: "Capture Qualified Leads",
    description: "Collect name, email, phone, interest, and requirements while the visitor is engaged."
  },
  {
    icon: ArrowRight,
    title: "Guide Customers Forward",
    description: "Move visitors toward booking, contacting, requesting a quote, or starting a purchase."
  },
  {
    icon: Clock3,
    title: "Work Around The Clock",
    description: "Keep the website responsive even outside normal business hours."
  },
  {
    icon: Zap,
    title: "Reduce Repetitive Support",
    description: "Automate common questions across calls, messages, email, and contact forms."
  }
];

const businessProblems = [
  "Website visitors leave when they do not find answers quickly",
  "Business owners spend too much time answering repeated questions",
  "Customers ask the same questions about price, availability, timing, services, policies, and process",
  "Small businesses cannot always afford a 24/7 support team",
  "Contact forms are slow and do not create instant engagement",
  "Manual support can be inconsistent"
];

const myraBenefits = [
  "Save time by automating repeated customer questions",
  "Reduce manual support effort across calls, messages, and emails",
  "Capture more lead opportunities from website visitors",
  "Improve customer trust with faster and clearer responses",
  "Increase website engagement with real-time conversations",
  "Support customers 24/7, even outside business hours"
];

const regularProcessItems = [
  "Customer searches the website manually",
  "Customer fills a contact form and waits",
  "Business owner replies later",
  "Same questions are answered repeatedly",
  "Missed calls or messages can lose leads",
  "Support depends on business working hours",
  "Responses may vary by person"
];

const myraProcessItems = [
  "Customer gets instant answers",
  "Assistant guides the customer in real time",
  "Lead details are captured immediately",
  "Common questions are automated",
  "Works 24/7",
  "Gives consistent responses from approved knowledge",
  "Helps customers move toward booking, quote request, purchase, or contact"
];

const useCases = [
  {
    icon: ShoppingBag,
    title: "E-commerce",
    items: ["Product questions", "Delivery policy", "Return policy", "Size or variant guidance", "Order-related FAQs"]
  },
  {
    icon: Utensils,
    title: "Restaurant / Food Business",
    items: ["Menu questions", "Opening hours", "Location", "Catering inquiries", "Reservation or order guidance"]
  },
  {
    icon: BriefcaseBusiness,
    title: "Service Business",
    items: ["Service details", "Pricing packages", "Appointment requests", "Quote collection", "Process explanation"]
  },
  {
    icon: HeartPulse,
    title: "Clinic / Healthcare Office",
    items: ["Services offered", "Appointment guidance", "Insurance or general policy FAQs", "Opening hours", "Contact routing"],
    note: "Myra should not provide medical diagnosis or treatment advice."
  },
  {
    icon: Home,
    title: "Real Estate",
    items: [
      "Property inquiry capture",
      "Location details",
      "Price range guidance",
      "Schedule visit request",
      "Buyer or renter qualification"
    ]
  },
  {
    icon: GraduationCap,
    title: "Education / Coaching",
    items: ["Course details", "Fees", "Batch timings", "Admission process", "Lead capture for counseling"]
  },
  {
    icon: Building2,
    title: "Agency / Consulting",
    items: ["Service explanation", "Portfolio guidance", "Pricing inquiry", "Discovery call booking", "Requirement collection"]
  }
];

const keyFeatures = [
  { icon: Code2, title: "Easy website embed", description: "Add Myra to your website with a simple embed code after approval." },
  {
    icon: BookOpen,
    title: "Business-specific AI knowledge",
    description: "Myra answers using the knowledge documents and business details you provide."
  },
  {
    icon: UserCheck,
    title: "Customer lead capture",
    description: "Collect visitor details such as name, email, phone, interest, and requirement."
  },
  {
    icon: ShieldCheck,
    title: "Admin-reviewed activation",
    description: "Every assistant is reviewed before it goes live for quality and safety."
  },
  {
    icon: Upload,
    title: "Knowledge document upload",
    description: "Upload FAQs, service information, policies, menus, product guides, and business process documents."
  },
  {
    icon: Settings2,
    title: "Customer dashboard",
    description: "Manage subscription, documents, settings, embed code, support, and basic analytics."
  },
  {
    icon: BarChart3,
    title: "Basic analytics",
    description: "View simple engagement insights to understand how customers interact with your assistant."
  },
  {
    icon: Palette,
    title: "Brand customization",
    description: "Set assistant name, brand color, business description, and fallback message."
  },
  {
    icon: MessageSquare,
    title: "Fallback message control",
    description: "Choose what Myra says when approved information is not available."
  },
  { icon: Receipt, title: "Subscription-based access", description: "Choose a plan duration that fits your business needs." },
  {
    icon: Mail,
    title: "Email notifications",
    description: "Receive onboarding, payment, approval, document, embed, and renewal updates."
  },
  {
    icon: CheckCircle2,
    title: "Human review before launch",
    description: "The Myra team reviews business details and documents before activation."
  }
];

const trustPoints = [
  "Business details and knowledge documents are reviewed",
  "Documents are usually reviewed and processed within 3 business days",
  "Embed code is sent only after approval",
  "Business owners can update assistant settings",
  "The assistant uses approved business knowledge",
  "Fallback message is used when information is unavailable",
  "This helps avoid wrong or unsupported answers"
];

const onboardingSteps = [
  "Register your business",
  "Choose a subscription plan",
  "Complete payment",
  "Log in to your customer dashboard",
  "Upload business knowledge documents",
  "Myra team reviews and processes documents within 3 business days",
  "Admin approves your assistant",
  "Receive embed code by email",
  "Add the code to your website",
  "Start helping customers instantly"
];

const plans = [
  { name: "Starter", price: "$49", duration: "1 month", renewal: "Renews monthly" },
  { name: "Growth", price: "$129", duration: "3 months", renewal: "Renews every 3 months", badge: "Popular" },
  { name: "Pro", price: "$239", duration: "6 months", renewal: "Renews every 6 months", badge: "Best Value" },
  { name: "Enterprise", price: "$449", duration: "12 months", renewal: "Renews yearly", badge: "Annual" }
];

const planFeatures = [
  "Myra AI Assistant widget",
  "Business-specific knowledge setup",
  "Customer dashboard",
  "Knowledge document upload",
  "Admin-reviewed activation"
];

function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);
}

function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 text-slate-950 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-myra-border dark:bg-myra-background/90 dark:text-myra-text-primary">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-myra-primary text-white shadow-lg shadow-blue-600/25">
            <Bot className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">Myra AI</span>
            <span className="hidden text-xs text-slate-500 dark:text-myra-text-secondary sm:block">Assistant Platform</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" className="text-slate-700 shadow-none hover:bg-myra-primarySoft hover:text-myra-primary dark:text-myra-text-secondary dark:hover:bg-myra-muted dark:hover:text-white">
            <Link to="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden text-slate-700 shadow-none hover:bg-myra-primarySoft hover:text-myra-primary dark:text-myra-text-secondary dark:hover:bg-myra-muted dark:hover:text-white sm:inline-flex">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Register</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-myra-primarySoft to-violet-50 px-4 pb-24 pt-16 text-slate-950 dark:from-myra-background dark:via-myra-surface dark:to-myra-card dark:text-white sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_80%_35%,rgba(124,58,237,0.2),transparent_30%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-3xl">
          <Badge className="border-myra-primaryBorder bg-white/80 text-myra-primary dark:border-myra-primaryBorder/30 dark:bg-myra-muted dark:text-myra-primaryBorder">Reviewed business assistant platform</Badge>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            AI Website Assistant for Businesses
          </h1>
          <p className="mt-5 text-lg font-medium text-myra-primary dark:text-myra-primaryBorder sm:text-xl">Turn website visitors into customers with Myra AI</p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            Launch a reviewed AI assistant that answers questions, captures leads, recommends products or services, and guides visitors
            using your approved business knowledge.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/register">
                Start Free / Register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-300 bg-white/70 text-slate-900 shadow-none hover:bg-white hover:text-slate-950 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {trustBadges.map((item) => (
              <Badge key={item} className="border-myra-primaryBorder bg-white/70 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <ShieldCheck className="mr-1 h-3.5 w-3.5 text-myra-primary dark:text-myra-primaryBorder" />
                {item}
              </Badge>
            ))}
          </div>
        </div>
        <ChatPreview />
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-myra-primary/20 to-myra-accent/20 blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-black/20 dark:border-myra-border dark:bg-myra-card dark:text-myra-text-primary dark:shadow-black/50">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-myra-border">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-myra-primary text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Myra Assistant</p>
            <p className="text-xs text-slate-500 dark:text-myra-text-secondary">Reviewed business knowledge - Online</p>
          </div>
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md bg-myra-primary px-4 py-3 text-sm text-white">
            Do you offer weekend appointments?
          </div>
          <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 dark:border-myra-border dark:bg-myra-surface dark:text-myra-text-primary">
            Yes. Weekend appointments are available on Saturday from 10 AM to 4 PM. I can collect your details so the team can confirm a
            time.
          </div>
          <div className="flex flex-wrap gap-2">
            {["Knowledge connected", "Lead captured", "Admin approved"].map((item) => (
              <span key={item} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                {item}
              </span>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-myra-border dark:bg-myra-surface">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Lead captured</p>
              <Badge className="border-myra-primaryBorder bg-myra-primarySoft text-myra-primary dark:border-myra-border dark:bg-myra-muted dark:text-myra-primaryBorder">
                Ready for follow-up
              </Badge>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-myra-text-secondary sm:grid-cols-2">
              <span>Name: Sarah M.</span>
              <span>Interest: Weekend booking</span>
              <span>Phone: Collected</span>
              <span>Status: Ready for follow-up</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-myra-border dark:bg-myra-surface">
          {heroFeatureTags.map((item) => (
            <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500 dark:border-myra-border dark:bg-myra-muted dark:text-myra-text-secondary">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  centered = true
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <Badge className="border-myra-primaryBorder bg-myra-primarySoft text-myra-primary dark:border-myra-border dark:bg-myra-muted dark:text-myra-primaryBorder">
        {eyebrow}
      </Badge>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-myra-text-primary sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600 dark:text-myra-text-secondary sm:text-lg">{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: IconType; title: string; description: string }) {
  return (
    <Card className="group h-full border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-myra-primaryBorder hover:shadow-xl dark:border-myra-border dark:bg-myra-card">
      <CardHeader>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-myra-primarySoft text-myra-primary transition-colors group-hover:bg-myra-primary group-hover:text-white dark:bg-myra-muted dark:text-myra-primaryBorder">
          <Icon className="h-5 w-5" />
        </span>
        <CardTitle className="pt-3 text-base leading-6 text-slate-950 dark:text-myra-text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600 dark:text-myra-text-secondary">{description}</p>
      </CardContent>
    </Card>
  );
}

function BusinessValueSection() {
  return (
    <section className="bg-white px-4 py-20 dark:bg-myra-background sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Business value"
          title="Built to turn website visits into useful conversations"
          description="Myra helps business owners answer common questions, capture lead details, reduce repetitive support work, and guide customers toward booking, contacting, requesting a quote, or buying."
        />
        <div className="mt-8 text-center">
          <Button asChild>
            <Link to="/register">
              Start registration
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {businessValueCards.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="bg-slate-50 px-4 py-20 dark:bg-myra-surface sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="What Myra AI Assistant Does"
          title="A modern assistant workflow for customer questions, leads, and next steps"
          description="Everything a business needs to launch a reviewed AI assistant on its own website."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilityCards.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSolutionSection() {
  return (
    <section className="bg-white px-4 py-20 dark:bg-myra-background sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Why businesses need Myra"
          title="Fast, consistent answers create a better website experience"
          description="Myra gives businesses a practical way to respond faster while staying grounded in reviewed information."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ChecklistCard title="Business Problems" icon={ShieldAlert} items={businessProblems} tone="problem" />
          <ChecklistCard title="How Myra Helps" icon={ShieldCheck} items={myraBenefits} tone="solution" />
        </div>
      </div>
    </section>
  );
}

function ChecklistCard({
  title,
  icon: Icon,
  items,
  tone
}: {
  title: string;
  icon: IconType;
  items: string[];
  tone: "problem" | "solution";
}) {
  const problem = tone === "problem";
  return (
    <Card
      className={
        problem
          ? "border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10"
          : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
      }
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className={problem ? "rounded-xl bg-amber-100 p-2.5 text-amber-700" : "rounded-xl bg-emerald-100 p-2.5 text-emerald-700"}>
            <Icon className="h-5 w-5" />
          </span>
          <CardTitle className="text-xl text-slate-950 dark:text-myra-text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-myra-text-secondary">
            <CheckCircle2 className={problem ? "mt-1 h-4 w-4 shrink-0 text-amber-600" : "mt-1 h-4 w-4 shrink-0 text-emerald-600"} />
            <span>{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ComparisonSection() {
  return (
    <section className="bg-slate-50 px-4 py-20 dark:bg-myra-surface sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Comparison"
          title="Myra vs Regular Process"
          description="Contact forms and manual replies can be slow. Myra creates instant engagement while keeping answers grounded in approved business information."
        />
        <div className="mt-12 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-myra-border dark:bg-myra-card lg:grid-cols-2">
          <ComparisonCard title="Regular Process" items={regularProcessItems} icon={Clock3} />
          <ComparisonCard title="Myra AI Assistant" items={myraProcessItems} icon={Zap} highlighted />
        </div>
      </div>
    </section>
  );
}

function ComparisonCard({
  title,
  items,
  icon: Icon,
  highlighted = false
}: {
  title: string;
  items: string[];
  icon: IconType;
  highlighted?: boolean;
}) {
  return (
    <article
      className={
        highlighted
          ? "border-t border-myra-primaryBorder bg-myra-primarySoft p-6 dark:border-myra-borderStrong dark:bg-myra-muted sm:p-8 lg:border-l lg:border-t-0"
          : "p-6 dark:bg-myra-card sm:p-8"
      }
    >
      <div className="flex items-center gap-3">
        <span className={highlighted ? "rounded-xl bg-myra-primary p-2.5 text-white" : "rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-myra-muted dark:text-myra-text-secondary"}>
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-bold text-slate-950 dark:text-myra-text-primary">{title}</h3>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-myra-text-secondary">
            <Check className={highlighted ? "mt-1 h-4 w-4 shrink-0 text-myra-primary" : "mt-1 h-4 w-4 shrink-0 text-slate-400"} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function UseCasesSection() {
  return (
    <section className="bg-white px-4 py-20 dark:bg-myra-background sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Use cases"
          title="Useful across the businesses customers already search for"
          description="Myra works for small and medium businesses that need faster answers, cleaner lead capture, and a more helpful website experience."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="h-full border-slate-200 bg-slate-50 shadow-sm dark:border-myra-border dark:bg-myra-card">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-myra-primary shadow-sm dark:bg-myra-muted dark:text-myra-primaryBorder">
                  <useCase.icon className="h-5 w-5" />
                </span>
                <CardTitle className="pt-3 text-base text-slate-950 dark:text-myra-text-primary">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-myra-text-secondary">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-myra-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                {useCase.note ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-800">
                    {useCase.note}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeyFeaturesSection() {
  return (
    <section className="bg-slate-50 px-4 py-20 dark:bg-myra-surface sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Key features"
          title="Premium onboarding, assistant control, and dashboard workflows"
          description="A practical assistant workflow designed for reviewed business onboarding."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keyFeatures.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-white px-4 py-20 dark:bg-myra-background sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-myra-primarySoft text-slate-950 shadow-2xl dark:border-myra-border dark:from-myra-background dark:via-myra-surface dark:to-myra-card dark:text-white lg:grid-cols-[0.86fr_1.14fr]">
        <div className="p-8 sm:p-12">
          <Badge className="border-myra-primaryBorder bg-white/80 text-myra-primary dark:border-myra-primaryBorder/30 dark:bg-myra-muted dark:text-myra-primaryBorder">Trust and safety</Badge>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Reviewed before going live</h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            Myra is reviewed before launch so the assistant can stay aligned with approved business information and use a fallback message
            when information is unavailable.
          </p>
        </div>
        <div className="grid gap-3 bg-slate-50/80 p-6 dark:bg-white/5 sm:grid-cols-2 sm:p-8">
          {trustPoints.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <ShieldCheck className="h-5 w-5 text-myra-primary dark:text-myra-primaryBorder" />
              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-slate-50 px-4 py-20 dark:bg-myra-surface sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="How it works"
          title="From registration to approved website assistant"
          description="Activation happens after registration, payment, customer document upload, review, and approval."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {onboardingSteps.map((step, index) => (
            <Card key={step} className="border-slate-200 bg-white shadow-sm dark:border-myra-border dark:bg-myra-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-myra-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <CalendarDays className="h-5 w-5 text-slate-400 dark:text-myra-text-muted" />
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-800 dark:text-myra-text-primary">{step}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            Documents are usually reviewed and processed within 3 business days.
          </p>
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            For quality and safety, every business assistant is reviewed before activation.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-white px-4 py-20 dark:bg-myra-background sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Pricing"
          title="Choose the plan duration that fits your business"
          description="All plans include onboarding review, customer dashboard, knowledge uploads, lead capture, analytics, and embed code delivery after approval. In the MVP, plans differ only by price and duration."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex h-full flex-col border-slate-200 bg-white shadow-sm dark:border-myra-border dark:bg-myra-card ${
                plan.badge === "Best Value" ? "border-myra-borderStrong ring-2 ring-myra-accent/20 dark:border-myra-borderStrong" : ""
              }`}
            >
              {plan.badge ? (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-myra-primary bg-gradient-to-r from-myra-primary to-myra-accent text-white">
                  {plan.badge}
                </Badge>
              ) : null}
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-slate-950 dark:text-myra-text-primary">{plan.name}</CardTitle>
                <p className="pt-3 text-4xl font-bold text-slate-950 dark:text-myra-text-primary">{plan.price}</p>
                <p className="text-sm text-slate-500 dark:text-myra-text-secondary">{plan.duration}</p>
                <p className="text-xs text-slate-400 dark:text-myra-text-muted">{plan.renewal}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {planFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-myra-text-secondary">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-myra-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full">
                  <Link to={`/register?plan=${plan.name}`}>Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="border-y border-slate-200 bg-gradient-to-br from-myra-primarySoft via-white to-violet-50 px-4 py-20 text-slate-950 dark:border-myra-border dark:from-myra-background dark:via-myra-surface dark:to-myra-card dark:text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge className="border-myra-primaryBorder bg-white/80 text-myra-primary dark:border-myra-primaryBorder/30 dark:bg-myra-muted dark:text-myra-primaryBorder">Launch after approval</Badge>
        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Ready to launch your business AI assistant?</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Register your business, upload your knowledge, and let Myra help your visitors instantly after approval.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/register">Register Now</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-slate-300 bg-white/70 text-slate-900 shadow-none hover:bg-white hover:text-slate-950 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
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
    <footer className="border-t border-slate-200 bg-slate-100 px-4 py-10 text-slate-900 dark:border-myra-border dark:bg-myra-background dark:text-myra-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-myra-primary text-white">
              <Bot className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-bold">Myra AI</span>
              <span className="block text-sm text-slate-500 dark:text-myra-text-secondary">Assistant Platform</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-myra-text-secondary">
            Reviewed AI assistants for business websites, lead capture, customer guidance, and dashboard-based onboarding.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-myra-text-secondary">
          <Link to="/pricing" className="transition-colors hover:text-myra-primary dark:hover:text-white">
            Pricing
          </Link>
          <Link to="/login" className="transition-colors hover:text-myra-primary dark:hover:text-white">
            Login
          </Link>
          <Link to="/register" className="transition-colors hover:text-myra-primary dark:hover:text-white">
            Register
          </Link>
          <a href="#privacy" className="transition-colors hover:text-myra-primary dark:hover:text-white">
            Privacy Policy
          </a>
          <a href="#terms" className="transition-colors hover:text-myra-primary dark:hover:text-white">
            Terms
          </a>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-myra-border dark:text-myra-text-muted">
        Copyright 2026 Myra AI. All rights reserved.
      </div>
    </footer>
  );
}

export function LandingPage() {
  useScrollToHash();

  useEffect(() => {
    document.title = "Myra AI | Business Website Assistant";
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-myra-background dark:text-myra-text-primary">
      <PublicNav />
      <HeroSection />
      <BusinessValueSection />
      <CapabilitiesSection />
      <ProblemSolutionSection />
      <ComparisonSection />
      <UseCasesSection />
      <KeyFeaturesSection />
      <TrustSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCtaSection />
      <PublicFooter />
    </main>
  );
}
