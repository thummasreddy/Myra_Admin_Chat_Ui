import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import type { FaqInput, KnowledgeSource } from "@/features/knowledge/knowledge.types";

const STORAGE_KEY = "myra-admin-fallback-knowledge";

const fallbackSources: KnowledgeSource[] = [
  {
    id: "kb_1",
    tenantId: "tenant_vthumma",
    name: "portfolio-overview.pdf",
    type: "PDF",
    status: "READY",
    size: "1.4 MB",
    createdAt: "2026-05-10T14:00:00.000Z"
  },
  {
    id: "kb_2",
    tenantId: "tenant_vthumma",
    name: "Project FAQ",
    type: "FAQ",
    status: "READY",
    createdAt: "2026-05-12T16:20:00.000Z"
  }
];

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
      status: "PENDING",
      size: `${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB`,
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

export async function deleteKnowledgeSource(sourceId: string): Promise<void> {
  try {
    await apiClient.delete(`/knowledge/sources/${sourceId}`);
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    writeSources(readSources().filter((source) => source.id !== sourceId));
  }
}
