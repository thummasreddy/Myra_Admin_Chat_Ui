import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, FileCheck2, FileSearch, GitCompareArrows, UploadCloud, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  CountBadge,
  ErrorBanner,
  KnowledgeStatusBadge,
  LoadingCardGrid,
  TenantSelect,
  formatEnumLabel,
  isResolved,
  useKnowledgeTenant
} from "@/features/knowledge/knowledge.ui";
import {
  getApprovedSourceOfTruth,
  getDifferences,
  listApprovals,
  listComparisons,
  listScans,
  listUploadedDocuments
} from "@/features/knowledge/knowledge.api";
import { formatDate } from "@/lib/utils";

export function KnowledgeOverviewPage() {
  const { tenantId, tenants, tenantsLoading, setSelectedTenantId } = useKnowledgeTenant();

  const scansQuery = useQuery({
    queryKey: ["knowledge-review", "scans", tenantId, 1, 5],
    queryFn: () => listScans(tenantId, 1, 5),
    enabled: Boolean(tenantId)
  });
  const documentsQuery = useQuery({
    queryKey: ["knowledge-review", "documents", tenantId, 1, 20],
    queryFn: () => listUploadedDocuments(tenantId, 1, 20),
    enabled: Boolean(tenantId)
  });
  const comparisonsQuery = useQuery({
    queryKey: ["knowledge-review", "comparisons", tenantId, 1, 5],
    queryFn: () => listComparisons(tenantId, 1, 5),
    enabled: Boolean(tenantId)
  });
  const approvalsQuery = useQuery({
    queryKey: ["knowledge-review", "approvals", tenantId, 1, 5],
    queryFn: () => listApprovals(tenantId, 1, 5),
    enabled: Boolean(tenantId)
  });
  const approvedVersionQuery = useQuery({
    queryKey: ["knowledge-review", "approved-source", tenantId],
    queryFn: () => getApprovedSourceOfTruth(tenantId),
    enabled: Boolean(tenantId)
  });

  const latestScan = scansQuery.data?.items[0];
  const latestComparison = comparisonsQuery.data?.items[0];
  const differencesQuery = useQuery({
    queryKey: ["knowledge-review", "overview-differences", tenantId, latestComparison?.comparison_id],
    queryFn: () => getDifferences(latestComparison?.comparison_id ?? "", tenantId, undefined, 1, 200),
    enabled: Boolean(tenantId && latestComparison?.comparison_id)
  });

  const documents = documentsQuery.data?.items ?? [];
  const extractionSummary = documents.reduce<Record<string, number>>((acc, document) => {
    acc[document.extraction_status] = (acc[document.extraction_status] ?? 0) + 1;
    return acc;
  }, {});
  const differences = differencesQuery.data?.items ?? [];
  const resolvedCount = differences.filter((difference) => isResolved(difference.resolution_status)).length;
  const unresolvedCount = Math.max(differences.length - resolvedCount, 0);
  const approvedVersion = approvedVersionQuery.data;
  const latestApproval = approvalsQuery.data?.items[0];
  const isLoading =
    tenantsLoading ||
    scansQuery.isLoading ||
    documentsQuery.isLoading ||
    comparisonsQuery.isLoading ||
    approvalsQuery.isLoading ||
    approvedVersionQuery.isLoading;
  const firstError =
    scansQuery.error ||
    documentsQuery.error ||
    comparisonsQuery.error ||
    approvalsQuery.error ||
    approvedVersionQuery.error ||
    differencesQuery.error;

  return (
    <>
      <PageHeader
        title="Knowledge Review Dashboard"
        description="Scan websites, compare uploaded documents, resolve differences, and approve the tenant source of truth."
        actions={<TenantSelect tenantId={tenantId} tenants={tenants} loading={tenantsLoading} onChange={setSelectedTenantId} />}
      />

      {!tenantId && !tenantsLoading ? <ErrorBanner title="No tenant selected" /> : null}
      {firstError ? <div className="mb-4"><ErrorBanner error={firstError} /></div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          <LoadingCardGrid />
        ) : (
          <>
            <StepCard
              icon={FileSearch}
              title="Website Scan"
              status={<KnowledgeStatusBadge status={latestScan?.status ?? "PENDING_CRAWL"} />}
              primaryLabel="Start New Scan"
              primaryHref="/knowledge/website-scan"
              secondaryLabel={latestScan ? "View Scan Details" : undefined}
              secondaryHref="/knowledge/website-scan"
            >
              <p className="truncate text-sm font-medium text-[var(--color-text-main)]">{latestScan?.website_url ?? "No scan started"}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {(latestScan?.pages_crawled ?? 0).toLocaleString()} of {(latestScan?.max_pages ?? 0).toLocaleString()} pages crawled
              </p>
            </StepCard>

            <StepCard
              icon={UploadCloud}
              title="Document Upload"
              status={<KnowledgeStatusBadge status={documents.length ? "UPLOADED" : "NOT_UPLOADED"} />}
              primaryLabel="Upload Documents"
              primaryHref="/knowledge/documents"
            >
              <p className="text-2xl font-semibold text-[var(--color-text-main)]">{documentsQuery.data?.total ?? documents.length}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(extractionSummary).length ? (
                  Object.entries(extractionSummary).map(([status, count]) => (
                    <Badge key={status} variant="muted">
                      {formatEnumLabel(status)}: {count}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No uploaded documents yet.</p>
                )}
              </div>
            </StepCard>

            <StepCard
              icon={GitCompareArrows}
              title="Comparison"
              status={<KnowledgeStatusBadge status={latestComparison?.status ?? "PENDING"} />}
              primaryLabel={latestComparison ? "View Comparison" : "Run Comparison"}
              primaryHref="/knowledge/comparison"
            >
              <div className="flex flex-wrap gap-2">
                <CountBadge label="Critical" value={latestComparison?.critical_count ?? 0} severity="CRITICAL" />
                <CountBadge label="High" value={latestComparison?.high_count ?? 0} severity="HIGH" />
                <CountBadge label="Medium" value={latestComparison?.medium_count ?? 0} severity="MEDIUM" />
                <CountBadge label="Low" value={latestComparison?.low_count ?? 0} severity="LOW" />
              </div>
            </StepCard>

            <StepCard
              icon={FileCheck2}
              title="Difference Resolution"
              status={<KnowledgeStatusBadge status={unresolvedCount ? "OPEN" : "RESOLVED"} />}
              primaryLabel="Review Differences"
              primaryHref={latestComparison ? `/knowledge/differences/${latestComparison.comparison_id}` : "/knowledge/comparison"}
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border bg-[var(--color-bg-muted)] p-3">
                  <p className="text-muted-foreground">Unresolved</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-text-main)]">{unresolvedCount}</p>
                </div>
                <div className="rounded-md border bg-[var(--color-bg-muted)] p-3">
                  <p className="text-muted-foreground">Resolved</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-text-main)]">{resolvedCount}</p>
                </div>
              </div>
            </StepCard>

            <StepCard
              icon={CheckCircle2}
              title="Approval"
              status={<KnowledgeStatusBadge status={approvedVersion?.status ?? latestApproval?.approval_status ?? "PENDING_APPROVAL"} />}
              primaryLabel="Approve Knowledge"
              primaryHref="/knowledge/approval"
            >
              {approvedVersion ? (
                <div className="space-y-2">
                  <Badge variant="success">APPROVED v{approvedVersion.version_number}</Badge>
                  <p className="text-sm text-muted-foreground">
                    Approved {formatDate(approvedVersion.approved_at ?? approvedVersion.created_at)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No approved source-of-truth version yet.</p>
              )}
            </StepCard>
          </>
        )}
      </section>
    </>
  );
}

function StepCard({
  icon: Icon,
  title,
  status,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  children
}: {
  icon: LucideIcon;
  title: string;
  status: ReactNode;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex min-h-[280px] flex-col">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          {status}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="min-h-24 flex-1">{children}</div>
        <div className="mt-5 flex flex-col gap-2">
          <Button asChild>
            <Link to={primaryHref}>
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryLabel && secondaryHref ? (
            <Button asChild variant="outline">
              <Link to={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
