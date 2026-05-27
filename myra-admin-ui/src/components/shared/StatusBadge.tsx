import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "muted" | "secondary"> = {
  ACTIVE: "success",
  READY: "success",
  INACTIVE: "muted",
  PENDING: "warning",
  PROCESSING: "secondary",
  FAILED: "destructive"
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant[status] ?? "secondary"}>{status}</Badge>;
}
