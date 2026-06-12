import axios, { type AxiosProgressEvent } from "axios";
import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import { appConfig, serviceBaseUrls } from "@/lib/config";
import { normalizeApiError } from "@/lib/apiErrors";
import { sanitizePayload } from "@/lib/sanitize";
import { useAuthStore } from "@/features/auth/auth.store";
import type {
  ApprovalPayload,
  ComparisonMode,
  DifferenceFilters,
  DifferenceResolutionPayload,
  FaqInput,
  KnowledgeApproval,
  KnowledgeComparison,
  KnowledgeDifference,
  KnowledgeSource,
  KnowledgeStatus,
  KnowledgeVersion,
  PaginatedResponse,
  ScanPage,
  UploadedDocument,
  WebsiteScan
} from "@/features/knowledge/knowledge.types";

const STORAGE_KEY = "myra-admin-fallback-knowledge";

const knowledgeServiceBaseUrl = import.meta.env.VITE_KNOWLEDGE_SERVICE_URL || serviceBaseUrls.knowledge;

const knowledgeReviewClient = axios.create({
  baseURL: knowledgeServiceBaseUrl,
  timeout: appConfig.VITE_API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

knowledgeReviewClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data && !(config.data instanceof FormData)) config.data = sanitizePayload(config.data);
  return config;
});

knowledgeReviewClient.interceptors.response.use(
  (response) => {
    response.data = unwrapResponseEnvelope(response.data);
    return response;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

const fallbackSources: KnowledgeSource[] = [
  {
    id: "kb_1",
    tenantId: "tenant_vthumma",
    name: "portfolio-overview.pdf",
    type: "PDF",
    status: "READY",
    size: "1.4 MB",
    reviewNotes: "Reviewed and approved for assistant grounding.",
    uploadedBy: "Tenant Owner",
    createdAt: "2026-05-10T14:00:00.000Z"
  },
  {
    id: "kb_2",
    tenantId: "tenant_vthumma",
    name: "Project FAQ",
    type: "FAQ",
    status: "READY",
    reviewNotes: "Seed FAQ approved.",
    uploadedBy: "Admin",
    createdAt: "2026-05-12T16:20:00.000Z"
  }
];

function unwrapResponseEnvelope(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  if (typeof record.success !== "boolean") return payload;
  if (record.success) return record.data;

  const error = record.error && typeof record.error === "object" ? (record.error as Record<string, unknown>) : undefined;
  const message =
    (typeof error?.message === "string" && error.message) ||
    (typeof record.message === "string" && record.message) ||
    "Knowledge service request failed";
  throw new Error(message);
}

function normalizePaginatedResponse<T>(payload: unknown, fallbackPage: number, fallbackSize: number): PaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      total: payload.length,
      page: fallbackPage,
      size: fallbackSize,
      pages: payload.length ? 1 : 0
    };
  }

  if (!payload || typeof payload !== "object") {
    return {
      items: [],
      total: 0,
      page: fallbackPage,
      size: fallbackSize,
      pages: 0
    };
  }

  const record = payload as Record<string, unknown>;
  const rawItems = record.items ?? record.content ?? record.results ?? record.data ?? [];
  const items = Array.isArray(rawItems) ? (rawItems as T[]) : [];
  const total = Number(record.total ?? record.totalElements ?? record.total_count ?? items.length);
  const page = Number(record.page ?? record.pageNumber ?? record.current_page ?? fallbackPage);
  const size = Number(record.size ?? record.pageSize ?? record.per_page ?? fallbackSize);
  const pages = Number(record.pages ?? record.totalPages ?? Math.ceil(total / Math.max(size, 1)));

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
    page: Number.isFinite(page) ? page : fallbackPage,
    size: Number.isFinite(size) ? size : fallbackSize,
    pages: Number.isFinite(pages) ? pages : undefined
  };
}

function notFound(error: unknown) {
  return normalizeApiError(error).status === 404;
}

function readSources() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallbackSources;
  try {
    return JSON.parse(raw) as KnowledgeSource[];
  } catch {
    return fallbackSources;
  }
}

