import { chatHttp } from "@/api/httpClient";

export type ChatRequest = {
  tenant_id: string;
  session_id: string;
  message: string;
  source_url?: string;
  metadata?: Record<string, unknown>;
};

export type ChatResponse = {
  session_id: string;
  user_message_id?: string;
  assistant_message_id?: string;
  reply: string;
  confidence_score?: number;
  source_documents?: unknown[];
  suggested_prompts?: string[];
};

export async function sendTestChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await chatHttp.post<ChatResponse>("/message", payload);
  return data;
}
