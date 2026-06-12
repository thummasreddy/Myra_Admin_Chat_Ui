import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listTenants } from "@/features/tenants/tenant.api";
import type { Tenant } from "@/features/tenants/tenant.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { cn } from "@/lib/utils";
import type { DifferenceCategory, DifferenceSeverity, ResolutionStatus } from "@/features/knowledge/knowledge.types";

export const differenceCategories: DifferenceCategory[] = [
  "PRICING",
  "CONTACT_INFO",
  "BUSINESS_HOURS",
  "ADDRESS",
  "SERVICES",
  "PRODUCTS",
  "POLICY",
  "REFUND",
  "DELIVERY",
  "FAQ",
  "LEGAL",
  "OTHER"
];

export const differenceSeverities: DifferenceSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const resolutionStatuses: ResolutionStatus[] = [
  "OPEN",
  "ACCEPTED_WEBSITE_VALUE",
  "ACCEPTED_DOCUMENT_VALUE",
  "CUSTOM_VALUE_PROVIDED",
  "MARKED_NOT_APPLICABLE",
  "RESOLVED",
  "REJECTED"
];

const emptyTenants: Tenant[] = [];

export function useKnowledgeTenant() {
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const setSelectedTenantId = useAuthStore((state) => state.setSelectedTenantId);
  const tenantsQuery = useQuery({ queryKey: ["tenants", "knowledge-review"], queryFn: () => listTenants() });
  const tenants = tenantsQuery.data ?? emptyTenants;
  const tenantId = selectedTenantId || tenants[0]?.tenantId || "";

  useEffect(() => {
    if (!selectedTenantId && tenants[0]?.tenantId) setSelectedTenantId(tenants[0].tenantId);
  }, [selectedTenantId, setSelectedTenantId, tenants]);

  return {
    tenantId,
    tenants,
    tenantsLoading: tenantsQuery.isLoading,
    setSelectedTenantId
  };
}

export function TenantSelect({
  tenantId,
  tenants,
  loading,
  onChange
}: {
  tenantId: string;
  tenants: Tenant[];
  loading?: boolean;
  onChange: (tenantId: string) => void;
}) {
  return (
    <Select value={tenantId} onChange={(event) => onChange(event.target.value)} disabled={loading || tenants.length === 0} className="w-64">
      {tenants.length === 0 ? <option value="">No tenants</option> : null}
      {tenants.map((tenant) => (
        <option key={tenant.tenantId} value={tenant.tenantId}>
          {tenant.tenantName}
        </option>
      ))}
    </Select>
  );
}

export function ErrorBanner({ title = "Unable to load knowledge data", error }: { title?: string; error?: unknown }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">{title}</p>
          {error ? <p className="mt-1 text-destructive/80">{getErrorMessage(error)}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function KnowledgeStatusBadge({ status }: { status?: string | null }) {
  const normalized = status ?? "UNKNOWN";
  const variant =
    normalized.includes("APPROVED") || normalized.includes("COMPLETED") || normalized === "RESOLVED"
      ? "success"
      : normalized.includes("FAILED") || normalized === "REJECTED"
        ? "destructive"
        : normalized.includes("PENDING") || normalized.includes("REVIEW") || normalized === "OPEN"
          ? "warning"
          : normalized.includes("EXTRACTING") || normalized.includes("CRAWLING") || normalized === "RUNNING"
            ? "default"
            : "muted";

  return (
    <Badge variant={variant}>
      {normalized.includes("EXTRACTING") || normalized.includes("CRAWLING") || normalized === "RUNNING" ? (
        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
      ) : null}
      {normalized}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: DifferenceSeverity }) {
  return (
    <Badge
      className={cn(
        severity === "CRITICAL" && "border-red-500/30 bg-red-500/10 text-red-600",
        severity === "HIGH" && "border-orange-500/30 bg-orange-500/10 text-orange-600",
        severity === "MEDIUM" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
        severity === "LOW" && "border-slate-400/30 bg-slate-500/10 text-slate-600"
      )}
      variant="outline"
    >
      {severity}
    </Badge>
  );
}

export function CountBadge({ label, value, severity }: { label: string; value: number; severity: DifferenceSeverity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-[var(--color-bg-muted)] px-2 py-1 text-xs font-medium">
      <SeverityBadge severity={severity} />
      <span className="text-muted-foreground">{label}</span>
      <span className="text-[var(--color-text-main)]">{value}</span>
    </span>
  );
}

export function PaginationControls({
  page,
  total,
  size,
  onPageChange
}: {
  page: number;
  total: number;
  size: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(Math.ceil(total / Math.max(size, 1)), 1);
  return (
    <div className="flex flex-col gap-2 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} - {total.toLocaleString()} total
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function ModalShell({
  open,
  title,
  description,
  children,
  onClose,
  maxWidth = "max-w-3xl"
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className={cn("max-h-[88vh] w-full overflow-hidden rounded-lg border bg-[var(--color-bg-card)] shadow-xl", maxWidth)}>
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--color-text-main)]">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(88vh-73px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function LoadingCardGrid({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-[var(--color-bg-card)] p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-5 h-8 w-24" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </>
  );
}

export function formatEnumLabel(value?: string | null) {
  if (!value) return "N/A";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function truncateText(value?: string | null, maxLength = 120) {
  if (!value) return "N/A";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export function isResolved(status: ResolutionStatus) {
  return status !== "OPEN";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Please verify the knowledge service is reachable and try again.";
}