function writeSources(sources: KnowledgeSource[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

function fileType(fileName: string): KnowledgeSource["type"] {
  const extension = fileName.split(".").pop()?.toUpperCase();
  if (extension === "PDF" || extension === "DOCX" || extension === "TXT" || extension === "CSV") return extension;
  return "TXT";
}

export async function startWebsiteScan(
  tenantId: string,
  websiteUrl: string,
  maxPages: number,
  maxDepth: number
): Promise<WebsiteScan> {
  const { data } = await knowledgeReviewClient.post<WebsiteScan>("/website-scans", {
    tenant_id: tenantId,
    website_url: websiteUrl,
    max_pages: maxPages,
    max_depth: maxDepth
  });
  return data;
}

export async function getScan(scanId: string, tenantId: string): Promise<WebsiteScan> {
  const { data } = await knowledgeReviewClient.get<WebsiteScan>(`/website-scans/${scanId}`, {
    params: { tenant_id: tenantId }
  });
  return data;
}

export async function listScans(tenantId: string, page = 1, size = 10): Promise<PaginatedResponse<WebsiteScan>> {
  const { data } = await knowledgeReviewClient.get<unknown>("/website-scans", {
    params: { tenant_id: tenantId, page, size }
  });
  return normalizePaginatedResponse<WebsiteScan>(data, page, size);
}

export async function getScanPages(scanId: string, tenantId: string, page = 1, size = 10): Promise<PaginatedResponse<ScanPage>> {
  const { data } = await knowledgeReviewClient.get<unknown>(`/website-scans/${scanId}/pages`, {
    params: { tenant_id: tenantId, page, size }
  });
  return normalizePaginatedResponse<ScanPage>(data, page, size);
}

export async function uploadDocument(
  tenantId: string,
  file: File,
  uploadedByUserId?: string,
  onUploadProgress?: (progress: number) => void
): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("tenant_id", tenantId);
  formData.append("file", file);
  if (uploadedByUserId) formData.append("uploaded_by_user_id", uploadedByUserId);

  const { data } = await knowledgeReviewClient.post<UploadedDocument>("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!event.total || !onUploadProgress) return;
      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    }
  });
  return data;
}

export async function listUploadedDocuments(
  tenantId: string,
  page = 1,
  size = 10
): Promise<PaginatedResponse<UploadedDocument>> {
  const { data } = await knowledgeReviewClient.get<unknown>("/documents", {
    params: { tenant_id: tenantId, page, size }
  });
  return normalizePaginatedResponse<UploadedDocument>(data, page, size);
}

export async function getUploadedDocument(uploadId: string, tenantId: string): Promise<UploadedDocument> {
  const { data } = await knowledgeReviewClient.get<UploadedDocument>(`/documents/${uploadId}`, {
    params: { tenant_id: tenantId }
  });
  return data;
}

export async function deleteUploadedDocument(uploadId: string, tenantId: string): Promise<void> {
  await knowledgeReviewClient.delete(`/documents/${uploadId}`, {
    params: { tenant_id: tenantId }
  });
}

export async function startComparison(
  tenantId: string,
  websiteScanId: string,
  documentIds: string[],
  comparisonMode?: ComparisonMode
): Promise<KnowledgeComparison> {
  const { data } = await knowledgeReviewClient.post<KnowledgeComparison>("/comparisons", {
    tenant_id: tenantId,
    website_scan_id: websiteScanId,
    document_ids: documentIds,
    comparison_mode: comparisonMode
  });
  return data;
}

export async function getComparison(comparisonId: string, tenantId: string): Promise<KnowledgeComparison> {
  const { data } = await knowledgeReviewClient.get<KnowledgeComparison>(`/comparisons/${comparisonId}`, {
    params: { tenant_id: tenantId }
  });
  return data;
}

export async function listComparisons(
  tenantId: string,
  page = 1,
  size = 10
): Promise<PaginatedResponse<KnowledgeComparison>> {
  const { data } = await knowledgeReviewClient.get<unknown>("/comparisons", {
    params: { tenant_id: tenantId, page, size }
  });
  return normalizePaginatedResponse<KnowledgeComparison>(data, page, size);
}

export async function getDifferences(
  comparisonId: string,
  tenantId: string,
  filters?: DifferenceFilters,
  page = 1,
  size = 10
): Promise<PaginatedResponse<KnowledgeDifference>> {
  const { data } = await knowledgeReviewClient.get<unknown>(`/comparisons/${comparisonId}/differences`, {
    params: {
      tenant_id: tenantId,
      category: filters?.category,
      severity: filters?.severity,
      resolution_status: filters?.resolution_status,
      page,
      size
    }
  });
  return normalizePaginatedResponse<KnowledgeDifference>(data, page, size);
}

export async function resolveDifference(
  comparisonId: string,
  differenceId: string,
  resolution: DifferenceResolutionPayload
): Promise<KnowledgeDifference> {
  const { data } = await knowledgeReviewClient.post<KnowledgeDifference>(
    `/comparisons/${comparisonId}/differences/${differenceId}/resolve`,
    resolution
  );
  return data;
}

