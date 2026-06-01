import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const wizardSteps = [
  { id: 0, title: "Business Info" },
  { id: 1, title: "Branding" },
  { id: 2, title: "AI Configuration" },
  { id: 3, title: "Feature Toggles" },
  { id: 4, title: "Review & Publish" }
];

export function TenantWizardSteps({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {wizardSteps.map((step) => {
        const complete = step.id < currentStep;
        const active = step.id === currentStep;
        return (
          <div key={step.id} className={cn("rounded-md border bg-white p-3", active && "border-primary/30 bg-primary/10")}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  complete && "bg-primary text-white",
                  active && "bg-primary/10 text-primary",
                  !complete && !active && "bg-slate-100 text-slate-500"
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : step.id + 1}
              </div>
              <span className="text-sm font-medium text-slate-800">{step.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
