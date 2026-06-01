import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInput = Omit<ToastItem, "id">;

let toasts: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function toast(input: ToastInput) {
  const id = crypto.randomUUID();
  toasts = [{ id, ...input }, ...toasts].slice(0, 4);
  emit();
  window.setTimeout(() => dismissToast(id), 4500);
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

function subscribe(listener: (items: ToastItem[]) => void) {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>(toasts);

  React.useEffect(() => subscribe(setItems), []);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-lg border bg-white p-4 shadow-lg",
            item.variant === "success" && "border-emerald-200",
            item.variant === "error" && "border-red-200",
            item.variant === "info" && "border-primary/20"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-950">{item.title}</p>
              {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dismissToast(item.id)} aria-label="Dismiss toast">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
