import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Building2,
  DollarSign,
  FileX,
  MessageSquare,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge, type DashboardStatus } from "@/components/ui/StatusBadge";
import { getMyraAdminDashboard, type MyraAdminDashboard, type SystemHealthStatus } from "@/features/dashboard/dashboard.api";
import { formatDate } from "@/lib/utils";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<MyraAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);

    getMyraAdminDashboard()
      .then((data) => {
        if (!mounted) return;
        setDashboard(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <DashboardLoading />;

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-[#1f2937] bg-[#1a2235] p-6 text-sm text-gray-400">
        Failed to load dashboard data. Please refresh.
      </div>
    );
  }

  return <DashboardContent dashboard={dashboard} />;
}

function DashboardContent({ dashboard }: { dashboard: MyraAdminDashboard }) {
  const maxPlanCount = useMemo(() => Math.max(0, ...dashboard.plan_distribution.map((plan) => plan.count)), [dashboard.plan_distribution]);
  const maxConversations = useMemo(() => Math.max(0, ...dashboard.platform_usage.map((tenant) => tenant.conversation_count)), [dashboard.platform_usage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-white">Admin Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
            Platform control center for tenant approvals, usage health, revenue signals, leads, and knowledge processing.
          </p>
        </div>
        <Button asChild className="bg-[#3b82f6] hover:bg-[#2563eb]">
          <Link to="/approvals">
            <ShieldCheck className="h-4 w-4" />
            Review Queue
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total tenants" value={dashboard.total_tenants} icon={Building2} />
        <MetricCard label="Pending approvals" value={dashboard.pending_approvals} icon={ShieldCheck} />
        <MetricCard label="Active tenants" value={dashboard.active_tenants} icon={Activity} />
        <MetricCard label="Inactive tenants" value={dashboard.inactive_tenants} icon={AlertTriangle} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total conversations" value={dashboard.total_conversations} icon={MessageSquare} />
        <MetricCard label="Total leads" value={dashboard.total_leads} icon={UserPlus} />
        <MetricCard label="Revenue estimate" value={dashboard.revenue_estimate} icon={DollarSign} formatAsCurrency />
        <MetricCard label="Failed uploads" value={dashboard.failed_uploads} icon={FileX} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Pending Business Approvals">
          {dashboard.pending_businesses.length ? (
            <div className="space-y-3">
              {dashboard.pending_businesses.map((tenant) => (
                <article key={tenant.id} className="rounded-lg border border-[#1f2937] bg-[#111827] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{tenant.business_name}</p>
                      <p className="mt-1 text-sm text-gray-400">{tenant.category}</p>
                      <p className="mt-2 text-xs text-gray-400">{formatDate(tenant.registration_date)}</p>
                    </div>
                    <Button asChild size="sm" className="bg-[#3b82f6] hover:bg-[#2563eb]">
                      <Link to="/approvals">Review</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No businesses are waiting for approval.</p>
          )}
        </SectionCard>

        <SectionCard title="Plan Distribution">
          {dashboard.plan_distribution.length ? (
            <div className="space-y-4">
              {dashboard.plan_distribution.map((plan) => (
                <div key={plan.plan_name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-white">{plan.plan_name}</span>
                    <span className="text-gray-400">{plan.count.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={plan.count} max={maxPlanCount} color="blue" />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No plan data available.</p>
          )}
        </SectionCard>

        <SectionCard title="Recent Tenants">
          {dashboard.recent_tenants.length ? (
            <div className="space-y-3">
              {dashboard.recent_tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{tenant.tenant_name}</p>
                    <p className="mt-1 truncate text-sm text-gray-400">{tenant.category}</p>
                  </div>
                  <StatusBadge status={tenant.status as DashboardStatus} />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No tenants registered yet.</p>
          )}
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Platform Usage Analytics">
          {dashboard.platform_usage.length ? (
            <div className="space-y-4">
              {dashboard.platform_usage.map((tenant) => (
                <div key={tenant.tenant_name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-white">{tenant.tenant_name}</span>
                    <span className="text-gray-400">{tenant.conversation_count.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={tenant.conversation_count} max={maxConversations} color="green" />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No usage data available.</p>
          )}
        </SectionCard>

        <SectionCard title="System Health">
          {dashboard.system_health.length ? (
            <div className="space-y-3">
              {dashboard.system_health.map((service) => (
                <div key={service.service_name} className="flex items-center justify-between gap-3 rounded-lg border border-[#1f2937] bg-[#111827] p-3">
                  <p className="font-medium text-white">{service.service_name}</p>
                  <StatusBadge status={service.status as SystemHealthStatus} />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">Health data unavailable.</p>
          )}
        </SectionCard>
      </section>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-9 w-64" />
          <SkeletonBlock className="h-5 w-[min(42rem,80vw)]" />
        </div>
        <SkeletonBlock className="h-10 w-36" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-[#1f2937] bg-[#1a2235] p-5">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-5 w-5 rounded-md" />
            </div>
            <SkeletonBlock className="mt-5 h-9 w-20" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <SectionSkeleton key={index} />
        ))}
      </section>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#1a2235] p-5">
      <SkeletonBlock className="h-6 w-48" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-700/70 ${className}`} />;
}
