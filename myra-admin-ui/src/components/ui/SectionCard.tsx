import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-[#0A2A6B] bg-[#001B5A] p-5 shadow-sm", className)}>
      <h2 className="text-lg font-semibold text-[#D8B06A]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
