import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ShieldCheck,
  Clock,
  Users,
  Zap,
  BookOpen,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Headphones,
  Target,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Lock,
  Globe,
  Mail,
  Building2,
  CalendarCheck
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll-to-hash on mount / navigation                               */
/* ------------------------------------------------------------------ */
function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">Myra AI</span>
          <span className="hidden text-sm text-gray-400 sm:inline">Assistant Platform</span>
        </Link>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <Link to="/myra-admin/login" className="text-sm text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Button size="sm" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gray-950 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI Website Assistant for Businesses
            </h1>
            <p className="mt-4 text-xl text-indigo-300">
              Turn website visitors into customers with Myra AI
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-400">
              Launch a reviewed AI assistant that answers questions, captures leads, recommends products or services, and guides visitors using your approved business knowledge.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/register">Start Free / Register</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-gray-700 text-gray-200 hover:bg-gray-800">
                <a href="#pricing">View Pricing</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Reviewed before launch", "Business-specific knowledge", "Lead capture ready"].map((t) => (
                <Badge key={t} className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right column — mock chat widget */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-gray-700/60 bg-gray-900 shadow-2xl shadow-indigo-500/10">
              {/* Widget header */}
              <div className="flex items-center gap-3 border-b border-gray-700/60 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Myra Assistant</p>
                  <p className="text-xs text-gray-400">Reviewed business knowledge &middot; Online</p>
                </div>
              </div>
              {/* Chat messages */}
              <div className="space-y-4 p-5">
                {/* Visitor */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                    Do you offer weekend appointments?
                  </div>
                </div>
                {/* Reply */}
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-2.5 text-sm text-gray-200">
                    Yes. Weekend appointments are available on Saturday from 10 AM to 4 PM. I can collect your details so the team can confirm a time.
                  </div>
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {["Knowledge connected", "Lead captured", "Admin approved"].map((tag) => (
                    <span key={tag} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Lead card */}
                <div className="rounded-lg border border-gray-700/50 bg-gray-800/60 p-3 text-xs text-gray-300">
                  <p className="mb-1 font-semibold text-white">Lead Captured</p>
                  <p>Name: Sarah M.</p>
                  <p>Interest: Weekend booking</p>
                  <p>Phone: Collected</p>
                  <p>Status: Ready for follow-up</p>
                </div>
              </div>
              {/* Feature tags bar */}
              <div className="flex flex-wrap gap-2 border-t border-gray-700/60 px-5 py-3">
                {[
                  "Business assistant active",
                  "Live-ready after review",
                  "Knowledge base connected",
                  "Approved business answers",
                  "Lead capture enabled",
                  "Visitor details collected",
                  "Recommendations enabled",
                  "Guided next steps"
                ].map((ft) => (
                  <span key={ft} className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400 ring-1 ring-gray-700">
                    {ft}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Business value                                                     */
/* ------------------------------------------------------------------ */
const businessCards = [
  {
    icon: MessageSquare,
    title: "Real conversations from visitors",
    description: "Engage website visitors with natural, context-aware conversations that feel personal and helpful."
  },
  {
    icon: Zap,
    title: "Instant approved answers",
    description: "Deliver accurate, admin-reviewed responses to common questions without making visitors wait."
  },
  {
    icon: Clock,
    title: "24/7 assistant support",
    description: "Your AI assistant works around the clock so visitors always get the help they need, even outside business hours."
  },
  {
    icon: Target,
    title: "More leads and opportunities",
    description: "Capture visitor details and interests automatically, turning casual browsers into qualified leads."
  }
];

function BusinessValueSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Built to turn website visits into useful conversations
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Myra helps business owners answer common questions, capture lead details, reduce repetitive support work, and guide customers toward booking, contacting, requesting a quote, or buying.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/register">
              Start registration <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {businessCards.map((c) => (
            <Card key={c.title} className="border-gray-200 bg-gray-50">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <c.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  What Myra Does                                                     */
/* ------------------------------------------------------------------ */
const featureCards = [
  {
    icon: MessageSquare,
    title: "Answer Questions Instantly",
    description: "Respond to visitor questions in real time using reviewed and approved business knowledge."
  },
  {
    icon: BookOpen,
    title: "Explain Products and Services",
    description: "Help visitors understand what you offer with clear, accurate explanations drawn from your uploaded knowledge."
  },
  {
    icon: UserCheck,
    title: "Capture Qualified Leads",
    description: "Collect visitor names, emails, phone numbers, and interests automatically during the conversation."
  },
  {
    icon: ArrowRight,
    title: "Guide Customers Forward",
    description: "Direct visitors toward the next step — booking an appointment, requesting a quote, making a purchase, or contacting the team."
  },
  {
    icon: Clock,
    title: "Work Around The Clock",
    description: "Your assistant is always available, even outside business hours, weekends, and holidays."
  },
  {
    icon: Headphones,
    title: "Reduce Repetitive Support",
    description: "Handle the same common questions automatically so your team can focus on higher-value work."
  }
];

function WhatMyraDoes() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A modern assistant workflow for customer questions, leads, and next steps
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything a business needs to launch a reviewed AI assistant on its own website.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((f) => (
            <Card key={f.title} className="border-gray-200 bg-white">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why businesses need Myra                                           */
/* ------------------------------------------------------------------ */
const businessProblems = [
  "Visitors leave when they cannot find answers quickly",
  "Staff answer the same questions repeatedly",
  "Leads are missed outside business hours",
  "Website content does not guide visitors to take action",
  "Support response times frustrate customers",
  "No system captures visitor intent or details automatically",
  "Businesses lose revenue from unengaged visitors"
];

const myraHelps = [
  "Instant, reviewed answers from approved business knowledge",
  "Automatic lead capture during every conversation",
  "Available 24/7 — weekends, holidays, after hours",
  "Guides visitors to book, buy, call, or request a quote",
  "Reduces repetitive workload for support teams",
  "Dashboard with leads, conversations, and analytics"
];

function WhyBusinessesNeedMyra() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Fast, consistent answers create a better website experience
        </h2>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Problems */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-700">Business Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {businessProblems.map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  {p}
                </div>
              ))}
            </CardContent>
          </Card>
          {/* Solutions */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-emerald-700">How Myra Helps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myraHelps.map((h) => (
                <div key={h} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {h}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison table                                                   */
/* ------------------------------------------------------------------ */
const comparisonRows = [
  ["Visitor asks a question on website", "AI assistant answers instantly from reviewed knowledge"],
  ["Staff manually responds hours later", "Automated lead capture during the conversation"],
  ["Lead details lost or forgotten", "Visitor details stored in business dashboard"],
  ["No follow-up system in place", "Dashboard shows leads ready for follow-up"],
  ["Website content is static and passive", "Guided next steps: book, buy, quote, contact"],
  ["Support only during business hours", "Available 24/7 including holidays and weekends"],
  ["Inconsistent answers across staff", "Consistent, approved answers every time"]
];

function ComparisonSection() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Myra vs Regular Process
        </h2>
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-2">
            <div className="border-b border-r border-gray-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700">
              Regular Process
            </div>
            <div className="border-b border-gray-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700">
              Myra AI Assistant
            </div>
          </div>
          {comparisonRows.map(([regular, myra], i) => (
            <div key={i} className="grid grid-cols-2">
              <div className={`border-r border-gray-200 px-6 py-3 text-sm text-gray-600 ${i < comparisonRows.length - 1 ? "border-b" : ""}`}>
                {regular}
              </div>
              <div className={`px-6 py-3 text-sm text-gray-700 ${i < comparisonRows.length - 1 ? "border-b border-gray-200" : ""}`}>
                {myra}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Use cases                                                          */
/* ------------------------------------------------------------------ */
const useCases = [
  {
    icon: Building2,
    title: "E-commerce",
    items: [
      "Answer product questions instantly",
      "Recommend items based on visitor needs",
      "Capture leads from undecided shoppers",
      "Guide visitors to checkout or wishlists"
    ]
  },
  {
    icon: CalendarCheck,
    title: "Restaurant / Food Business",
    items: [
      "Share menu details and specials",
      "Answer questions about hours and location",
      "Capture reservation or catering inquiries",
      "Guide visitors to order online or call"
    ]
  },
  {
    icon: Settings,
    title: "Service Business",
    items: [
      "Explain service offerings and pricing",
      "Capture quote requests automatically",
      "Answer availability and scheduling questions",
      "Guide visitors to book or contact the team"
    ]
  },
  {
    icon: Sparkles,
    title: "Clinic / Healthcare Office",
    items: [
      "Answer questions about services and hours",
      "Capture appointment interest and contact info",
      "Guide visitors to book or call the office",
      "Note: Myra does not provide medical advice"
    ]
  },
  {
    icon: Globe,
    title: "Real Estate",
    items: [
      "Answer questions about listings and availability",
      "Capture buyer or renter interest and details",
      "Share neighborhood and property information",
      "Guide visitors to schedule a showing or call"
    ]
  },
  {
    icon: BookOpen,
    title: "Education / Coaching",
    items: [
      "Explain programs, courses, and schedules",
      "Capture enrollment or consultation interest",
      "Answer questions about pricing and materials",
      "Guide visitors to register or book a session"
    ]
  },
  {
    icon: BarChart3,
    title: "Agency / Consulting",
    items: [
      "Explain service packages and case studies",
      "Capture project inquiries and budgets",
      "Answer questions about process and timelines",
      "Guide visitors to schedule a discovery call"
    ]
  }
];

function UseCasesSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Useful across the businesses customers already search for
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {useCases.map((uc) => (
            <Card key={uc.title} className="border-gray-200 bg-gray-50">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <uc.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{uc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {uc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Key features                                                       */
/* ------------------------------------------------------------------ */
const keyFeatures = [
  { icon: FileText, title: "Knowledge document upload", description: "Upload your business documents so Myra can learn your services, FAQs, and policies." },
  { icon: Eye, title: "Admin review and approval", description: "Every assistant is reviewed by an admin before going live to ensure quality and accuracy." },
  { icon: MessageSquare, title: "AI-powered chat widget", description: "A modern, embeddable chat widget that works on any website." },
  { icon: UserCheck, title: "Automatic lead capture", description: "Collect visitor names, emails, phone numbers, and interests during conversations." },
  { icon: BarChart3, title: "Customer dashboard", description: "View leads, conversations, analytics, and assistant settings from one place." },
  { icon: Settings, title: "Business-specific configuration", description: "Customize your assistant's behavior, prompts, and knowledge base to match your business." },
  { icon: Lock, title: "Secure and isolated", description: "Each business gets its own isolated assistant, knowledge base, and data." },
  { icon: Sparkles, title: "Smart recommendations", description: "Myra can recommend products, services, or next steps based on visitor questions." },
  { icon: Mail, title: "Email notifications", description: "Get notified when new leads are captured or important conversations happen." },
  { icon: Globe, title: "Embed on any website", description: "Add Myra to your website with a simple code snippet — no developer required." },
  { icon: Users, title: "Multi-tenant platform", description: "Built for scale — each business operates independently on the same platform." },
  { icon: ShieldCheck, title: "Reviewed before going live", description: "Quality assurance process ensures every assistant meets platform standards." }
];

function KeyFeaturesSection() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Premium onboarding, assistant control, and dashboard workflows
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keyFeatures.map((f) => (
            <Card key={f.title} className="border-gray-200 bg-white">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust and safety                                                   */
/* ------------------------------------------------------------------ */
const trustPoints = [
  "Every business assistant is reviewed before activation",
  "Knowledge documents are processed and verified",
  "AI responses are grounded in approved business content",
  "No assistant goes live without admin approval",
  "Business data is isolated per tenant",
  "Platform monitors for quality and safety",
  "Businesses can update knowledge and request re-review at any time"
];

function TrustSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Reviewed before going live
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Myra is not a generic chatbot. Every business assistant goes through an admin review process before activation. This ensures accurate, safe, and business-specific responses.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl space-y-4">
          {trustPoints.map((p) => (
            <div key={p} className="flex items-start gap-3 text-gray-700">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
              <span className="text-sm">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */
const steps = [
  "Register your business on the Myra platform",
  "Choose a subscription plan (Starter, Growth, Pro, or Enterprise)",
  "Complete your business profile in the customer dashboard",
  "Upload knowledge documents (FAQs, service descriptions, policies)",
  "Configure your assistant preferences and system prompt",
  "Submit your business for admin review",
  "Admin reviews your knowledge base and assistant configuration",
  "Once approved, receive your embed code",
  "Add the embed code to your website",
  "Your AI assistant is live and ready to help visitors"
];

function HowItWorksSection() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          From registration to approved website assistant
        </h2>
        <div className="mx-auto mt-12 max-w-2xl space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-indigo-200" />}
              </div>
              <p className="pb-8 text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-2xl space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>Documents are usually reviewed and processed within 3 business days.</p>
          <p>For quality and safety, every business assistant is reviewed before activation.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */
const plans = [
  { name: "Starter", price: "$49", duration: "1 month", renewal: "Renews monthly", badge: null },
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

function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Choose the plan duration that fits your business
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-gray-200 ${plan.badge === "Best Value" ? "ring-2 ring-indigo-500" : ""}`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-indigo-500/30 bg-indigo-600 text-white">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="mt-2 text-4xl font-bold text-gray-900">{plan.price}</p>
                <p className="text-sm text-gray-500">{plan.duration}</p>
                <p className="text-xs text-gray-400">{plan.renewal}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" asChild>
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

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section className="bg-gray-950 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to launch your business AI assistant?
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          Register your business, upload your knowledge, and let Myra help your visitors instantly after approval.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Register Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-gray-700 text-gray-200 hover:bg-gray-800">
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">
              Myra AI <span className="text-sm font-normal text-gray-400">&mdash; Assistant Platform</span>
            </p>
            <p className="mt-1 max-w-md text-xs text-gray-500">
              Reviewed AI assistants for business websites, lead capture, customer guidance, and dashboard-based onboarding.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/myra-admin/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <span className="cursor-default">Privacy Policy</span>
            <span className="cursor-default">Terms</span>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          Copyright 2026 Myra AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  Landing Page                                                       */
/* ================================================================== */
export function LandingPage() {
  useScrollToHash();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <BusinessValueSection />
      <WhatMyraDoes />
      <WhyBusinessesNeedMyra />
      <ComparisonSection />
      <UseCasesSection />
      <KeyFeaturesSection />
      <TrustSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
