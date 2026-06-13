import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "muted" | "secondary"> = {
  DRAFT: "muted",
  ACTIVE: "success",
  NEW: "default",
  CONTACTED: "warning",
  QUALIFIED: "success",
  CLOSED: "muted",
  SPAM: "destructive",
  SUPER_ADMIN: "destructive",
  MYRA_SUPER_ADMIN: "destructive",
  MYRA_SUPPORT_ADMIN: "secondary",
  ADMIN: "default",
  VIEWER: "muted",
  APPROVED: "success",
  READY: "success",
  INACTIVE: "muted",
  PENDING: "warning",
  PENDING_PAYMENT: "warning",
  PAYMENT_COMPLETED: "default",
  PENDING_ADMIN_APPROVAL: "warning",
  PENDING_APPROVAL: "warning",
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
  SUSPENDED: "destructive",
  CANCELED: "destructive"
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant[status] ?? "secondary"}>{status}</Badge>;
}
