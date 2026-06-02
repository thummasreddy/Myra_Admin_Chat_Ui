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
        destructive: "border-red-200 bg-red-50 text-red-700",
        outline: "text-foreground",
        success: "border-green-200 bg-green-50 text-green-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        muted: "border-slate-200 bg-slate-100 text-slate-600"
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
