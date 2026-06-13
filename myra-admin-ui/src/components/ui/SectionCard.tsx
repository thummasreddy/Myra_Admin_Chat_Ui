import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-[#1f2937] bg-[#1a2235] p-5 shadow-sm", className)}>
      <h2 className="text-lg font-semibold text-blue-400">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
