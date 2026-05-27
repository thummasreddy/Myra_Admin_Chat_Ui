import { apiClient, isBackendUnavailable } from "@/lib/apiClient";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  fallback?: boolean;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  tenantId: string;
  tenantName: string;
  visitorName: string;
  status: "OPEN" | "CLOSED";
  confidence: number;
  fallbackCount: number;
  createdAt: string;
  messages: ChatMessage[];
};

const fallbackSessions: ChatSession[] = [
  {
    id: "chat_1001",
    tenantId: "tenant_vthumma",
    tenantName: "VThumma Portfolio",
    visitorName: "Sarah K.",
    status: "CLOSED",
    confidence: 0.92,
    fallbackCount: 0,
    createdAt: "2026-05-24T19:12:00.000Z",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "What projects has Vijay built?",
        createdAt: "2026-05-24T19:12:00.000Z"
      },
      {
        id: "m2",
        role: "assistant",
        content: "Vijay has built SaaS dashboards, chatbot widgets, and portfolio automation projects.",
        confidence: 0.92,
        createdAt: "2026-05-24T19:12:02.000Z"
      }
    ]
  },
  {
    id: "chat_1002",
    tenantId: "tenant_acme_dental",
    tenantName: "Acme Dental",
    visitorName: "Jordan P.",
    status: "OPEN",
    confidence: 0.61,
    fallbackCount: 1,
    createdAt: "2026-05-25T15:45:00.000Z",
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Can I get a diagnosis for tooth pain?",
        createdAt: "2026-05-25T15:45:00.000Z"
      },
      {
        id: "m4",
        role: "assistant",
        content: "I cannot diagnose symptoms, but I can help you contact the office or book an appointment.",
        confidence: 0.61,
        fallback: true,
        createdAt: "2026-05-25T15:45:03.000Z"
      }
    ]
  }
];

export async function listConversations(tenantId?: string): Promise<ChatSession[]> {
  try {
    const { data } = await apiClient.get<ChatSession[]>("/chat/sessions", { params: { tenantId } });
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return fallbackSessions.filter((session) => !tenantId || session.tenantId === tenantId);
  }
}
