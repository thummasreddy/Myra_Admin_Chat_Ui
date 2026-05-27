import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TenantWizardFormValues } from "@/features/tenants/tenant.schema";

function FieldError({ name }: { name: keyof TenantWizardFormValues }) {
  const { formState } = useFormContext<TenantWizardFormValues>();
  const message = formState.errors[name]?.message;
  return message ? <p className="text-sm text-red-600">{String(message)}</p> : null;
}

export function BusinessInfoStep() {
  const { register } = useFormContext<TenantWizardFormValues>();

  return (
    <div className="form-grid">
      <div className="space-y-2">
        <Label htmlFor="tenantName">Tenant name</Label>
        <Input id="tenantName" {...register("tenantName")} />
        <FieldError name="tenantName" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input id="websiteUrl" {...register("websiteUrl")} />
        <FieldError name="websiteUrl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input id="industry" {...register("industry")} />
        <FieldError name="industry" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="supportEmail">Support email</Label>
        <Input id="supportEmail" type="email" {...register("supportEmail")} />
        <FieldError name="supportEmail" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register("country")} />
        <FieldError name="country" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Input id="timezone" placeholder="America/Phoenix" {...register("timezone")} />
        <FieldError name="timezone" />
      </div>
    </div>
  );
}
