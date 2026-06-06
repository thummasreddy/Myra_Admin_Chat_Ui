import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TenantWizardFormValues } from "@/features/tenants/tenant.schema";

const toggles: { name: keyof TenantWizardFormValues; label: string; description: string }[] = [
  {
    name: "enableWebSearch",
    label: "Web search",
    description: "Allow Myra to use approved web search retrieval when knowledge is incomplete."
  },
  {
    name: "enableLeadCapture",
    label: "Lead capture",
    description: "Collect name, email, phone, and message details during qualified conversations."
  },
  {
    name: "enableSuggestedPrompts",
    label: "Suggested prompts",
    description: "Show starter questions in the widget."
  },
  {
    name: "enableAnalytics",
    label: "Analytics",
    description: "Track usage, failed responses, and lead conversion metrics."
  },
  {
    name: "enableHumanEscalation",
    label: "Human escalation",
    description: "Offer handoff to support email when the assistant cannot resolve a request."
  }
];

export function FeatureToggleStep() {
  const { register } = useFormContext<TenantWizardFormValues>();

  return (
    <div className="grid gap-3">
      {toggles.map((toggle) => (
        <label key={toggle.name} className="flex cursor-pointer gap-3 rounded-md border bg-[var(--color-bg-card)] p-4">
          <Checkbox {...register(toggle.name)} />
          <span>
            <Label className="cursor-pointer">{toggle.label}</Label>
            <span className="mt-1 block text-sm text-muted-foreground">{toggle.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
