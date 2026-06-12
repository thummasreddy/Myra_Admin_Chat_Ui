import { Bot, ExternalLink, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  PublicTenantNotFoundError,
  fetchTenantPublicProfile,
  type TenantPublicProfile
} from "@/features/public/api/publicTenant.api";

const MYRA_WIDGET_SCRIPT_URL = "https://cdn.myra.ai/widget.js";
const WIDGET_SCRIPT_ID = "myra-public-tenant-widget";

export function TenantPublicPage() {
  const { tenantId = "" } = useParams();
  const [profile, setProfile] = useState<TenantPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    if (!tenantId) {
      setProfile(null);
      setError(new PublicTenantNotFoundError(""));
      setIsLoading(false);
      return;
    }

    fetchTenantPublicProfile(tenantId)
      .then((nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
      })
      .catch((nextError: unknown) => {
        if (!active) return;
        setProfile(null);
        setError(nextError instanceof Error ? nextError : new Error("Unable to load tenant profile."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tenantId]);

  useEffect(() => {
    if (!profile) return undefined;

    const previousScript = document.getElementById(WIDGET_SCRIPT_ID);
    previousScript?.remove();

    const script = document.createElement("script");
    script.id = WIDGET_SCRIPT_ID;
    script.src = MYRA_WIDGET_SCRIPT_URL;
    script.async = true;
    script.dataset.tenantId = profile.tenantId || tenantId;
    script.dataset.apiKey = profile.apiKey;
    if (new URLSearchParams(window.location.search).get("open") === "true") {
      script.dataset.autoOpen = "true";
    }
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [profile, tenantId]);

  useEffect(() => {
    document.title = profile ? `${profile.businessName} | Myra AI` : "Business Page | Myra AI";
  }, [profile]);

  const brandColor = normalizeColor(profile?.brandColor);
  const websiteHref = useMemo(() => normalizeWebsiteUrl(profile?.websiteUrl), [profile?.websiteUrl]);
  const isNotFound = error instanceof PublicTenantNotFoundError;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-main)]">
        <LoadingSpinner className="min-h-screen" label="Loading business page" />
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)] px-6">
        <section className="w-full max-w-lg rounded-lg border bg-[var(--color-bg-card)] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-normal text-[var(--color-text-main)]">Business page not found</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This Myra assistant page is not available. Check the QR code or business link and try again.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go to Myra AI</Link>
          </Button>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)] px-6">
        <section className="w-full max-w-lg rounded-lg border bg-[var(--color-bg-card)] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-normal text-[var(--color-text-main)]">Unable to load business page</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Please refresh the page or use the business website link directly.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)]">
      <header className="relative overflow-hidden border-b bg-[var(--color-bg-card)]">
        <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: brandColor }} />
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt={`${profile.businessName} logo`} className="h-16 w-16 rounded-md border bg-white object-contain p-2" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md text-white shadow-lg" style={{ backgroundColor: brandColor }}>
                <Bot className="h-8 w-8" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">Myra AI Assistant</p>
              <h1 className="truncate text-3xl font-semibold tracking-normal sm:text-4xl">{profile.businessName}</h1>
            </div>
          </div>
          {websiteHref ? (
            <Button asChild variant="outline">
              <a href={websiteHref} target="_blank" rel="noreferrer">
                Visit Website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="rounded-lg border bg-[var(--color-bg-card)] p-6 shadow-sm">
            <div className="mb-4 h-1.5 w-20 rounded-full" style={{ backgroundColor: brandColor }} />
            <h2 className="text-2xl font-semibold tracking-normal">How can we help?</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)]">
              {profile.businessDescription || "Ask the Myra assistant about services, availability, pricing, policies, or next steps."}
            </p>
          </div>
        </div>

        <aside className="rounded-lg border bg-[var(--color-bg-card)] p-5 text-sm shadow-sm">
          <h2 className="font-semibold tracking-normal">Contact</h2>
          <div className="mt-4 space-y-3 text-muted-foreground">
            {profile.supportEmail ? (
              <a className="flex items-center gap-2 hover:text-primary" href={`mailto:${profile.supportEmail}`}>
                <Mail className="h-4 w-4" />
                {profile.supportEmail}
              </a>
            ) : null}
            {websiteHref ? (
              <a className="flex items-center gap-2 hover:text-primary" href={websiteHref} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                {profile.websiteUrl}
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      <footer className="border-t bg-[var(--color-bg-card)] px-6 py-6 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Powered by Myra AI</span>
          <div className="flex flex-wrap gap-4">
            {profile.supportEmail ? <a href={`mailto:${profile.supportEmail}`}>{profile.supportEmail}</a> : null}
            {websiteHref ? (
              <a href={websiteHref} target="_blank" rel="noreferrer">
                {profile.websiteUrl}
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </main>
  );
}

function normalizeColor(value?: string | null) {
  return /^#[0-9A-Fa-f]{6}$/.test(value ?? "") ? value ?? "#1591DC" : "#1591DC";
}

function normalizeWebsiteUrl(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(`https://${value}`).toString();
    } catch {
      return null;
    }
  }
}
