import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
