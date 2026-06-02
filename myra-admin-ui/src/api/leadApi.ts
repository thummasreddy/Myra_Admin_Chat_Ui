import { leadHttp } from "@/api/httpClient";
import type { Lead } from "@/features/leads/leads.api";

export async function fetchLeads(tenantId?: string) {
  const { data } = await leadHttp.get<Lead[]>("/leads", { params: { tenantId } });
  return data;
}

export async function updateLeadStatus(leadId: string, status: "NEW" | "CONTACTED" | "QUALIFIED" | "ARCHIVED") {
  const { data } = await leadHttp.patch(`/leads/${leadId}`, { status });
  return data;
}
