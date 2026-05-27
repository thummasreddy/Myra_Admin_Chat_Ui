import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TenantWizardFormValues } from "@/features/tenants/tenant.schema";

function FieldError({ name }: { name: keyof TenantWizardFormValues }) {
  const { formState } = useFormContext<TenantWizardFormValues>();
  const message = formState.errors[name]?.message;
  return message ? <p className="text-sm text-red-600">{String(message)}</p> : null;
}

export function BrandingStep() {
  const { register, watch } = useFormContext<TenantWizardFormValues>();
  const brandColor = watch("brandColor");

  return (
    <div className="space-y-5">
      <div className="form-grid">
        <div className="space-y-2">
          <Label htmlFor="assistantName">Assistant name</Label>
          <Input id="assistantName" {...register("assistantName")} />
          <FieldError name="assistantName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chatPosition">Chat position</Label>
          <Select id="chatPosition" {...register("chatPosition")}>
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
          </Select>
          <FieldError name="chatPosition" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assistantIntro">Assistant intro</Label>
        <Textarea id="assistantIntro" {...register("assistantIntro")} />
        <FieldError name="assistantIntro" />
      </div>

      <div className="form-grid">
        <div className="space-y-2">
          <Label htmlFor="brandColor">Brand color</Label>
          <div className="flex gap-2">
            <Input id="brandColor" {...register("brandColor")} />
            <div className="h-10 w-12 rounded-md border" style={{ backgroundColor: brandColor }} />
          </div>
          <FieldError name="brandColor" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
          <FieldError name="logoUrl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" placeholder="https://..." {...register("avatarUrl")} />
          <FieldError name="avatarUrl" />
        </div>
      </div>
    </div>
  );
}
