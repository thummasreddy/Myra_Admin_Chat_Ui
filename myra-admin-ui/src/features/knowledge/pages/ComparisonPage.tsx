import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, GitCompareArrows, Loader2, Play, Save } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  CountBadge,
  ErrorBanner,
  KnowledgeStatusBadge,
  ModalShell,
  PaginationControls,
  SeverityBadge,
  TenantSelect,
  differenceCategories,
  differenceSeverities,
  formatEnumLabel,
  resolutionStatuses,
  truncateText,
  useKnowledgeTenant
} from "@/features/knowledge/knowledge.ui";
import {
  getComparison,
  getDifferences,
  listComparisons,
  listScans,
  listUploadedDocuments,
  resolveDifference,
  startComparison
} from "@/features/knowledge/knowledge.api";
import type {
  DifferenceCategory,
  DifferenceResolutionPayload,
  DifferenceSeverity,
  KnowledgeDifference,
  ResolutionStatus
} from "@/features/knowledge/knowledge.types";
import { formatDate } from "@/lib/utils";

type ResolutionChoice = "WEBSITE" | "DOCUMENT" | "CUSTOM" | "NOT_APPLICABLE";

const completedScanStatuses = ["CRAWL_COMPLETED", "DRAFT_GENERATED", "TENANT_REVIEW_REQUIRED", "APPROVED_SOURCE_OF_TRUTH"];
const extractedDocumentStatuses = ["EXTRACTION_COMPLETED", "DRAFT_GENERATED", "TENANT_REVIEW_REQUIRED", "APPROVED_SOURCE_OF_TRUTH"];

