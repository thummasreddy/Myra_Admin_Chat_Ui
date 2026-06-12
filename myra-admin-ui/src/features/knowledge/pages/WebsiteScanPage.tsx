import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Globe2, Play, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ErrorBanner,
  KnowledgeStatusBadge,
  ModalShell,
  PaginationControls,
  TenantSelect,
  useKnowledgeTenant
} from "@/features/knowledge/knowledge.ui";
import { getScanPages, listScans, startWebsiteScan } from "@/features/knowledge/knowledge.api";
import type { ScanPage } from "@/features/knowledge/knowledge.types";
import { formatDate } from "@/lib/utils";

const scanSchema = z.object({
  websiteUrl: z.string().url("Enter a valid website URL"),
  maxPages: z.coerce.number().min(1, "Minimum is 1 page").max(100, "Maximum is 100 pages"),
  maxDepth: z.coerce.number().min(1, "Minimum depth is 1").max(5, "Maximum depth is 5")
});

type ScanFormValues = z.infer<typeof scanSchema>;

export function WebsiteScanPage() {
  const { tenantId, tenants, tenantsLoading, setSelectedTenantId } = useKnowledgeTenant();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<ScanPage | null>(null);

  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      websiteUrl: "",
      maxPages: 30,
      maxDepth: 2
    }
  });

  const scansQuery = useQuery({
    queryKey: ["knowledge-review", "scans", tenantId, 1, 10],
    queryFn: () => listScans(tenantId, 1, 10),
    enabled: Boolean(tenantId),
    refetchInterval: (query) => (query.state.data?.items.some((scan) => scan.status === "CRAWLING") ? 5000 : false)
  });

  const latestScan = scansQuery.data?.items[0];
  const activeScan = scansQuery.data?.items.find((scan) => scan.scan_id === activeScanId) ?? latestScan;

  const pagesQuery = useQuery({
    queryKey: ["knowledge-review", "scan-pages", tenantId, activeScan?.scan_id, page],
    queryFn: () => getScanPages(activeScan?.scan_id ?? "", tenantId, page, 10),
    enabled: Boolean(tenantId && activeScan?.scan_id),
    refetchInterval: activeScan?.status === "CRAWLING" ? 5000 : false
  });

  const startScanMutation = useMutation({
    mutationFn: (values: ScanFormValues) => startWebsiteScan(tenantId, values.websiteUrl, values.maxPages, values.maxDepth),
    onSuccess: (scan) => {
      setActiveScanId(scan.scan_id);
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "scans", tenantId] });
      toast({ title: "Scan started", description: "Website crawling has been queued.", variant: "success" });
    },
    onError: () => toast({ title: "Scan could not be started", variant: "error" })
  });

  const filteredPages = useMemo(() => {
    const items = pagesQuery.data?.items ?? [];
    if (statusFilter === "ALL") return items;
    return items.filter((item) => item.status === statusFilter);
  }, [pagesQuery.data?.items, statusFilter]);

  const progress = activeScan ? Math.min((activeScan.pages_crawled / Math.max(activeScan.max_pages, 1)) * 100, 100) : 0;

  return (
    <>
      <PageHeader
        title="Website Scan"
        description="Start a tenant website crawl and inspect extracted page text as the scan progresses."
        actions={<TenantSelect tenantId={tenantId} tenants={tenants} loading={tenantsLoading} onChange={setSelectedTenantId} />}
      />

      {!tenantId && !tenantsLoading ? <div className="mb-4"><ErrorBanner title="No tenant selected" /></div> : null}
      {scansQuery.error ? <div className="mb-4"><ErrorBanner error={scansQuery.error} /></div> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Scan Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => startScanMutation.mutate(values))}>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="websiteUrl"
                      className="pl-9"
                      placeholder="https://example.com"
                      {...form.register("websiteUrl")}
                      aria-invalid={Boolean(form.formState.errors.websiteUrl)}
                    />
                  </div>
                  {form.formState.errors.websiteUrl ? <p className="text-sm text-destructive">{form.formState.errors.websiteUrl.message}</p> : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxPages">Max Pages</Label>
                    <Input id="maxPages" type="number" min={1} max={100} {...form.register("maxPages")} />
                    {form.formState.errors.maxPages ? <p className="text-sm text-destructive">{form.formState.errors.maxPages.message}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDepth">Max Depth</Label>
                    <Input id="maxDepth" type="number" min={1} max={5} {...form.register("maxDepth")} />
                    {form.formState.errors.maxDepth ? <p className="text-sm text-destructive">{form.formState.errors.maxDepth.message}</p> : null}
                  </div>
                </div>

                <Button type="submit" disabled={!tenantId || startScanMutation.isPending}>
                  {startScanMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {startScanMutation.isPending ? "Starting..." : "Start Scan"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scan Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scansQuery.isLoading ? (
                <>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-56" />
                </>
              ) : activeScan ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Current status</span>
                    <KnowledgeStatusBadge status={activeScan.status} />
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-[var(--color-text-main)]">
                        {activeScan.pages_crawled}/{activeScan.max_pages}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-bg-muted)]">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <InfoRow label="Website" value={activeScan.website_url} />
                    <InfoRow label="Started" value={formatDate(activeScan.started_at)} />
                    <InfoRow label="Completed" value={formatDate(activeScan.completed_at)} />
                    <InfoRow label="Pages failed" value={activeScan.pages_failed.toLocaleString()} />
                  </dl>
                  {activeScan.error_message ? <ErrorBanner title="Scan error" error={new Error(activeScan.error_message)} /> : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No website scan has been started for this tenant.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle>Crawled Pages Table</CardTitle>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full sm:w-44">
              <option value="ALL">All statuses</option>
              <option value="CRAWLED">Crawled</option>
              <option value="FAILED">Failed</option>
              <option value="SKIPPED">Skipped</option>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {pagesQuery.error ? <div className="p-4"><ErrorBanner error={pagesQuery.error} /></div> : null}
            {pagesQuery.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredPages.length ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page URL</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map((scanPage) => (
                      <TableRow key={scanPage.id}>
                        <TableCell className="max-w-[280px] truncate font-medium">{scanPage.page_url}</TableCell>
                        <TableCell className="max-w-[220px] truncate">{scanPage.page_title ?? "Untitled"}</TableCell>
                        <TableCell>
                          <KnowledgeStatusBadge status={scanPage.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPage(scanPage)}>
                            <Eye className="h-4 w-4" />
                            View Text
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <PaginationControls page={page} total={pagesQuery.data?.total ?? filteredPages.length} size={10} onPageChange={setPage} />
              </>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">No crawled pages match the current filter.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <ModalShell
        open={Boolean(selectedPage)}
        title={selectedPage?.page_title ?? "Extracted Text"}
        description={selectedPage?.page_url}
        onClose={() => setSelectedPage(null)}
      >
        <pre className="whitespace-pre-wrap break-words rounded-md border bg-[var(--color-bg-muted)] p-4 text-sm leading-6 text-[var(--color-text-main)]">
          {selectedPage?.extracted_text || "No extracted text is available for this page."}
        </pre>
      </ModalShell>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium text-[var(--color-text-main)]">{value}</dd>
    </div>
  );
}
