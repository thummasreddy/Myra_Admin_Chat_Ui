import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Building2,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge, type DashboardStatus } from "@/components/ui/StatusBadge";
import { getMyraAdminDashboard, type MyraAdminDashboard } from "@/features/dashboard/dashboard.api";
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
      <div className="rounded-xl border border-[#0A2A6B] bg-[#001B5A] p-6 text-sm text-gray-400">
        Failed to load dashboard data. Please check your connection and refresh.
      </div>
    );
  }

  return <DashboardContent dashboard={dashboard} />;
}

function DashboardContent({ dashboard }: { dashboard: MyraAdminDashboard }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-white">Admin Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
            Platform control center for tenant approvals, usage health, leads, and conversations.
          </p>
        </div>
        <Button asChild className="bg-[#001B5A] hover:bg-[#234D9A]">
          <Link to="/approvals">
            <ShieldCheck className="h-4 w-4" />
            Review Queue
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total tenants" value={dashboard.total_tenants} icon={Building2} />
        <MetricCard label="Active tenants" value={dashboard.active_tenants} icon={Activity} />
        <MetricCard label="Pending approvals" value={dashboard.pending_approvals} icon={ShieldCheck} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Suspended tenants" value={dashboard.suspended_tenants} icon={AlertTriangle} />
        <MetricCard label="Total users" value={dashboard.total_users} icon={Users} />
        <MetricCard label="Total conversations" value={dashboard.total_conversations} icon={MessageSquare} />
        <MetricCard label="Total leads" value={dashboard.total_leads} icon={UserPlus} />
      </section>

      <section className="grid gap-4 xl:grid-cols-1">
        <SectionCard title="Recent Tenants">
          {dashboard.recent_tenants.length ? (
            <div className="space-y-3">
              {dashboard.recent_tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#0A2A6B] bg-[#001235] p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{tenant.business_name}</p>
                    <p className="mt-1 truncate text-sm text-gray-400">{tenant.tenant_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(tenant.created_at)}</span>
                    <StatusBadge status={tenant.status as DashboardStatus} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No tenants registered yet.</p>
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-[#0A2A6B] bg-[#001B5A] p-5">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-5 w-5 rounded-md" />
            </div>
            <SkeletonBlock className="mt-5 h-9 w-20" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-[#0A2A6B] bg-[#001B5A] p-5">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-5 w-5 rounded-md" />
            </div>
            <SkeletonBlock className="mt-5 h-9 w-20" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-1">
        <SectionSkeleton />
      </section>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="rounded-xl border border-[#0A2A6B] bg-[#001B5A] p-5">
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
