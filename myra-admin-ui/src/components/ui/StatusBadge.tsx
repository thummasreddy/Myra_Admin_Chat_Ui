import { cn } from "@/lib/utils";

export type DashboardStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" | "SUSPENDED" | "DEGRADED" | "DOWN";

const badgeStyles: Record<DashboardStatus, string> = {
  ACTIVE: "bg-emerald-50 text-myra-success dark:bg-myra-success/15",
  INACTIVE: "bg-slate-100 text-slate-500 dark:bg-myra-muted dark:text-myra-text-secondary",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700 dark:bg-myra-warning/15 dark:text-myra-warning",
  SUSPENDED: "bg-red-50 text-myra-error dark:bg-myra-error/15",
  DEGRADED: "bg-amber-50 text-amber-700 dark:bg-myra-warning/15 dark:text-myra-warning",
  DOWN: "bg-red-50 text-myra-error dark:bg-myra-error/15"
};

const labels: Record<DashboardStatus, string> = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING_APPROVAL: "PENDING",
  SUSPENDED: "SUSPENDED",
  DEGRADED: "DEGRADED",
  DOWN: "DOWN"
};

export function StatusBadge({ status, className }: { status: DashboardStatus; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", badgeStyles[status], className)}>
      {labels[status]}
    </span>
  );
}
