import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  formatAsCurrency?: boolean;
  className?: string;
};

export function MetricCard({ label, value, icon: Icon, formatAsCurrency = false, className }: MetricCardProps) {
  const formattedValue =
    typeof value === "number"
      ? formatAsCurrency
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
        : value.toLocaleString()
      : value;

  return (
    <article className={cn("rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-primary">{label}</p>
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-normal text-foreground">{formattedValue}</p>
    </article>
  );
}
