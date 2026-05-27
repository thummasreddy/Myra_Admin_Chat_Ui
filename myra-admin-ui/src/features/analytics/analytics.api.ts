import { apiClient, isBackendUnavailable } from "@/lib/apiClient";

export type TimeSeriesPoint = {
  label: string;
  conversations: number;
  leads: number;
};

export type AnalyticsSummary = {
  timeline: TimeSeriesPoint[];
  topQuestions: { question: string; count: number }[];
  failedResponseCount: number;
  tenantUsage: { tenantName: string; conversations: number }[];
};

const fallbackAnalytics: AnalyticsSummary = {
  timeline: [
    { label: "May 19", conversations: 92, leads: 8 },
    { label: "May 20", conversations: 118, leads: 10 },
    { label: "May 21", conversations: 136, leads: 12 },
    { label: "May 22", conversations: 121, leads: 9 },
    { label: "May 23", conversations: 148, leads: 16 },
    { label: "May 24", conversations: 172, leads: 22 },
    { label: "May 25", conversations: 161, leads: 19 }
  ],
  topQuestions: [
    { question: "What projects has Vijay built?", count: 58 },
    { question: "How can I contact support?", count: 44 },
    { question: "What services do you offer?", count: 39 },
    { question: "Can I book an appointment?", count: 27 }
  ],
  failedResponseCount: 41,
  tenantUsage: [
    { tenantName: "VThumma Portfolio", conversations: 520 },
    { tenantName: "Acme Dental", conversations: 348 },
    { tenantName: "Bright Law", conversations: 240 },
    { tenantName: "Northstar SaaS", conversations: 185 }
  ]
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const { data } = await apiClient.get<AnalyticsSummary>("/analytics");
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return fallbackAnalytics;
  }
}
