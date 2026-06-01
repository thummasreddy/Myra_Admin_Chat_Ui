import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "muted" | "secondary"> = {
  ACTIVE: "success",
  APPROVED: "success",
  READY: "success",
  INACTIVE: "muted",
  PENDING: "warning",
  PENDING_PAYMENT: "warning",
  PENDING_ADMIN_APPROVAL: "warning",
  PAYMENT_PENDING: "warning",
  NOT_SUBMITTED: "muted",
  PENDING_REVIEW: "warning",
  UPLOADED: "warning",
  UNDER_REVIEW: "default",
  PROCESSING: "default",
  COMPLETED: "success",
  NOT_UPLOADED: "muted",
  PAID: "success",
  SUCCESS: "success",
  SENT: "success",
  QUEUED: "warning",
  SCHEDULED: "default",
  FAILED: "destructive",
  REJECTED: "destructive",
  CANCELED: "destructive"
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant[status] ?? "secondary"}>{status}</Badge>;
}
