import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Users,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Zap,
  ShieldCheck,
  FileText,
  BarChart3,
  Palette,
  Bell,
  CreditCard,
  Upload,
  Layout,
  MessageCircle,
  Bot,
  UserCheck
} from "lucide-react";

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex flex-col">
          <span className="text-lg font-bold text-white">Myra AI</span>
          <span className="text-[10px] text-slate-400">Assistant Platform</span>
        </Link>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
            Pricing
          </a>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Button asChild size="sm">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-28 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI Website Assistant for Businesses
            </h1>
            <p className="text-xl font-medium text-indigo-300">
              Turn website visitors into customers with Myra AI
            </p>
            <p className="max-w-lg text-slate-300">
              Launch a reviewed AI assistant that answers questions, captures leads, recommends products or services, and guides visitors using your approved business knowledge.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">Start Free / Register</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                <a href="#pricing">View Pricing</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">Reviewed before launch</Badge>
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">Business-specific knowledge</Badge>
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">Lead capture ready</Badge>
            </div>
          </div>

          {/* Right – demo widget */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-0 shadow-2xl shadow-indigo-500/10">
              {/* Widget header */}
              <div className="flex items-center gap-2 rounded-t-2xl bg-indigo-600 px-4 py-3">
                <Bot className="h-5 w-5 text-white" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Myra Assistant</p>
                  <p className="text-[10px] text-indigo-200">Reviewed business knowledge · Online</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              {/* Messages */}
              <div className="space-y-3 p-4">
                <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-indigo-600 px-3 py-2 text-sm text-white">
                  Do you offer weekend appointments?
                </div>
                <div className="mr-auto max-w-[85%] rounded-xl rounded-bl-sm bg-slate-800 px-3 py-2 text-sm text-slate-200">
                  Yes. Weekend appointments are available on Saturday from 10 AM to 4 PM. I can collect your details so the team can confirm a time.
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">Knowledge connected</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">Lead captured</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">Admin approved</Badge>
                </div>
              </div>
              {/* Lead card */}
              <div className="mx-4 mb-4 rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-xs text-slate-300">
                <p className="mb-1 font-semibold text-slate-200">Lead Captured</p>
                <p>Name: Sarah M. | Interest: Weekend booking</p>
                <p>Phone: Collected | Status: Ready for follow-up</p>
              </div>
              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 border-t border-slate-700 p-3">
                {[
                  "Business assistant active",
                  "Live-ready after review",
                  "Knowledge base connected",
                  "Approved business answers",
                  "Lead capture enabled",
                  "Visitor details collected",
                  "Recommendations enabled",
                  "Guided next steps"
                ].map((tag) => (
                  <Badge key={tag} className="bg-slate-800 text-slate-400 border-slate-700 text-[9px]">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Business Value ─── */
function BusinessValueSection() {
  const cards = [
    { icon: MessageSquare, title: "Real conversations from visitors", desc: "Turn passive browsing into guided customer conversations." },
    { icon: Zap, title: "Instant approved answers", desc: "Respond from the business knowledge your team provides." },
    { icon: Clock, title: "24/7 assistant support", desc: "Help visitors after hours without adding a full-time team." },
    { icon: Target, title: "More leads and opportunities", desc: "Capture names, contact details, and customer intent." }
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Built to turn website visits into useful conversations
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Myra helps business owners answer common questions, capture lead details, reduce repetitive support work, and guide customers toward booking, contacting, requesting a quote, or buying.
          </p>
          <Button asChild className="mt-6">
            <Link to="/register">Start registration</Link>
          </Button>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.title} className="border-slate-200 bg-slate-50">
              <CardHeader className="pb-2">
                <c.icon className="h-8 w-8 text-indigo-600" />
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What Myra Does ─── */
function WhatMyraDoesSection() {
  const features = [
    { icon: MessageCircle, title: "Answer Questions Instantly", desc: "Give visitors fast answers from business-provided FAQs, policies, services, and documents." },
    { icon: FileText, title: "Explain Products and Services", desc: "Help customers understand pricing, packages, availability, opening hours, and next steps." },
    { icon: Users, title: "Capture Qualified Leads", desc: "Collect name, email, phone, interest, and requirements while the visitor is engaged." },
    { icon: Target, title: "Guide Customers Forward", desc: "Move visitors toward booking, contacting, requesting a quote, or starting a purchase." },
    { icon: Clock, title: "Work Around The Clock", desc: "Keep the website responsive even outside normal business hours." },
    { icon: Zap, title: "Reduce Repetitive Support", desc: "Automate common questions across calls, messages, email, and contact forms." }
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            A modern assistant workflow for customer questions, leads, and next steps
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything a business needs to launch a reviewed AI assistant on its own website.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-slate-200">
              <CardHeader className="pb-2">
                <f.icon className="h-7 w-7 text-indigo-600" />
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Why Businesses Need Myra ─── */
function WhyMyraSection() {
  const problems = [
    "Website visitors leave when they do not find answers quickly",
    "Business owners spend too much time answering repeated questions",
    "Customers ask the same questions about price, availability, timing, services, policies, and process",
    "Small businesses cannot always afford a 24/7 support team",
    "Contact forms are slow and do not create instant engagement",
    "Manual support can be inconsistent"
  ];
  const solutions = [
    "Save time by automating repeated customer questions",
    "Reduce manual support effort across calls, messages, and emails",
    "Capture more lead opportunities from website visitors",
    "Improve customer trust with faster and clearer responses",
    "Increase website engagement with real-time conversations",
    "Support customers 24/7, even outside business hours"
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Fast, consistent answers create a better website experience
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Myra gives businesses a practical way to respond faster while staying grounded in reviewed information.
          </p>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-red-700">Business Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {problems.map((p) => (
                <div key={p} className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span className="text-sm text-slate-700">{p}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-700">How Myra Helps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {solutions.map((s) => (
                <div key={s} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-700">{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison ─── */
function ComparisonSection() {
  const regular = [
    "Customer searches the website manually",
    "Customer fills a contact form and waits",
    "Business owner replies later",
    "Same questions are answered repeatedly",
    "Missed calls or messages can lose leads",
    "Support depends on business working hours",
    "Responses may vary by person"
  ];
  const myra = [
    "Customer gets instant answers",
    "Assistant guides the customer in real time",
    "Lead details are captured immediately",
    "Common questions are automated",
    "Works 24/7",
    "Gives consistent responses from approved knowledge",
    "Helps customers move toward booking, quote request, purchase, or contact"
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Myra vs Regular Process
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Contact forms and manual replies can be slow. Myra creates instant engagement while keeping answers grounded in approved business information.
          </p>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Card className="border-slate-300">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Regular Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {regular.map((r) => (
                <div key={r} className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-600">{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-700">Myra AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myra.map((m) => (
                <div key={m} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                  <span className="text-sm text-slate-700">{m}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ─── Use Cases ─── */
function UseCasesSection() {
  const useCases = [
    { title: "E-commerce", items: ["Product questions", "Delivery policy", "Return policy", "Size or variant guidance", "Order-related FAQs"] },
    { title: "Restaurant / Food Business", items: ["Menu questions", "Opening hours", "Location", "Catering inquiries", "Reservation or order guidance"] },
    { title: "Service Business", items: ["Service details", "Pricing packages", "Appointment requests", "Quote collection", "Process explanation"] },
    { title: "Clinic / Healthcare Office", items: ["Services offered", "Appointment guidance", "Insurance or general policy FAQs", "Opening hours", "Contact routing"], note: "Myra should not provide medical diagnosis or treatment advice." },
    { title: "Real Estate", items: ["Property inquiry capture", "Location details", "Price range guidance", "Schedule visit request", "Buyer or renter qualification"] },
    { title: "Education / Coaching", items: ["Course details", "Fees", "Batch timings", "Admission process", "Lead capture for counseling"] },
    { title: "Agency / Consulting", items: ["Service explanation", "Portfolio guidance", "Pricing inquiry", "Discovery call booking", "Requirement collection"] }
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Useful across the businesses customers already search for
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Myra works for small and medium businesses that need faster answers, cleaner lead capture, and a more helpful website experience.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {useCases.map((uc) => (
            <Card key={uc.title} className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{uc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {uc.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-sm text-slate-600">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                {uc.note && (
                  <p className="mt-3 text-xs italic text-slate-500">{uc.note}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Key Features ─── */
function KeyFeaturesSection() {
  const features = [
    { icon: Layout, title: "Easy website embed", desc: "Add Myra to your website with a simple embed code after approval." },
    { icon: Bot, title: "Business-specific AI knowledge", desc: "Myra answers using the knowledge documents and business details you provide." },
    { icon: Users, title: "Customer lead capture", desc: "Collect visitor details such as name, email, phone, interest, and requirement." },
    { icon: UserCheck, title: "Admin-reviewed activation", desc: "Every assistant is reviewed before it goes live for quality and safety." },
    { icon: Upload, title: "Knowledge document upload", desc: "Upload FAQs, service information, policies, menus, product guides, and business process documents." },
    { icon: Layout, title: "Customer dashboard", desc: "Manage subscription, documents, settings, embed code, support, and basic analytics." },
    { icon: BarChart3, title: "Basic analytics", desc: "View simple engagement insights to understand how customers interact with your assistant." },
    { icon: Palette, title: "Brand customization", desc: "Set assistant name, brand color, business description, and fallback message." },
    { icon: MessageSquare, title: "Fallback message control", desc: "Choose what Myra says when approved information is not available." },
    { icon: CreditCard, title: "Subscription-based access", desc: "Choose a plan duration that fits your business needs." },
    { icon: Bell, title: "Email notifications", desc: "Receive onboarding, payment, approval, document, embed, and renewal updates." },
    { icon: ShieldCheck, title: "Human review before launch", desc: "The Myra team reviews business details and documents before activation." }
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Premium onboarding, assistant control, and dashboard workflows
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A practical assistant workflow designed for reviewed business onboarding.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="border-slate-200">
              <CardHeader className="pb-2">
                <f.icon className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-sm font-semibold">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trust and Safety ─── */
function TrustSection() {
  const bullets = [
    "Business details and knowledge documents are reviewed",
    "Documents are usually reviewed and processed within 3 business days",
    "Embed code is sent only after approval",
    "Business owners can update assistant settings",
    "The assistant uses approved business knowledge",
    "Fallback message is used when information is unavailable",
    "This helps avoid wrong or unsupported answers"
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Reviewed before going live
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Myra is reviewed before launch so the assistant can stay aligned with approved business information and use a fallback message when information is unavailable.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {bullets.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
              <span className="text-slate-700">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorksSection() {
  const steps = [
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

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            From registration to approved website assistant
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Activation happens after registration, payment, customer document upload, review, and approval.
          </p>
        </div>
        <div className="mx-auto mt-14 max-w-2xl space-y-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-slate-700">{step}</span>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p>Documents are usually reviewed and processed within 3 business days.</p>
          <p>For quality and safety, every business assistant is reviewed before activation.</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function PricingSection() {
  const plans = [
    { name: "Starter", price: "$49", duration: "1 month", note: "Renews monthly", badge: null },
    { name: "Growth", price: "$129", duration: "3 months", note: "Renews every 3 months", badge: "Popular" },
    { name: "Pro", price: "$239", duration: "6 months", note: "Renews every 6 months", badge: "Best Value" },
    { name: "Enterprise", price: "$449", duration: "12 months", note: "Renews yearly", badge: "Annual" }
  ];
  const planFeatures = [
    "Myra AI Assistant widget",
    "Business-specific knowledge setup",
    "Customer dashboard",
    "Knowledge document upload",
    "Admin-reviewed activation"
  ];

  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Choose the plan duration that fits your business
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            All plans include onboarding review, customer dashboard, knowledge uploads, lead capture, analytics, and embed code delivery after approval. In the MVP, plans differ only by price and duration.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative border-slate-200 ${plan.badge === "Best Value" ? "ring-2 ring-indigo-500" : ""}`}>
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white border-indigo-600">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-3xl font-bold text-slate-900">{plan.price}</p>
                <p className="text-sm text-slate-500">{plan.duration}</p>
                <p className="text-xs text-slate-400">{plan.note}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link to="/register">Choose Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTASection() {
  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to launch your business AI assistant?
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          Register your business, upload your knowledge, and let Myra help your visitors instantly after approval.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/register">Register Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-200 hover:bg-slate-800">
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">Myra AI</p>
            <p className="text-xs text-slate-400">Assistant Platform</p>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Reviewed AI assistants for business websites, lead capture, customer guidance, and dashboard-based onboarding.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">
          Copyright 2026 Myra AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Landing Page ─── */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <BusinessValueSection />
      <WhatMyraDoesSection />
      <WhyMyraSection />
      <ComparisonSection />
      <UseCasesSection />
      <KeyFeaturesSection />
      <TrustSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
