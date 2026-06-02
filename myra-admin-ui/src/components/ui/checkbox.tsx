import * as React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("h-4 w-4 rounded border-slate-300 text-secondary focus:ring-secondary", className)}
      {...props}
      type="checkbox"
    />
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
