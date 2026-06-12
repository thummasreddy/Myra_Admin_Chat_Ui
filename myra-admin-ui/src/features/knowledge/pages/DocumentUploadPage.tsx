import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  ErrorBanner,
  KnowledgeStatusBadge,
  ModalShell,
  PaginationControls,
  TenantSelect,
  formatEnumLabel,
  formatFileSize,
  useKnowledgeTenant
} from "@/features/knowledge/knowledge.ui";
import {
  deleteUploadedDocument,
  getUploadedDocument,
  listUploadedDocuments,
  uploadDocument
} from "@/features/knowledge/knowledge.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { cn, formatDate } from "@/lib/utils";

const acceptedExtensions = [".pdf", ".docx", ".txt", ".csv", ".md"];

export function DocumentUploadPage() {
  const { tenantId, tenants, tenantsLoading, setSelectedTenantId } = useKnowledgeTenant();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewUploadId, setViewUploadId] = useState<string | null>(null);
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);

  const documentsQuery = useQuery({
    queryKey: ["knowledge-review", "documents", tenantId, page, 10],
    queryFn: () => listUploadedDocuments(tenantId, page, 10),
    enabled: Boolean(tenantId),
    refetchInterval: (query) => (query.state.data?.items.some((document) => document.extraction_status === "EXTRACTING") ? 5000 : false)
  });

  const documentDetailQuery = useQuery({
    queryKey: ["knowledge-review", "document-detail", tenantId, viewUploadId],
    queryFn: () => getUploadedDocument(viewUploadId ?? "", tenantId),
    enabled: Boolean(tenantId && viewUploadId)
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(tenantId, file, user?.id, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "documents", tenantId] });
      setSelectedFile(null);
      setUploadProgress(100);
      window.setTimeout(() => setUploadProgress(0), 800);
      toast({ title: "Document uploaded", description: "Extraction has been queued.", variant: "success" });
    },
    onError: () => {
      setUploadProgress(0);
      toast({ title: "Document upload failed", variant: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (uploadId: string) => deleteUploadedDocument(uploadId, tenantId),
    onSuccess: () => {
      setDeleteUploadId(null);
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "documents", tenantId] });
      toast({ title: "Document deleted", variant: "success" });
    },
    onError: () => toast({ title: "Document could not be deleted", variant: "error" })
  });

  function chooseFile(file?: File) {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const isAccepted = acceptedExtensions.some((extension) => lowerName.endsWith(extension));
    if (!isAccepted) {
      toast({ title: "Unsupported file type", description: "Upload PDF, DOCX, TXT, CSV, or MD files.", variant: "error" });
      return;
    }
    setSelectedFile(file);
    setUploadProgress(0);
  }

  const selectedDocument = documentDetailQuery.data;
  const documents = documentsQuery.data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Document Upload"
        description="Upload tenant documents, monitor extraction, and inspect extracted text."
        actions={<TenantSelect tenantId={tenantId} tenants={tenants} loading={tenantsLoading} onChange={setSelectedTenantId} />}
      />

      {!tenantId && !tenantsLoading ? <div className="mb-4"><ErrorBanner title="No tenant selected" /></div> : null}
      {documentsQuery.error ? <div className="mb-4"><ErrorBanner error={documentsQuery.error} /></div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload Area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              className={cn(
                "flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-[var(--color-bg-muted)] p-6 text-center transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-input hover:border-primary/60"
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                chooseFile(event.dataTransfer.files[0]);
              }}
            >
              <input
                type="file"
                accept={acceptedExtensions.join(",")}
                className="sr-only"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
              <div className="mb-4 rounded-md bg-primary/10 p-3 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="font-medium text-[var(--color-text-main)]">Drop a document here or browse</p>
              <p className="mt-2 text-sm text-muted-foreground">PDF, DOCX, TXT, CSV, and Markdown files are accepted.</p>
            </label>

            {selectedFile ? (
              <div className="rounded-md border bg-[var(--color-bg-muted)] p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--color-text-main)]">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)} - {selectedFile.type || "Unknown type"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {uploadMutation.isPending || uploadProgress > 0 ? (
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Upload progress</span>
                  <span className="font-medium text-[var(--color-text-main)]">{uploadProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-muted)]">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}

            <Button type="button" disabled={!tenantId || !selectedFile || uploadMutation.isPending} onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}>
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload Document
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents Table</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {documentsQuery.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : documents.length ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Extraction Status</TableHead>
                      <TableHead>Uploaded At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) => (
                      <TableRow key={document.upload_id}>
                        <TableCell className="max-w-[240px] truncate font-medium">{document.original_file_name}</TableCell>
                        <TableCell>{document.file_type}</TableCell>
                        <TableCell>{formatFileSize(document.file_size)}</TableCell>
                        <TableCell>{document.document_type ?? "Pending"}</TableCell>
                        <TableCell>
                          <KnowledgeStatusBadge status={document.extraction_status} />
                        </TableCell>
                        <TableCell>{formatDate(document.uploaded_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setViewUploadId(document.upload_id)}>
                              <Eye className="h-4 w-4" />
                              View Extracted Text
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteUploadId(document.upload_id)} aria-label={`Delete ${document.original_file_name}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <PaginationControls page={page} total={documentsQuery.data?.total ?? documents.length} size={10} onPageChange={setPage} />
              </>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">No documents have been uploaded for this tenant.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <ModalShell
        open={Boolean(viewUploadId)}
        title={selectedDocument?.original_file_name ?? "Extracted Text"}
        description={selectedDocument ? formatEnumLabel(selectedDocument.extraction_status) : undefined}
        onClose={() => setViewUploadId(null)}
      >
        {documentDetailQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-10/12" />
          </div>
        ) : documentDetailQuery.error ? (
          <ErrorBanner error={documentDetailQuery.error} />
        ) : (
          <pre className="whitespace-pre-wrap break-words rounded-md border bg-[var(--color-bg-muted)] p-4 text-sm leading-6 text-[var(--color-text-main)]">
            {selectedDocument?.extracted_text || "No extracted text is available for this document yet."}
          </pre>
        )}
      </ModalShell>

      <ConfirmDialog
        open={Boolean(deleteUploadId)}
        title="Delete uploaded document?"
        description="This removes the document from the review workflow."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteUploadId(null)}
        onConfirm={() => deleteUploadId && deleteMutation.mutate(deleteUploadId)}
      />
    </>
  );
}
