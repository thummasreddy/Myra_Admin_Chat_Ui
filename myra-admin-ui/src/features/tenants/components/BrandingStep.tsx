import { Controller, useFormContext } from "react-hook-form";
import { BrandColorField } from "@/components/shared/BrandColorPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TenantWizardFormValues } from "@/features/tenants/tenant.schema";
import { normalizeHexColor } from "@/lib/colors";

function FieldError({ name }: { name: keyof TenantWizardFormValues }) {
  const { formState } = useFormContext<TenantWizardFormValues>();
  const message = formState.errors[name]?.message;
  return message ? <p className="text-sm text-destructive">{String(message)}</p> : null;
}

export function BrandingStep() {
  const { control, register } = useFormContext<TenantWizardFormValues>();

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
          <Controller
            control={control}
            name="brandColor"
            render={({ field }) => (
              <BrandColorField id="brandColor" value={field.value} onChange={(color) => field.onChange(normalizeHexColor(color))} />
            )}
          />
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
