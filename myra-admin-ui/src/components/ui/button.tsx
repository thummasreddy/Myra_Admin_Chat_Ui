import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[linear-gradient(135deg,#14B8A6,#8B5CF6)] text-white shadow-[0_12px_28px_rgba(20,184,166,0.24)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(139,92,246,0.28)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-600 focus-visible:ring-red-500",
        outline: "border border-input bg-white text-primary hover:border-secondary/50 hover:bg-slate-50",
        secondary: "border border-input bg-white text-primary hover:border-secondary/50 hover:bg-slate-50",
        ghost: "shadow-none hover:bg-slate-100 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
