import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { LifeBuoy, Mail, Send } from "lucide-react";
import { sendTestChatMessage } from "@/api/chatApi";
import { submitTestLead } from "@/api/leadApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCustomerTenant } from "@/features/customer/customer.hooks";

export function CustomerSupportPage() {
  const { tenantId, tenantQuery } = useCustomerTenant();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("What services do you offer?");
  const [chatReply, setChatReply] = useState("");
  const [testLead, setTestLead] = useState({
    name: "Test Visitor",
    email: "test@example.com",
    phone: "+1 555 123 4567",
    message: "This is a test lead from the Admin UI."
  });

  const chatTestMutation = useMutation({
    mutationFn: () =>
      sendTestChatMessage({
        tenant_id: tenantId,
        session_id: `admin_test_${tenantId}`,
        message: chatMessage,
        source_url: window.location.href,
        metadata: { source: "admin_ui_test" }
      }),
    onSuccess: (response) => {
      setChatReply(response.reply);
      toast({ title: "Test chat response received", variant: "success" });
    },
    onError: (error) => {
      toast({
        title: "Test chat failed",
        description: error instanceof Error ? error.message : "The chat service did not return a reply.",
        variant: "error"
      });
    }
  });

  const leadTestMutation = useMutation({
    mutationFn: () =>
      submitTestLead({
        tenant_id: tenantId,
        session_id: `admin_test_${tenantId}`,
        ...testLead,
        source_url: window.location.href,
        metadata: { source: "admin_ui_test" }
      }),
    onSuccess: () => toast({ title: "Test lead submitted", variant: "success" }),
    onError: (error) => {
      toast({
        title: "Test lead failed",
        description: error instanceof Error ? error.message : "The lead service did not accept the test lead.",
        variant: "error"
      });
    }
  });

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
        title="Settings & Support"
        description="Manage account follow-up with the Myra team for onboarding, document processing, billing, or embed installation."
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
                <Textarea id="message" className="min-h-36" value={message} onChange={(event) => setMessage(event.target.value)} required />
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Test Assistant Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat-test-message">Message</Label>
              <Textarea
                id="chat-test-message"
                value={chatMessage}
                onChange={(event) => setChatMessage(event.target.value)}
                className="min-h-24"
              />
            </div>
            <Button
              type="button"
              disabled={!tenantId || !chatMessage.trim() || chatTestMutation.isPending}
              onClick={() => chatTestMutation.mutate()}
            >
              <Send className="h-4 w-4" />
              {chatTestMutation.isPending ? "Testing..." : "Send Test Message"}
            </Button>
            {chatReply ? <div className="rounded-md border bg-slate-50 p-3 text-sm leading-6 text-slate-700">{chatReply}</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Submit Test Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-grid">
              <div className="space-y-2">
                <Label htmlFor="test-lead-name">Name</Label>
                <Input
                  id="test-lead-name"
                  value={testLead.name}
                  onChange={(event) => setTestLead((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-lead-email">Email</Label>
                <Input
                  id="test-lead-email"
                  type="email"
                  value={testLead.email}
                  onChange={(event) => setTestLead((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-lead-phone">Phone</Label>
              <Input
                id="test-lead-phone"
                value={testLead.phone}
                onChange={(event) => setTestLead((current) => ({ ...current, phone: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-lead-message">Message</Label>
              <Textarea
                id="test-lead-message"
                value={testLead.message}
                onChange={(event) => setTestLead((current) => ({ ...current, message: event.target.value }))}
              />
            </div>
            <Button type="button" disabled={!tenantId || leadTestMutation.isPending} onClick={() => leadTestMutation.mutate()}>
              {leadTestMutation.isPending ? "Submitting..." : "Submit Test Lead"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
