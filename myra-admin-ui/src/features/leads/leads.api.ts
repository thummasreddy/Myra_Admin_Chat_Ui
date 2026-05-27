import { apiClient, isBackendUnavailable } from "@/lib/apiClient";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  tenantName: string;
  createdAt: string;
};

const fallbackLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Ananya Rao",
    email: "ananya@example.com",
    phone: "+1 602 555 0192",
    message: "Interested in a custom chatbot for my consulting site.",
    tenantName: "VThumma Portfolio",
    createdAt: "2026-05-24T13:30:00.000Z"
  },
  {
    id: "lead_2",
    name: "Michael Chen",
    email: "mchen@example.com",
    phone: "+1 480 555 0148",
    message: "Please send pricing for lead capture and analytics.",
    tenantName: "Acme Dental",
    createdAt: "2026-05-23T17:10:00.000Z"
  }
];

export async function listLeads(): Promise<Lead[]> {
  try {
    const { data } = await apiClient.get<Lead[]>("/leads");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return fallbackLeads;
  }
}
