import { cn } from "@/lib/utils";

export type DashboardStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" | "SUSPENDED" | "DEGRADED" | "DOWN";

const badgeStyles: Record<DashboardStatus, string> = {
  ACTIVE: "bg-[#166534] text-[#4ade80]",
  INACTIVE: "bg-[#374151] text-[#9ca3af]",
  PENDING_APPROVAL: "bg-[#78350f] text-[#fbbf24]",
  SUSPENDED: "bg-red-950/80 text-red-300",
  DEGRADED: "bg-[#78350f] text-[#fbbf24]",
  DOWN: "bg-red-950/80 text-red-300"
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
