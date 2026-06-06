import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ClipboardCheck, TestTube2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { testExtraction } from "@/features/tenants/tenant.api";
import type { TestExtractionResponse } from "@/features/tenants/tenant.types";

type TestExtractionPanelProps = {
  tenantId: string;
};

const sampleMessage = "I need to book a consultation tomorrow at 3pm. Please contact me at alex@example.com.";

export function TestExtractionPanel({ tenantId }: TestExtractionPanelProps) {
  const [message, setMessage] = useState(sampleMessage);
  const [result, setResult] = useState<TestExtractionResponse | null>(null);

  const extractionMutation = useMutation({
    mutationFn: () => testExtraction(tenantId, { message: message.trim() }),
    onSuccess: (response) => {
      setResult(response);
      toast({
        title: response.isMock ? "Mock extraction generated" : "Extraction test complete",
        variant: response.isMock ? "info" : "success"
      });
    },
    onError: () => {
      toast({ title: "Extraction test failed", variant: "error" });
    }
  });

  const canTest = Boolean(tenantId) && message.trim().length > 2 && !extractionMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Test Extraction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          className="min-h-28"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Paste a customer message to test intent and field extraction."
        />
        <Button type="button" className="w-full" disabled={!canTest} onClick={() => extractionMutation.mutate()}>
          <TestTube2 className="h-4 w-4" />
          {extractionMutation.isPending ? "Testing..." : "Test Extraction"}
        </Button>

        {result ? (
          <div className="space-y-3 rounded-md border bg-[var(--color-bg-muted)] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Intent</span>
              <Badge>{result.intent}</Badge>
              {result.isMock ? <Badge variant="warning">Fallback mock</Badge> : null}
            </div>

            <JsonResult label="Lead Data" value={result.leadData} />
            <JsonResult label="Order Data" value={result.orderData} />
            {result.appointmentData ? <JsonResult label="Appointment Data" value={result.appointmentData} /> : null}

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Missing Fields</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.missingFields.length ? (
                  result.missingFields.map((field) => (
                    <Badge key={field} variant="warning">
                      {field}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="success">None</Badge>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function JsonResult({ label, value }: { label: string; value: Record<string, unknown> }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <pre className="mt-2 max-h-40 overflow-auto rounded-md border bg-[var(--color-bg-card)] p-3 text-xs leading-5 text-[var(--color-text-secondary)]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
