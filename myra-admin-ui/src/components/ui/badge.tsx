import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-secondary/20 bg-secondary/10 text-secondary",
        secondary: "border-accent/20 bg-accent/10 text-accent",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        outline: "text-foreground",
        success: "border-emerald-400/30 bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning: "border-amber-400/30 bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        muted: "border-border bg-[var(--color-bg-muted)] text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
