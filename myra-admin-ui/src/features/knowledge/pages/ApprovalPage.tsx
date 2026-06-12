import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileCheck2, Loader2, ShieldCheck, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  ErrorBanner,
  KnowledgeStatusBadge,
  TenantSelect,
  isResolved,
  useKnowledgeTenant
} from "@/features/knowledge/knowledge.ui";
import {
  generateKnowledgeVersion,
  getDifferences,
  listApprovals,
  listComparisons,
  submitApproval
} from "@/features/knowledge/knowledge.api";
import type { KnowledgeVersion } from "@/features/knowledge/knowledge.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { formatDate } from "@/lib/utils";

const approvalLegalText =
  "I confirm that I am authorized to approve this tenant's business knowledge. I have reviewed the website scan, uploaded documents, comparison results, and all required difference resolutions. I understand that this approved knowledge version will be treated as the source of truth for Myra AI responses until it is replaced by a later approved version.";

const approvalSchema = z.object({
  confirmation: z.boolean().refine((value) => value, "Confirmation is required"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.string().min(2, "Role or title is required"),
  email: z.string().email("Enter a valid email"),
  notes: z.string().optional()
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

export function ApprovalPage() {
  const { tenantId, tenants, tenantsLoading, setSelectedTenantId } = useKnowledgeTenant();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatedVersion, setGeneratedVersion] = useState<KnowledgeVersion | null>(null);

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      confirmation: false,
      fullName: user?.name ?? "",
      role: user?.role ?? "",
      email: user?.email ?? "",
      notes: ""
    }
  });

  const comparisonsQuery = useQuery({
    queryKey: ["knowledge-review", "comparisons", tenantId, 1, 10],
    queryFn: () => listComparisons(tenantId, 1, 10),
    enabled: Boolean(tenantId)
  });
  const approvalsQuery = useQuery({
    queryKey: ["knowledge-review", "approvals", tenantId, 1, 20],
    queryFn: () => listApprovals(tenantId, 1, 20),
    enabled: Boolean(tenantId)
  });

  const latestComparison = comparisonsQuery.data?.items.find((comparison) => comparison.status === "COMPLETED") ?? comparisonsQuery.data?.items[0];
  const differencesQuery = useQuery({
    queryKey: ["knowledge-review", "approval-differences", tenantId, latestComparison?.comparison_id],
    queryFn: () => getDifferences(latestComparison?.comparison_id ?? "", tenantId, undefined, 1, 500),
    enabled: Boolean(tenantId && latestComparison?.comparison_id)
  });

  const generateVersionMutation = useMutation({
    mutationFn: () => generateKnowledgeVersion(tenantId, latestComparison?.comparison_id ?? "", user?.id),
    onSuccess: (version) => {
      setGeneratedVersion(version);
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "approved-source", tenantId] });
      toast({ title: "Knowledge version generated", description: `Version ${version.version_number} is ready for approval.`, variant: "success" });
    },
    onError: () => toast({ title: "Knowledge version could not be generated", variant: "error" })
  });

  const approvalMutation = useMutation({
    mutationFn: (values: ApprovalFormValues) =>
      submitApproval({
        tenant_id: tenantId,
        knowledge_version_id: generatedVersion?.version_id ?? "",
        approver_name: values.fullName,
        approver_email: values.email,
        approver_role: values.role,
        approval_status: "APPROVED",
        confirmation_text: approvalLegalText,
        approval_notes: values.notes?.trim() || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "approvals", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-review", "approved-source", tenantId] });
      toast({ title: "Knowledge approved", description: "The version is now the tenant source of truth.", variant: "success" });
      navigate("/knowledge");
    },
    onError: () => toast({ title: "Approval could not be submitted", variant: "error" })
  });

  const differences = differencesQuery.data?.items ?? [];
  const unresolvedCriticalCount = differences.filter((difference) => difference.severity === "CRITICAL" && !isResolved(difference.resolution_status)).length;
  const unresolvedHighCount = differences.filter((difference) => difference.severity === "HIGH" && !isResolved(difference.resolution_status)).length;
  const approvalValues = form.watch();
  const approvalEnabled = Boolean(generatedVersion && unresolvedCriticalCount === 0);
  const canSubmit =
    approvalEnabled &&
    approvalValues.confirmation &&
    Boolean(approvalValues.fullName.trim()) &&
    Boolean(approvalValues.role.trim()) &&
    Boolean(approvalValues.email.trim()) &&
    !approvalMutation.isPending;

  return (
    <>
      <PageHeader
        title="Approval"
        description="Generate and approve a tenant knowledge version as the source of truth."
        actions={<TenantSelect tenantId={tenantId} tenants={tenants} loading={tenantsLoading} onChange={setSelectedTenantId} />}
      />

      {!tenantId && !tenantsLoading ? <div className="mb-4"><ErrorBanner title="No tenant selected" /></div> : null}
      {comparisonsQuery.error || approvalsQuery.error || differencesQuery.error ? (
        <div className="mb-4"><ErrorBanner error={comparisonsQuery.error ?? approvalsQuery.error ?? differencesQuery.error} /></div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pre-approval Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comparisonsQuery.isLoading || differencesQuery.isLoading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : latestComparison ? (
                <>
                  <ChecklistRow
                    tone={unresolvedCriticalCount > 0 ? "danger" : "success"}
                    icon={unresolvedCriticalCount > 0 ? AlertTriangle : CheckCircle2}
                    title={`${unresolvedCriticalCount} unresolved CRITICAL differences`}
                    description={
                      unresolvedCriticalCount > 0
                        ? "You must resolve all CRITICAL differences before approval."
                        : "All CRITICAL differences are resolved."
                    }
                  />
                  <ChecklistRow
                    tone={unresolvedHighCount > 0 ? "warning" : "success"}
                    icon={unresolvedHighCount > 0 ? AlertTriangle : CheckCircle2}
                    title={`${unresolvedHighCount} unresolved HIGH differences`}
                    description={
                      unresolvedHighCount > 0
                        ? "You have unresolved HIGH differences. You may still approve but review is recommended."
                        : "No unresolved HIGH differences remain."
                    }
                  />

                  <div className="rounded-md border bg-[var(--color-bg-muted)] p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-medium text-[var(--color-text-main)]">Latest comparison</span>
                      <KnowledgeStatusBadge status={latestComparison.status} />
                    </div>
                    <p className="text-muted-foreground">
                      {latestComparison.total_differences.toLocaleString()} total differences, created {formatDate(latestComparison.created_at)}.
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={!latestComparison || generateVersionMutation.isPending}
                    onClick={() => generateVersionMutation.mutate()}
                  >
                    {generateVersionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                    Generate Knowledge Version
                  </Button>
                </>
              ) : (
                <ErrorBanner title="No comparison available" error={new Error("Run a comparison before generating a knowledge version.")} />
              )}

              {generatedVersion ? (
                <div className="rounded-md border border-emerald-400/30 bg-[var(--color-success-bg)] p-4 text-sm text-[var(--color-success)]">
                  <p className="font-medium">Version {generatedVersion.version_number} generated</p>
                  <p className="mt-1 break-words">ID: {generatedVersion.version_id}</p>
                  <p className="mt-1 break-words">Content hash: {generatedVersion.content_hash ?? "N/A"}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => approvalMutation.mutate(values))}>
                <div className="rounded-md border bg-[var(--color-bg-muted)] p-4 text-sm leading-6 text-[var(--color-text-main)]">
                  {approvalLegalText}
                </div>

                <label className="flex items-start gap-3 rounded-md border p-3 text-sm font-medium">
                  <Checkbox {...form.register("confirmation")} disabled={!approvalEnabled} />
                  <span>I confirm the above statement</span>
                </label>
                {form.formState.errors.confirmation ? <p className="text-sm text-destructive">{form.formState.errors.confirmation.message}</p> : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" disabled={!approvalEnabled} {...form.register("fullName")} />
                    {form.formState.errors.fullName ? <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role/Title</Label>
                    <Input id="role" disabled={!approvalEnabled} {...form.register("role")} />
                    {form.formState.errors.role ? <p className="text-sm text-destructive">{form.formState.errors.role.message}</p> : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" disabled={!approvalEnabled} {...form.register("email")} />
                  {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" disabled={!approvalEnabled} {...form.register("notes")} />
                </div>

                <Button type="submit" disabled={!canSubmit}>
                  {approvalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Approve as Source of Truth
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {approvalsQuery.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : approvalsQuery.data?.items.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Approver Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalsQuery.data.items.map((approval) => (
                    <TableRow key={approval.approval_id}>
                      <TableCell className="max-w-[220px] truncate font-medium">{approval.knowledge_version_id}</TableCell>
                      <TableCell>{approval.approver_name}</TableCell>
                      <TableCell>{approval.approver_role ?? "N/A"}</TableCell>
                      <TableCell>{formatDate(approval.approved_at)}</TableCell>
                      <TableCell>
                        <KnowledgeStatusBadge status={approval.approval_status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">No approvals have been submitted for this tenant.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ChecklistRow({
  tone,
  icon: Icon,
  title,
  description
}: {
  tone: "success" | "warning" | "danger";
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const classes = {
    success: "border-emerald-400/30 bg-[var(--color-success-bg)] text-[var(--color-success)]",
    warning: "border-amber-400/30 bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    danger: "border-destructive/30 bg-destructive/10 text-destructive"
  };

  return (
    <div className={`flex items-start gap-3 rounded-md border p-4 ${classes[tone]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm opacity-85">{description}</p>
      </div>
    </div>
  );
}
