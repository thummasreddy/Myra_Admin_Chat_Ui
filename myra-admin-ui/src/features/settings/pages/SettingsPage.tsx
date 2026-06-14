import { AlertTriangle, Bot, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";

export function SettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform defaults, safety instructions, abuse prevention, supported business categories, and platform-wide AI behavior rules."
      />

      <section className="mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Global settings can affect every tenant. Every critical change requires confirmation and a backend audit log.
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>Default widget settings</CardTitle>
            </div>
            <CardDescription>Defaults used before a tenant customizes appearance in tenant admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Global fallback message</Label>
              <Textarea defaultValue="Myra is temporarily unavailable. Please try again shortly." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Default brand color</Label>
                <Input defaultValue="#2563EB" />
              </div>
              <div className="space-y-2">
                <Label>Default widget position</Label>
                <Input defaultValue="bottom-right" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Safety and abuse prevention</CardTitle>
            </div>
            <CardDescription>Platform-wide safety guardrails and abuse rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Rate limit public config endpoint", "Block direct tenant_id browser access", "Require backend permission checks", "Enable unsafe content alerts"].map((label) => (
              <label key={label} className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium">
                <Checkbox defaultChecked />
                {label}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <CardTitle>Tenant defaults and categories</CardTitle>
            </div>
            <CardDescription>Default tenant features and supported business categories.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Supported business categories</Label>
              <Textarea defaultValue={"Restaurant\nRetail\nHealthcare\nFitness\nAgriculture\nProfessional Services"} />
            </div>
            <div className="space-y-3">
              {["lead_capture_enabled", "qr_enabled", "knowledge_upload_enabled", "analytics_enabled", "embed_enabled", "purchase_tracking_enabled"].map((label) => (
                <label key={label} className="flex items-center gap-2 rounded-md border p-3 text-sm font-medium">
                  <Checkbox defaultChecked />
                  {label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setConfirmOpen(true)}>Save global settings</Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Save global settings?"
        description="This dangerous platform-wide change requires confirmation before a backend permission-checked API call."
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast({ title: "Global settings submitted", description: "Backend permission check and audit log required.", variant: "success" });
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