export function ComparisonPage() {
  const { comparisonId: routeComparisonId } = useParams();
  const { tenantId, tenants, tenantsLoading, setSelectedTenantId } = useKnowledgeTenant();
  const queryClient = useQueryClient();
  const [selectedScanId, setSelectedScanId] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [activeComparisonId, setActiveComparisonId] = useState<string | null>(routeComparisonId ?? null);
  const [diffPage, setDiffPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [resolutionFilter, setResolutionFilter] = useState("ALL");
  const [expandedDifferenceId, setExpandedDifferenceId] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<KnowledgeDifference | null>(null);
  const [resolutionChoice, setResolutionChoice] = useState<ResolutionChoice>("WEBSITE");
  const [customValue, setCustomValue] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    if (routeComparisonId) setActiveComparisonId(routeComparisonId);
  }, [routeComparisonId]);

  const scansQuery = useQuery({
    queryKey: ["knowledge-review", "scans", tenantId, 1, 100],
    queryFn: () => listScans(tenantId, 1, 100),
    enabled: Boolean(tenantId)
  });
  const documentsQuery = useQuery({
    queryKey: ["knowledge-review", "documents", tenantId, 1, 100],
    queryFn: () => listUploadedDocuments(tenantId, 1, 100),
    enabled: Boolean(tenantId)
  });
  const comparisonsQuery = useQuery({
    queryKey: ["knowledge-review", "comparisons", tenantId, 1, 20],
    queryFn: () => listComparisons(tenantId, 1, 20),
    enabled: Boolean(tenantId),
    refetchInterval: (query) => (query.state.data?.items.some((comparison) => comparison.status === "RUNNING") ? 5000 : false)
  });

  const completedScans = useMemo(
    () => (scansQuery.data?.items ?? []).filter((scan) => completedScanStatuses.includes(scan.status)),
    [scansQuery.data?.items]
  );
  const extractedDocuments = useMemo(
    () => (documentsQuery.data?.items ?? []).filter((document) => extractedDocumentStatuses.includes(document.extraction_status)),
    [documentsQuery.data?.items]
  );

  useEffect(() => {
    if (!selectedScanId && completedScans[0]?.scan_id) setSelectedScanId(completedScans[0].scan_id);
  }, [completedScans, selectedScanId]);

  const effectiveComparisonId = routeComparisonId ?? activeComparisonId ?? comparisonsQuery.data?.items[0]?.comparison_id ?? "";
  const comparisonQuery = useQuery({
    queryKey: ["knowledge-review", "comparison", tenantId, effectiveComparisonId],
    queryFn: () => getComparison(effectiveComparisonId, tenantId),
    enabled: Boolean(tenantId && effectiveComparisonId),
    refetchInterval: (query) => (query.state.data?.status === "RUNNING" ? 5000 : false)
  });
  const activeComparison =
    comparisonQuery.data ?? comparisonsQuery.data?.items.find((comparison) => comparison.comparison_id === effectiveComparisonId) ?? comparisonsQuery.data?.items[0];

  const filters = {
    category: categoryFilter === "ALL" ? undefined : (categoryFilter as DifferenceCategory),
    severity: severityFilter === "ALL" ? undefined : (severityFilter as DifferenceSeverity),
    resolution_status: resolutionFilter === "ALL" ? undefined : (resolutionFilter as ResolutionStatus)
  };

  const differencesQuery = useQuery({
    queryKey: ["knowledge-review", "differences", tenantId, effectiveComparisonId, filters, diffPage],
    queryFn: () => getDifferences(effectiveComparisonId, tenantId, filters, diffPage, 10),
    enabled: Boolean(tenantId && effectiveComparisonId),
    refetchInterval: activeComparison?.status === "RUNNING" ? 5000 : false
  });

  const startComparisonMutation = useMutation({
    mutationFn: () => startComparison(tenantId, selectedScanId, selectedDocumentIds),
    onSuccess: (comparison) => {
      setActiveComparisonId(comparison.comparison_id);
      setDiffPage(1);
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "comparisons", tenantId] });
      toast({ title: "Comparison started", description: "The knowledge service is comparing sources.", variant: "success" });
    },
    onError: () => toast({ title: "Comparison could not be started", variant: "error" })
  });

  const resolveMutation = useMutation({
    mutationFn: ({ differenceId, payload }: { differenceId: string; payload: DifferenceResolutionPayload }) =>
      resolveDifference(effectiveComparisonId, differenceId, payload),
    onSuccess: () => {
      setResolveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "differences", tenantId, effectiveComparisonId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "comparison", tenantId, effectiveComparisonId] });
      toast({ title: "Difference resolved", variant: "success" });
    },
    onError: () => toast({ title: "Resolution could not be saved", variant: "error" })
  });

  function toggleDocument(documentId: string) {
    setSelectedDocumentIds((current) => (current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId]));
  }

  function openResolutionModal(difference: KnowledgeDifference) {
    setResolveTarget(difference);
    setResolutionChoice("WEBSITE");
    setCustomValue(difference.resolved_value ?? "");
    setResolutionNotes(difference.resolution_notes ?? "");
  }

  function saveResolution() {
    if (!resolveTarget) return;
    const payload = buildResolutionPayload(resolveTarget, resolutionChoice, customValue, resolutionNotes);
    resolveMutation.mutate({ differenceId: resolveTarget.difference_id, payload });
  }

  const differences = differencesQuery.data?.items ?? [];
  const canRunComparison = Boolean(tenantId && selectedScanId && selectedDocumentIds.length && !startComparisonMutation.isPending);
  const canSaveResolution =
    Boolean(resolveTarget) && (resolutionChoice !== "CUSTOM" || Boolean(customValue.trim())) && !resolveMutation.isPending;

  return (
    <>
      <PageHeader
        title="Comparison"
        description="Compare crawled website knowledge against extracted documents and resolve conflicts."
        actions={<TenantSelect tenantId={tenantId} tenants={tenants} loading={tenantsLoading} onChange={setSelectedTenantId} />}
      />

      {!tenantId && !tenantsLoading ? <div className="mb-4"><ErrorBanner title="No tenant selected" /></div> : null}
      {scansQuery.error || documentsQuery.error || comparisonsQuery.error ? (
        <div className="mb-4"><ErrorBanner error={scansQuery.error ?? documentsQuery.error ?? comparisonsQuery.error} /></div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scanId">Completed website scan</Label>
                <Select id="scanId" value={selectedScanId} onChange={(event) => setSelectedScanId(event.target.value)} disabled={!completedScans.length}>
                  {completedScans.length ? null : <option value="">No completed scans</option>}
                  {completedScans.map((scan) => (
                    <option key={scan.scan_id} value={scan.scan_id}>
                      {scan.website_url} - {formatDate(scan.completed_at ?? scan.created_at)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Extracted documents</Label>
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border bg-[var(--color-bg-muted)] p-3">
                  {extractedDocuments.length ? (
                    extractedDocuments.map((document) => (
                      <label key={document.upload_id} className="flex items-start gap-3 rounded-md border bg-[var(--color-bg-card)] p-3 text-sm">
                        <Checkbox checked={selectedDocumentIds.includes(document.upload_id)} onChange={() => toggleDocument(document.upload_id)} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[var(--color-text-main)]">{document.original_file_name}</span>
                          <span className="text-xs text-muted-foreground">{formatEnumLabel(document.extraction_status)}</span>
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No extracted documents are ready for comparison.</p>
                  )}
                </div>
              </div>

              <Button type="button" disabled={!canRunComparison} onClick={() => startComparisonMutation.mutate()}>
                {startComparisonMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run Comparison
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparison Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comparisonQuery.isLoading || comparisonsQuery.isLoading ? (
                <>
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : activeComparison ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Current status</span>
                    <KnowledgeStatusBadge status={activeComparison.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CountBadge label="Critical" value={activeComparison.critical_count} severity="CRITICAL" />
                    <CountBadge label="High" value={activeComparison.high_count} severity="HIGH" />
                    <CountBadge label="Medium" value={activeComparison.medium_count} severity="MEDIUM" />
                    <CountBadge label="Low" value={activeComparison.low_count} severity="LOW" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activeComparison.total_differences.toLocaleString()} differences found. Created {formatDate(activeComparison.created_at)}.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No comparison has been run for this tenant.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-primary" />
              <CardTitle>Differences Table</CardTitle>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <Select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setDiffPage(1); }}>
                <option value="ALL">All categories</option>
                {differenceCategories.map((category) => (
                  <option key={category} value={category}>
                    {formatEnumLabel(category)}
                  </option>
                ))}
              </Select>
              <Select value={severityFilter} onChange={(event) => { setSeverityFilter(event.target.value); setDiffPage(1); }}>
                <option value="ALL">All severities</option>
                {differenceSeverities.map((severity) => (
                  <option key={severity} value={severity}>
                    {formatEnumLabel(severity)}
                  </option>
                ))}
              </Select>
              <Select value={resolutionFilter} onChange={(event) => { setResolutionFilter(event.target.value); setDiffPage(1); }}>
                <option value="ALL">All resolution statuses</option>
                {resolutionStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </option>
                ))}
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {differencesQuery.error ? <div className="p-4"><ErrorBanner error={differencesQuery.error} /></div> : null}
            {differencesQuery.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : differences.length ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Website Value</TableHead>
                      <TableHead>Document Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {differences.map((difference) => {
                      const expanded = expandedDifferenceId === difference.difference_id;
                      return (
                        <Fragment key={difference.difference_id}>
                          <TableRow className="cursor-pointer" onClick={() => setExpandedDifferenceId(expanded ? null : difference.difference_id)}>
                            <TableCell>{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TableCell>
                            <TableCell>{formatEnumLabel(difference.category)}</TableCell>
                            <TableCell>
                              <SeverityBadge severity={difference.severity} />
                            </TableCell>
                            <TableCell>{formatEnumLabel(difference.difference_type)}</TableCell>
                            <TableCell className="max-w-[220px] truncate font-medium">{difference.title}</TableCell>
                            <TableCell className="max-w-[220px] truncate">{truncateText(difference.website_value, 90)}</TableCell>
                            <TableCell className="max-w-[220px] truncate">{truncateText(difference.document_value, 90)}</TableCell>
                            <TableCell>
                              <KnowledgeStatusBadge status={difference.resolution_status} />
                            </TableCell>
                            <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                              <Button type="button" variant="outline" size="sm" onClick={() => openResolutionModal(difference)}>
                                Resolve
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expanded ? (
                            <TableRow>
                              <TableCell colSpan={9} className="bg-[var(--color-bg-muted)]">
                                <div className="grid gap-4 lg:grid-cols-3">
                                  <DetailBlock label="Website Value" value={difference.website_value} footer={difference.website_source_url} />
                                  <DetailBlock label="Document Value" value={difference.document_value} footer={difference.document_source_name} />
                                  <DetailBlock label="Recommendation" value={difference.recommendation ?? difference.description} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
                <PaginationControls page={diffPage} total={differencesQuery.data?.total ?? differences.length} size={10} onPageChange={setDiffPage} />
              </>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">No differences match the current filters.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <ModalShell
        open={Boolean(resolveTarget)}
        title={resolveTarget?.title ?? "Resolve Difference"}
        description={resolveTarget ? `${formatEnumLabel(resolveTarget.category)} - ${formatEnumLabel(resolveTarget.severity)}` : undefined}
        onClose={() => setResolveTarget(null)}
        maxWidth="max-w-4xl"
      >
        {resolveTarget ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailBlock label="Website Value" value={resolveTarget.website_value} footer={resolveTarget.website_source_url} />
              <DetailBlock label="Document Value" value={resolveTarget.document_value} footer={resolveTarget.document_source_name} />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-[var(--color-text-main)]">Resolution</legend>
              <ResolutionOption value="WEBSITE" checked={resolutionChoice === "WEBSITE"} onChange={setResolutionChoice} label="Accept Website Value" />
              <ResolutionOption value="DOCUMENT" checked={resolutionChoice === "DOCUMENT"} onChange={setResolutionChoice} label="Accept Document Value" />
              <ResolutionOption value="CUSTOM" checked={resolutionChoice === "CUSTOM"} onChange={setResolutionChoice} label="Enter Custom Value" />
              {resolutionChoice === "CUSTOM" ? (
                <Textarea value={customValue} onChange={(event) => setCustomValue(event.target.value)} placeholder="Enter the approved custom value" />
              ) : null}
              <ResolutionOption
                value="NOT_APPLICABLE"
                checked={resolutionChoice === "NOT_APPLICABLE"}
                onChange={setResolutionChoice}
                label="Mark Not Applicable"
              />
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Notes</Label>
              <Textarea id="resolutionNotes" value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResolveTarget(null)}>
                Cancel
              </Button>
              <Button type="button" disabled={!canSaveResolution} onClick={saveResolution}>
                {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Resolution
              </Button>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </>
  );
}

function DetailBlock({ label, value, footer }: { label: string; value?: string | null; footer?: string | null }) {
  return (
    <div className="rounded-md border bg-[var(--color-bg-card)] p-4">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-text-main)]">{value || "N/A"}</p>
      {footer ? <p className="mt-3 break-words text-xs text-muted-foreground">{footer}</p> : null}
    </div>
  );
}

function ResolutionOption({
  value,
  checked,
  onChange,
  label
}: {
  value: ResolutionChoice;
  checked: boolean;
  onChange: (value: ResolutionChoice) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md border bg-[var(--color-bg-muted)] p-3 text-sm font-medium">
      <input type="radio" name="resolutionChoice" checked={checked} onChange={() => onChange(value)} />
      {label}
    </label>
  );
}

function buildResolutionPayload(
  difference: KnowledgeDifference,
  choice: ResolutionChoice,
  customValue: string,
  notes: string
): DifferenceResolutionPayload {
  if (choice === "WEBSITE") {
    return {
      resolution_status: "ACCEPTED_WEBSITE_VALUE",
      resolved_value: difference.website_value,
      resolution_notes: notes || null
    };
  }
  if (choice === "DOCUMENT") {
    return {
      resolution_status: "ACCEPTED_DOCUMENT_VALUE",
      resolved_value: difference.document_value,
      resolution_notes: notes || null
    };
  }
  if (choice === "CUSTOM") {
    return {
      resolution_status: "CUSTOM_VALUE_PROVIDED",
      resolved_value: customValue,
      resolution_notes: notes || null
    };
  }
  return {
    resolution_status: "MARKED_NOT_APPLICABLE",
    resolved_value: null,
    resolution_notes: notes || null
  };
}
