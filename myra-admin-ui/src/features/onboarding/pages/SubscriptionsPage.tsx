import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { listAdminSubscriptions } from "@/features/onboarding/onboarding.api";
import { formatPlanPrice, getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import type { SubscriptionRecord } from "@/features/onboarding/onboarding.types";
import { formatDate } from "@/lib/utils";

export function SubscriptionsPage() {
  const subscriptionsQuery = useQuery({ queryKey: ["admin-subscriptions"], queryFn: listAdminSubscriptions });

  const columns = useMemo<DataTableColumn<SubscriptionRecord>[]>(
    () => [
      { header: "Tenant", accessor: "tenantId" },
      { header: "Plan", accessor: (subscription) => getSubscriptionPlan(subscription.planId).name },
      { header: "Amount", accessor: (subscription) => formatPlanPrice(getSubscriptionPlan(subscription.planId)) },
      { header: "Status", accessor: (subscription) => <StatusBadge status={subscription.status} /> },
      { header: "Started", accessor: (subscription) => formatDate(subscription.startedAt) },
      { header: "Renews", accessor: (subscription) => formatDate(subscription.renewsAt) },
      { header: "Renewal reminder", accessor: (subscription) => formatDate(subscription.renewalReminderAt) }
    ],
    []
  );

  return (
    <>
      <PageHeader title="Subscriptions" description="Review tenant subscription plans, status, renewal dates, and reminder schedule." />
      <DataTable
        columns={columns}
        data={subscriptionsQuery.data ?? []}
        getRowKey={(subscription) => subscription.id}
        isLoading={subscriptionsQuery.isLoading}
        emptyTitle="No subscriptions"
        emptyDescription="Subscriptions are created when business registration starts and become active after approval."
      />
    </>
  );
}
