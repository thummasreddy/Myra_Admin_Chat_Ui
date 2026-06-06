import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { canUpdateDocumentStatus } from "@/features/admin/admin.permissions";
import { useAuthStore } from "@/features/auth/auth.store";
import { listKnowledgeSources, updateKnowledgeSourceStatus } from "@/features/knowledge/knowledge.api";
import type { KnowledgeSource, KnowledgeStatus } from "@/features/knowledge/knowledge.types";
import { documentReviewMessage } from "@/features/onboarding/onboarding.api";
import { formatDate } from "@/lib/utils";

export function KnowledgeDocumentsReviewPage() {
  const [rejectSource, setRejectSource] = useState<KnowledgeSource | null>(null);
  const [notes, setNotes] = useState("");
  const user = useAuthStore((state) => state.user);
  const canUpdate = canUpdateDocumentStatus(user);
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({ queryKey: ["knowledge-documents-review"], queryFn: () => listKnowledgeSources() });

  const statusMutation = useMutation({
    mutationFn: ({ sourceId, status, reviewNotes }: { sourceId: string; status: KnowledgeStatus; reviewNotes?: string }) =>
      updateKnowledgeSourceStatus(sourceId, { status, reviewNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents-review"] });
      setRejectSource(null);
      setNotes("");
      toast({ title: "Document status updated", variant: "success" });
    },
    onError: () => toast({ title: "Document update failed", variant: "error" })
  });

  const columns = useMemo<DataTableColumn<KnowledgeSource>[]>(
    () => [
      { header: "File name", accessor: "name" },
      { header: "File type", accessor: "type" },
      { header: "Upload date", accessor: (source) => formatDate(source.createdAt) },
      { header: "Status", accessor: (source) => <StatusBadge status={source.status} /> },
      { header: "Review notes", accessor: (source) => source.reviewNotes || "No notes" },
      { header: "Uploaded by", accessor: (source) => source.uploadedBy || "Tenant Owner" },
      {
        header: "Actions",
        className: "min-w-80",
        accessor: (source) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" disabled={!canUpdate} onClick={() => statusMutation.mutate({ sourceId: source.id, status: "UNDER_REVIEW" })}>
              UNDER_REVIEW
            </Button>
            <Button variant="outline" size="sm" disabled={!canUpdate} onClick={() => statusMutation.mutate({ sourceId: source.id, status: "PROCESSING" })}>
              PROCESSING
            </Button>
            <Button size="sm" disabled={!canUpdate} onClick={() => statusMutation.mutate({ sourceId: source.id, status: "READY" })}>
              <FileCheck2 className="h-4 w-4" />
              READY
            </Button>
            <Button variant="destructive" size="sm" disabled={!canUpdate} onClick={() => setRejectSource(source)}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )
      }
    ],
    [canUpdate, statusMutation]
  );

  return (
    <>
      <PageHeader title="Knowledge Documents" description="Review uploaded documents, processing status, notes, and submitter details." />
      <Card className="mb-4">
        <CardContent className="p-4 text-sm font-medium text-[var(--color-warning)]">
          Customer has been informed that {documentReviewMessage.toLowerCase()}
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        data={documentsQuery.data ?? []}
        getRowKey={(source) => source.id}
        isLoading={documentsQuery.isLoading}
        emptyTitle="No uploaded documents"
        emptyDescription="Customer uploads from the dashboard appear here for support review."
      />

      {rejectSource ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-[var(--color-bg-card)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Reject document</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add review notes for {rejectSource.name}.</p>
            <Textarea className="mt-4 min-h-28" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectSource(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={notes.trim().length < 3 || statusMutation.isPending}
                onClick={() => statusMutation.mutate({ sourceId: rejectSource.id, status: "REJECTED", reviewNotes: notes })}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
