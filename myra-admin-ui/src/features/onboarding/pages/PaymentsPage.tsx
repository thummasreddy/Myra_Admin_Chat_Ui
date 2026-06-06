import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAdminPayments } from "@/features/onboarding/onboarding.api";
import { getSubscriptionPlan } from "@/features/onboarding/onboarding.data";
import type { PaymentRecord } from "@/features/onboarding/onboarding.types";
import { formatDate } from "@/lib/utils";

export function PaymentsPage() {
  const paymentsQuery = useQuery({ queryKey: ["admin-payments"], queryFn: listAdminPayments });

  const columns = useMemo<DataTableColumn<PaymentRecord>[]>(
    () => [
      { header: "Payment provider", accessor: "provider" },
      { header: "Payment status", accessor: (payment) => <StatusBadge status={payment.status} /> },
      { header: "Amount", accessor: (payment) => `${payment.currency} ${payment.amountUsd}` },
      { header: "Paid date", accessor: (payment) => formatDate(payment.paidAt) },
      { header: "Subscription plan", accessor: (payment) => getSubscriptionPlan(payment.planId).name },
      { header: "Tenant", accessor: "tenantId" }
    ],
    []
  );

  return (
    <>
      <PageHeader title="Payments" description="Review mock payment records for customer onboarding and subscriptions." />
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">MVP Provider</CardTitle>
          <CreditCard className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-[var(--color-text-main)]">MOCK</div>
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        data={paymentsQuery.data ?? []}
        getRowKey={(payment) => payment.id}
        isLoading={paymentsQuery.isLoading}
        emptyTitle="No payments yet"
        emptyDescription="Mock payment records appear here after customers complete onboarding checkout."
      />
    </>
  );
}
