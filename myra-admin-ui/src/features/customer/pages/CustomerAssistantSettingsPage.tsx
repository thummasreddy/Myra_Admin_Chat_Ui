import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { updateTenant } from "@/features/tenants/tenant.api";
import { useCustomerTenant } from "@/features/customer/customer.hooks";

const settingsSchema = z.object({
  assistantName: z.string().min(2, "Assistant name is required"),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #1591DC"),
  businessDescription: z.string().min(30, "Business description should be at least 30 characters"),
  fallbackMessage: z.string().min(10, "Fallback message is required")
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function CustomerAssistantSettingsPage() {
  const { tenantId, tenantQuery } = useCustomerTenant();
  const queryClient = useQueryClient();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      assistantName: "Myra",
      brandColor: "#1591DC",
      businessDescription: "",
      fallbackMessage: "I do not have that answer yet. Please contact our team."
    }
  });

  useEffect(() => {
    if (tenantQuery.data) {
      form.reset({
        assistantName: tenantQuery.data.assistantName,
        brandColor: tenantQuery.data.brandColor,
        businessDescription: tenantQuery.data.businessDescription ?? "",
        fallbackMessage: tenantQuery.data.fallbackMessage
      });
    }
  }, [form, tenantQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: SettingsFormValues) => updateTenant(tenantId, values),
    onSuccess: (tenant) => {
      queryClient.setQueryData(["tenant", tenantId], tenant);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast({ title: "Assistant settings saved", variant: "success" });
    },
    onError: () => toast({ title: "Settings were not saved", variant: "error" })
  });

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading assistant settings" />;

  return (
    <>
      <PageHeader
        title="Assistant Settings"
        description="Update customer-facing assistant details. Major activation changes may still require admin review."
      />

      <Card>
        <CardHeader>
          <CardTitle>Brand and Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
            <div className="form-grid">
              <div className="space-y-2">
                <Label htmlFor="assistantName">Assistant name</Label>
                <Input id="assistantName" {...form.register("assistantName")} />
                {form.formState.errors.assistantName ? (
                  <p className="text-sm text-red-600">{form.formState.errors.assistantName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandColor">Brand color</Label>
                <Input id="brandColor" type="color" className="h-10 w-16 p-1" {...form.register("brandColor")} />
                {form.formState.errors.brandColor ? <p className="text-sm text-red-600">{form.formState.errors.brandColor.message}</p> : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business description</Label>
              <Textarea id="businessDescription" className="min-h-28" {...form.register("businessDescription")} />
              {form.formState.errors.businessDescription ? (
                <p className="text-sm text-red-600">{form.formState.errors.businessDescription.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fallbackMessage">Fallback message</Label>
              <Textarea id="fallbackMessage" {...form.register("fallbackMessage")} />
              {form.formState.errors.fallbackMessage ? (
                <p className="text-sm text-red-600">{form.formState.errors.fallbackMessage.message}</p>
              ) : null}
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
