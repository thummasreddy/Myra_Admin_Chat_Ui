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
    <article className={cn("rounded-xl border border-[#1f2937] bg-[#1a2235] p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-blue-400">{label}</p>
        <Icon className="h-5 w-5 text-blue-400" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-normal text-white">{formattedValue}</p>
    </article>
  );
}
