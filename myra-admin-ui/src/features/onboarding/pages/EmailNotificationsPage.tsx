import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { listNotificationEvents } from "@/features/onboarding/onboarding.api";
import { emailTemplates } from "@/features/onboarding/onboarding.copy";
import type { NotificationEvent } from "@/features/onboarding/onboarding.types";
import { formatDate } from "@/lib/utils";

export function EmailNotificationsPage() {
  const notificationsQuery = useQuery({ queryKey: ["admin-email-notifications"], queryFn: () => listNotificationEvents() });

  const columns = useMemo<DataTableColumn<NotificationEvent>[]>(
    () => [
      { header: "Type", accessor: "type" },
      {
        header: "Email content",
        accessor: (event) => (
          <div>
            <p className="font-medium text-slate-950">{event.subject}</p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{event.body ?? emailTemplates[event.type].body}</p>
          </div>
        )
      },
      { header: "Recipient", accessor: "recipient" },
      { header: "Status", accessor: (event) => <StatusBadge status={event.status} /> },
      { header: "Created", accessor: (event) => formatDate(event.createdAt) },
      { header: "Send at", accessor: (event) => (event.sendAt ? formatDate(event.sendAt) : "Immediate") }
    ],
    []
  );

  return (
    <>
      <PageHeader title="Email Notifications" description="Audit onboarding, payment, approval, embed, document, and renewal email events." />
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">MVP behavior</CardTitle>
          <Mail className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Email failures are logged by notification-service and should not block the main onboarding flow. Templates explain
          registration, payment, approval, document processing, embed code readiness, and renewal reminders.
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        data={notificationsQuery.data ?? []}
        getRowKey={(event) => event.id}
        isLoading={notificationsQuery.isLoading}
        emptyTitle="No email events"
        emptyDescription="Registration and payment events will appear after the public onboarding flow runs."
      />
    </>
  );
}
