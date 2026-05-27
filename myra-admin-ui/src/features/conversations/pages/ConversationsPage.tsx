import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { listConversations, type ChatSession } from "@/features/conversations/conversation.api";
import { listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { cn, formatDate } from "@/lib/utils";

export function ConversationsPage() {
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const setSelectedTenantId = useAuthStore((state) => state.setSelectedTenantId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const tenantsQuery = useQuery({ queryKey: ["tenants", "conversations"], queryFn: () => listTenants() });
  const sessionsQuery = useQuery({
    queryKey: ["conversations", selectedTenantId],
    queryFn: () => listConversations(selectedTenantId ?? undefined)
  });

  useEffect(() => {
    if (sessionsQuery.data?.length && !sessionsQuery.data.some((session) => session.id === selectedSessionId)) {
      setSelectedSessionId(sessionsQuery.data[0].id);
    }
  }, [selectedSessionId, sessionsQuery.data]);

  const selectedSession = useMemo(
    () => sessionsQuery.data?.find((session) => session.id === selectedSessionId) ?? sessionsQuery.data?.[0],
    [selectedSessionId, sessionsQuery.data]
  );

  return (
    <>
      <PageHeader
        title="Conversations"
        description="Review chat sessions, confidence scores, and fallback responses."
        actions={
          <Select value={selectedTenantId ?? ""} onChange={(event) => setSelectedTenantId(event.target.value || null)} className="w-64">
            <option value="">All tenants</option>
            {tenantsQuery.data?.map((tenant) => (
              <option key={tenant.tenantId} value={tenant.tenantId}>
                {tenant.tenantName}
              </option>
            ))}
          </Select>
        }
      />

      {sessionsQuery.isLoading ? (
        <LoadingSpinner label="Loading conversations" />
      ) : !sessionsQuery.data?.length ? (
        <EmptyState title="No conversations" description="Chat sessions will appear once visitors interact with the widget." />
      ) : (
        <div className="grid min-h-[620px] gap-4 lg:grid-cols-[360px_1fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {sessionsQuery.data.map((session) => (
                <SessionButton
                  key={session.id}
                  session={session}
                  selected={selectedSession?.id === session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{selectedSession?.visitorName}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSession?.tenantName} - {formatDate(selectedSession?.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Confidence {Math.round((selectedSession?.confidence ?? 0) * 100)}%</Badge>
                  {(selectedSession?.fallbackCount ?? 0) > 0 ? <Badge variant="warning">Fallbacks {selectedSession?.fallbackCount}</Badge> : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 bg-slate-50 p-4">
              {selectedSession?.messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[82%] rounded-lg px-4 py-3 text-sm shadow-sm",
                      message.role === "user" ? "bg-blue-600 text-white" : "border bg-white text-slate-800"
                    )}
                  >
                    <p>{message.content}</p>
                    <div className={cn("mt-2 flex items-center gap-2 text-xs", message.role === "user" ? "text-blue-100" : "text-muted-foreground")}>
                      {message.confidence !== undefined ? <span>{Math.round(message.confidence * 100)}% confidence</span> : null}
                      {message.fallback ? (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          fallback
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function SessionButton({ session, selected, onClick }: { session: ChatSession; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("w-full rounded-md border p-3 text-left transition-colors", selected ? "border-blue-300 bg-blue-50" : "bg-white hover:bg-slate-50")}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-950">{session.visitorName}</p>
          <p className="text-sm text-muted-foreground">{session.tenantName}</p>
        </div>
        <MessageSquare className="h-4 w-4 text-blue-600" />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(session.createdAt)}</span>
        <span>{Math.round(session.confidence * 100)}%</span>
      </div>
    </button>
  );
}
