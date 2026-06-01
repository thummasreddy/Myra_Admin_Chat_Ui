import { useState, type FormEvent } from "react";
import { LifeBuoy, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCustomerTenant } from "@/features/customer/customer.hooks";

export function CustomerSupportPage() {
  const { tenantQuery } = useCustomerTenant();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function submitSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast({
      title: "Support request queued",
      description: "The MVP stores this as a frontend acknowledgement until notification-service is connected.",
      variant: "success"
    });
    setSubject("");
    setMessage("");
  }

  return (
    <>
      <PageHeader
        title="Contact Support"
        description="Reach the Myra support team about onboarding, document processing, billing, or embed installation."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Support Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitSupportRequest}>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  className="min-h-36"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
              </div>
              <Button type="submit">
                <Send className="h-4 w-4" />
                Send Request
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-primary" />
              Business Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{tenantQuery.data?.businessEmail ?? tenantQuery.data?.supportEmail ?? "No business email available"}</p>
            <p>Use this page for document review questions, approval status, embed code delivery, and billing support.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