export async function generateKnowledgeVersion(
  tenantId: string,
  comparisonId: string,
  createdByUserId?: string
): Promise<KnowledgeVersion> {
  const { data } = await knowledgeReviewClient.post<KnowledgeVersion>("/knowledge-versions/generate", {
    tenant_id: tenantId,
    comparison_id: comparisonId,
    created_by_user_id: createdByUserId
  });
  return data;
}

export async function submitApproval(payload: ApprovalPayload): Promise<KnowledgeApproval> {
  const { data } = await knowledgeReviewClient.post<KnowledgeApproval>("/approvals", payload);
  return data;
}

export async function listApprovals(
  tenantId: string,
  page = 1,
  size = 10
): Promise<PaginatedResponse<KnowledgeApproval>> {
  const { data } = await knowledgeReviewClient.get<unknown>("/approvals", {
    params: { tenant_id: tenantId, page, size }
  });
  return normalizePaginatedResponse<KnowledgeApproval>(data, page, size);
}

export async function getApprovedSourceOfTruth(tenantId: string): Promise<KnowledgeVersion | null> {
  try {
    const { data } = await knowledgeReviewClient.get<KnowledgeVersion>("/knowledge-versions/approved", {
      params: { tenant_id: tenantId }
    });
    return data;
  } catch (error) {
    if (notFound(error)) return null;
    throw error;
  }
}

export async function listKnowledgeSources(tenantId?: string): Promise<KnowledgeSource[]> {
  try {
    const { data } = await apiClient.get<KnowledgeSource[]>("/knowledge/sources", { params: { tenantId } });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return readSources().filter((source) => !tenantId || source.tenantId === tenantId);
  }
}

export async function uploadKnowledgeDocument(tenantId: string, file: File): Promise<KnowledgeSource> {
  const formData = new FormData();
  formData.append("tenantId", tenantId);
  formData.append("file", file);
  try {
    const { data } = await apiClient.post<KnowledgeSource>("/knowledge/sources/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const source: KnowledgeSource = {
      id: `kb_${Date.now()}`,
      tenantId,
      name: file.name,
      type: fileType(file.name),
      status: "UPLOADED",
      size: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`,
      reviewNotes: "",
      uploadedBy: "Tenant Owner",
      createdAt: new Date().toISOString()
    };
    writeSources([source, ...readSources()]);
    return source;
  }
}

export async function addFaq(input: FaqInput): Promise<KnowledgeSource> {
  try {
    const { data } = await apiClient.post<KnowledgeSource>("/knowledge/faqs", input);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const source: KnowledgeSource = {
      id: `faq_${Date.now()}`,
      tenantId: input.tenantId,
      name: input.question,
      type: "FAQ",
      status: "READY",
      createdAt: new Date().toISOString()
    };
    writeSources([source, ...readSources()]);
    return source;
  }
}

export async function addWebsiteKnowledgeSource(tenantId: string, websiteUrl: string): Promise<KnowledgeSource> {
  try {
    const { data } = await apiClient.post<KnowledgeSource>("/knowledge/sources/website", { tenantId, websiteUrl });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const source: KnowledgeSource = {
      id: `web_${Date.now()}`,
      tenantId,
      name: websiteUrl,
      type: "WEBSITE",
      status: "UPLOADED",
      reviewNotes: "Website URL queued for content review.",
      uploadedBy: "Tenant Owner",
      createdAt: new Date().toISOString()
    };
    writeSources([source, ...readSources()]);
    return source;
  }
}

export async function deleteKnowledgeSource(sourceId: string): Promise<void> {
  try {
    await apiClient.delete(`/knowledge/sources/${sourceId}`);
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    writeSources(readSources().filter((source) => source.id !== sourceId));
  }
}

export async function updateKnowledgeSourceStatus(
  sourceId: string,
  payload: { status: KnowledgeStatus; reviewNotes?: string }
): Promise<KnowledgeSource> {
  try {
    const { data } = await apiClient.patch<KnowledgeSource>(`/admin/knowledge-documents/${sourceId}`, payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const sources = readSources();
    const source = sources.find((item) => item.id === sourceId);
    if (!source) throw new Error("Knowledge source not found");
    const updatedSource = { ...source, ...payload };
    writeSources(sources.map((item) => (item.id === sourceId ? updatedSource : item)));
    return updatedSource;
  }
}
