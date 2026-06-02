import { knowledgeHttp } from "@/api/httpClient";
import type { KnowledgeSource, KnowledgeStatus } from "@/features/knowledge/knowledge.types";

export async function fetchKnowledgeSources(tenantId?: string) {
  const { data } = await knowledgeHttp.get<KnowledgeSource[]>("/knowledge/sources", { params: { tenantId } });
  return data;
}

export async function uploadKnowledgeSource(tenantId: string, file: File) {
  const formData = new FormData();
  formData.append("tenantId", tenantId);
  formData.append("file", file);
  const { data } = await knowledgeHttp.post<KnowledgeSource>("/knowledge/sources/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function addWebsiteKnowledgeSource(tenantId: string, websiteUrl: string) {
  const { data } = await knowledgeHttp.post<KnowledgeSource>("/knowledge/sources/website", { tenantId, websiteUrl });
  return data;
}

export async function updateKnowledgeStatus(sourceId: string, payload: { status: KnowledgeStatus; reviewNotes?: string }) {
  const { data } = await knowledgeHttp.patch<KnowledgeSource>(`/knowledge/sources/${sourceId}`, payload);
  return data;
}

export async function deleteKnowledgeSourceById(sourceId: string) {
  await knowledgeHttp.delete(`/knowledge/sources/${sourceId}`);
}
