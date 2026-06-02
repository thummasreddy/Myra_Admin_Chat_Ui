import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Globe, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentUpload } from "@/features/knowledge/components/DocumentUpload";
import {
  addWebsiteKnowledgeSource,
  deleteKnowledgeSource,
  listKnowledgeSources,
  updateKnowledgeSourceStatus,
  uploadKnowledgeDocument
} from "@/features/knowledge/knowledge.api";
import type { KnowledgeSource } from "@/features/knowledge/knowledge.types";
import { documentReviewMessage, updateTenantDocumentStatus } from "@/features/onboarding/onboarding.api";
import { customerDashboardMessages } from "@/features/onboarding/onboarding.copy";
import { useCustomerTenant } from "@/features/customer/customer.hooks";
import { formatDate } from "@/lib/utils";

export function CustomerKnowledgePage() {
  const { tenantId, tenantQuery } = useCustomerTenant();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const knowledgeQuery = useQuery({
    queryKey: ["knowledge", tenantId],
    queryFn: () => listKnowledgeSources(tenantId),
    enabled: Boolean(tenantId)
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadKnowledgeDocument(tenantId, file),
    onSuccess: async () => {
      await updateTenantDocumentStatus(tenantId, { status: "UPLOADED" });
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      toast({ title: "Upload queued", description: documentReviewMessage, variant: "success" });
    },
    onError: () => toast({ title: "Upload failed", variant: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      setDeleteId(null);
      toast({ title: "Knowledge source deleted", variant: "success" });
    }
  });

  const websiteMutation = useMutation({
    mutationFn: (websiteUrl: string) => addWebsiteKnowledgeSource(tenantId, websiteUrl),
    onSuccess: async () => {
      await updateTenantDocumentStatus(tenantId, { status: "UPLOADED" });
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      toast({ title: "Website source queued", description: documentReviewMessage, variant: "success" });
    },
    onError: () => toast({ title: "Website source was not added", variant: "error" })
  });

  const reprocessMutation = useMutation({
    mutationFn: (sourceId: string) => updateKnowledgeSourceStatus(sourceId, { status: "PROCESSING" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      toast({ title: "Document reprocessing queued", variant: "success" });
    }
  });

  const columns = useMemo<DataTableColumn<KnowledgeSource>[]>(
    () => [
      {
        header: "Source",
        accessor: (source) => (
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {source.type === "WEBSITE" ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium text-slate-950">{source.name}</p>
              <p className="text-sm text-muted-foreground">
                {source.type} {source.size ? `- ${source.size}` : ""}
              </p>
            </div>
          </div>
        )
      },
      { header: "Status", accessor: (source) => <StatusBadge status={source.status} /> },
      { header: "Created", accessor: (source) => formatDate(source.createdAt) },
      {
        header: "Actions",
        className: "text-right",
        accessor: (source) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => reprocessMutation.mutate(source.id)}
              disabled={reprocessMutation.isPending}
              aria-label={`Reprocess ${source.name}`}
            >
              <RefreshCw className="h-4 w-4 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(source.id)} aria-label={`Delete ${source.name}`}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      }
    ],
    [reprocessMutation]
  );

  if (tenantQuery.isLoading) return <LoadingSpinner label="Loading knowledge" />;

  return (
    <>
      <PageHeader
        title="Knowledge Documents"
        description={customerDashboardMessages.knowledgeUpload}
      />

      <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        {documentReviewMessage} Myra answers based on business-provided and approved knowledge.
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <DocumentUpload
          disabled={!tenantId || uploadMutation.isPending || websiteMutation.isPending}
          onUpload={(file) => uploadMutation.mutate(file)}
          onWebsiteUrl={(websiteUrl) => websiteMutation.mutate(websiteUrl)}
        />
        <DataTable
          columns={columns}
          data={knowledgeQuery.data ?? []}
          getRowKey={(source) => source.id}
          isLoading={knowledgeQuery.isLoading}
          emptyTitle="No knowledge sources"
          emptyDescription="Upload PDF, DOCX, TXT, or CSV files for admin review and processing."
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete knowledge source?"
        description="This removes the source from your business knowledge queue."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
