import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentUpload } from "@/features/knowledge/components/DocumentUpload";
import { FaqEditor } from "@/features/knowledge/components/FaqEditor";
import { addFaq, deleteKnowledgeSource, listKnowledgeSources, uploadKnowledgeDocument } from "@/features/knowledge/knowledge.api";
import type { KnowledgeSource } from "@/features/knowledge/knowledge.types";
import { listTenants } from "@/features/tenants/tenant.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { formatDate } from "@/lib/utils";

export function KnowledgeBasePage() {
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const setSelectedTenantId = useAuthStore((state) => state.setSelectedTenantId);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const tenantsQuery = useQuery({ queryKey: ["tenants", "knowledge"], queryFn: () => listTenants() });
  const tenantId = selectedTenantId || tenantsQuery.data?.[0]?.tenantId || "";

  const knowledgeQuery = useQuery({
    queryKey: ["knowledge", tenantId],
    queryFn: () => listKnowledgeSources(tenantId),
    enabled: Boolean(tenantId)
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadKnowledgeDocument(tenantId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      toast({ title: "Upload queued", description: "The source is pending processing.", variant: "success" });
    },
    onError: () => toast({ title: "Upload failed", variant: "error" })
  });

  const faqMutation = useMutation({
    mutationFn: (values: { question: string; answer: string }) => addFaq({ tenantId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      toast({ title: "FAQ added", variant: "success" });
    },
    onError: () => toast({ title: "FAQ was not added", variant: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", tenantId] });
      setDeleteId(null);
      toast({ title: "Knowledge source deleted", variant: "success" });
    }
  });

  const columns = useMemo<DataTableColumn<KnowledgeSource>[]>(
    () => [
      {
        header: "Source",
        accessor: (source) => (
          <div>
            <p className="font-medium text-slate-950">{source.name}</p>
            <p className="text-sm text-muted-foreground">{source.type} {source.size ? `- ${source.size}` : ""}</p>
          </div>
        )
      },
      { header: "Status", accessor: (source) => <StatusBadge status={source.status} /> },
      { header: "Created", accessor: (source) => formatDate(source.createdAt) },
      {
        header: "Actions",
        className: "text-right",
        accessor: (source) => (
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(source.id)} aria-label={`Delete ${source.name}`}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        )
      }
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        description="Upload business knowledge and add manual FAQs for tenant-specific retrieval."
        actions={
          <Select value={tenantId} onChange={(event) => setSelectedTenantId(event.target.value)} className="w-64">
            {tenantsQuery.data?.map((tenant) => (
              <option key={tenant.tenantId} value={tenant.tenantId}>
                {tenant.tenantName}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <DocumentUpload disabled={!tenantId || uploadMutation.isPending} onUpload={(file) => uploadMutation.mutate(file)} />
          <FaqEditor disabled={!tenantId || faqMutation.isPending} onSubmit={(values) => faqMutation.mutate(values)} />
        </div>
        <DataTable
          columns={columns}
          data={knowledgeQuery.data ?? []}
          getRowKey={(source) => source.id}
          isLoading={knowledgeQuery.isLoading}
          emptyTitle="No knowledge sources"
          emptyDescription="Upload documents or create FAQs to teach Myra about this tenant."
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete knowledge source?"
        description="This removes the source from the tenant knowledge base."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
