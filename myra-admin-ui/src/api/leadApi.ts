import { leadHttp } from "@/api/httpClient";
import type { Lead } from "@/features/leads/leads.api";

export async function fetchLeads(tenantId?: string) {
  const { data } = await leadHttp.get<Lead[]>("/", { params: { tenant_id: tenantId } });
  return data;
}

export async function updateLeadStatus(leadId: string, status: "NEW" | "CONTACTED" | "QUALIFIED" | "ARCHIVED") {
  const { data } = await leadHttp.patch(`/${leadId}`, { status });
  return data;
}

export type LeadRequest = {
  tenant_id: string;
  session_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source_url?: string;
  lead_type?: "GENERAL" | "SALES" | "SUPPORT";
  metadata?: Record<string, unknown>;
};

export type LeadResponse = {
  id?: string;
  ok?: boolean;
  message?: string;
};

export async function submitTestLead(payload: LeadRequest): Promise<LeadResponse> {
  const { data } = await leadHttp.post<LeadResponse>("/", payload);
  return data;
}
