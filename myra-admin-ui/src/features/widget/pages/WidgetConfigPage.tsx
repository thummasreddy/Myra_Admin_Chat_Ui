import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmbedCodeBox } from "@/features/widget/components/EmbedCodeBox";
import { WidgetPreview } from "@/features/widget/components/WidgetPreview";
import { getWidgetConfig, updateWidgetConfig } from "@/features/widget/widget.api";
import type { WidgetConfig } from "@/features/widget/widget.types";

const widgetSchema = z.object({
  tenantId: z.string(),
  assistantName: z.string().min(2),
  assistantIntro: z.string().min(10),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  chatPosition: z.enum(["bottom-right", "bottom-left"]),
  launcherLabel: z.string().min(2),
  welcomeMessage: z.string().min(10),
  enableLeadCapture: z.boolean(),
  enableSuggestedPrompts: z.boolean()
});

export function WidgetConfigPage() {
  const { tenantId = "" } = useParams();
  const queryClient = useQueryClient();
  const widgetQuery = useQuery({
    queryKey: ["widget-config", tenantId],
    queryFn: () => getWidgetConfig(tenantId),
    enabled: Boolean(tenantId)
  });

  const form = useForm<WidgetConfig>({
    resolver: zodResolver(widgetSchema),
    defaultValues: {
      tenantId,
      assistantName: "Myra",
      assistantIntro: "Hi, I am Myra, your AI assistant.",
      brandColor: "#2563EB",
      chatPosition: "bottom-right",
      launcherLabel: "Chat with Myra",
      welcomeMessage: "Hi, I am Myra. How can I help?",
      enableLeadCapture: true,
      enableSuggestedPrompts: true
    }
  });

  useEffect(() => {
    if (widgetQuery.data) form.reset(widgetQuery.data);
  }, [form, widgetQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: WidgetConfig) => updateWidgetConfig(tenantId, values),
    onSuccess: (config) => {
      queryClient.setQueryData(["widget-config", tenantId], config);
      toast({ title: "Widget config saved", variant: "success" });
    },
    onError: () => toast({ title: "Widget config was not saved", variant: "error" })
  });

  const previewConfig = form.watch();

  if (widgetQuery.isLoading) return <LoadingSpinner label="Loading widget config" />;
  if (!tenantId) return <PageHeader title="Widget Config" description="Select a tenant from the tenant list to configure its widget." />;

  return (
    <>
      <PageHeader title="Widget Config" description="Configure the Myra chat widget, preview it, and copy the production embed script." />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Behavior</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
                <input type="hidden" {...form.register("tenantId")} />
                <div className="space-y-2">
                  <Label>Assistant name</Label>
                  <Input {...form.register("assistantName")} />
                </div>
                <div className="space-y-2">
                  <Label>Assistant intro</Label>
                  <Textarea {...form.register("assistantIntro")} />
                </div>
                <div className="space-y-2">
                  <Label>Welcome message</Label>
                  <Textarea {...form.register("welcomeMessage")} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Brand color</Label>
                    <Input {...form.register("brandColor")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select {...form.register("chatPosition")}>
                      <option value="bottom-right">Bottom right</option>
                      <option value="bottom-left">Bottom left</option>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Launcher label</Label>
                  <Input {...form.register("launcherLabel")} />
                </div>
                <label className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium">
                  <Checkbox {...form.register("enableLeadCapture")} />
                  Enable lead capture
                </label>
                <label className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium">
                  <Checkbox {...form.register("enableSuggestedPrompts")} />
                  Enable suggested prompts
                </label>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Widget Config"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Script</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmbedCodeBox tenantId={tenantId} />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Install by placing this script before the closing body tag on the tenant website.</p>
                <p>Publish knowledge and activate the tenant before sending production traffic to the widget.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <WidgetPreview config={{ ...previewConfig, tenantId }} />
      </div>
    </>
  );
}
