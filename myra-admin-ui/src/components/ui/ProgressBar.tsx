import { cn } from "@/lib/utils";

export function ProgressBar({ value, max, color }: { value: number; max: number; color: "blue" | "green" }) {
  const width = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#0d1117]" aria-hidden="true">
      <div className={cn("h-full rounded-full", color === "blue" ? "bg-[#001B5A]" : "bg-[#22c55e]")} style={{ width: `${width}%` }} />
    </div>
  );
}
