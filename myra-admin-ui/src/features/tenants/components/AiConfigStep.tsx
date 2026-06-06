import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TenantWizardFormValues } from "@/features/tenants/tenant.schema";

function FieldError({ name }: { name: keyof TenantWizardFormValues }) {
  const { formState } = useFormContext<TenantWizardFormValues>();
  const message = formState.errors[name]?.message;
  return message ? <p className="text-sm text-destructive">{String(message)}</p> : null;
}

export function AiConfigStep() {
  const { register } = useFormContext<TenantWizardFormValues>();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System prompt</Label>
        <Textarea id="systemPrompt" className="min-h-32" {...register("systemPrompt")} />
        <FieldError name="systemPrompt" />
      </div>

      <div className="form-grid">
        <div className="space-y-2">
          <Label htmlFor="responseStyle">Response style</Label>
          <Select id="responseStyle" {...register("responseStyle")}>
            <option value="PROFESSIONAL">Professional</option>
            <option value="FRIENDLY">Friendly</option>
            <option value="CASUAL">Casual</option>
            <option value="FORMAL">Formal</option>
          </Select>
          <FieldError name="responseStyle" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fallbackMessage">Fallback message</Label>
          <Textarea id="fallbackMessage" {...register("fallbackMessage")} />
          <FieldError name="fallbackMessage" />
        </div>
      </div>

      <div className="form-grid">
        <div className="space-y-2">
          <Label htmlFor="allowedTopics">Allowed topics</Label>
          <Textarea id="allowedTopics" placeholder="career, projects, technology" {...register("allowedTopics")} />
          <FieldError name="allowedTopics" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blockedTopics">Blocked topics</Label>
          <Textarea id="blockedTopics" placeholder="medical, legal" {...register("blockedTopics")} />
          <FieldError name="blockedTopics" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="suggestedPrompts">Suggested prompts</Label>
        <Textarea id="suggestedPrompts" placeholder="One prompt per line" {...register("suggestedPrompts")} />
        <FieldError name="suggestedPrompts" />
      </div>
    </div>
  );
}
