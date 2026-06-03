import { knowledgeHttp } from "@/api/httpClient";
import type { KnowledgeSource, KnowledgeStatus } from "@/features/knowledge/knowledge.types";

export async function fetchKnowledgeSources(tenantId?: string) {
  const { data } = await knowledgeHttp.get<KnowledgeSource[]>("/sources", { params: { tenant_id: tenantId } });
  return data;
}

export async function uploadKnowledgeSource(tenantId: string, file: File) {
  const formData = new FormData();
  formData.append("tenant_id", tenantId);
  formData.append("file", file);
  const { data } = await knowledgeHttp.post<KnowledgeSource>("/sources/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function addWebsiteKnowledgeSource(tenantId: string, websiteUrl: string) {
  const { data } = await knowledgeHttp.post<KnowledgeSource>("/sources/website", {
    tenant_id: tenantId,
    website_url: websiteUrl
  });
  return data;
}

export async function updateKnowledgeStatus(sourceId: string, payload: { status: KnowledgeStatus; reviewNotes?: string }) {
  const { data } = await knowledgeHttp.patch<KnowledgeSource>(`/sources/${sourceId}`, {
    status: payload.status,
    review_notes: payload.reviewNotes
  });
  return data;
}

export async function deleteKnowledgeSourceById(sourceId: string) {
  await knowledgeHttp.delete(`/sources/${sourceId}`);
}
