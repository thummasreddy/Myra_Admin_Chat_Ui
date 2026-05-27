import type {
  MyraChatRequest,
  MyraChatResponse,
  MyraLeadRequest,
  MyraLeadResponse,
} from '../types/myra.types';

interface MyraClientConfig {
  apiBaseUrl: string;
  apiKey: string;
  tenantId: string;
  chatServiceUrl?: string;
  leadServiceUrl?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      const details = asRecord(payload);
      if (details) {
        message =
          (typeof details.message === 'string' && details.message) ||
          (typeof details.error === 'string' && details.error) ||
          (typeof details.detail === 'string' && details.detail) ||
          message;
      }
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  return response.json();
}

export function sendChatMessage(
  config: MyraClientConfig,
  request: MyraChatRequest
): Promise<MyraChatResponse> {
  const chatBaseUrl = normalizeBaseUrl(config.chatServiceUrl || `${normalizeBaseUrl(config.apiBaseUrl)}/api/chat`);
  const url = `${chatBaseUrl}/message`;
  return postJson(url, request, {
    'x-api-key': config.apiKey,
    'x-tenant-id': config.tenantId,
  }).then((payload) => {
    const record = asRecord(payload);
    if (!record) throw new Error('Invalid chat response payload');

    const envelopeData = asRecord(record.data);
    if (
      envelopeData &&
      typeof envelopeData.assistant_message === 'string' &&
      typeof envelopeData.session_id === 'string'
    ) {
      return {
        reply: envelopeData.assistant_message,
        session_id: envelopeData.session_id,
        suggestedPrompts: asStringArray(envelopeData.suggested_prompts),
      };
    }

    if (typeof record.reply === 'string' && typeof record.session_id === 'string') {
      return {
        reply: record.reply,
        session_id: record.session_id,
        suggestedPrompts: asStringArray(record.suggestedPrompts),
      };
    }

    throw new Error('Invalid chat response shape');
  });
}

export function submitLead(
  config: MyraClientConfig,
  request: MyraLeadRequest
): Promise<MyraLeadResponse> {
  const leadBaseUrl = normalizeBaseUrl(config.leadServiceUrl || `${normalizeBaseUrl(config.apiBaseUrl)}/api/leads`);
  const payload = {
    tenant_id: request.tenant_id,
    session_id: request.session_id,
    name: request.name,
    email: request.email,
    phone: request.mobile,
    message: request.message || request.interest,
    source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    metadata: {
      interest: request.interest,
    },
  };
  return postJson(leadBaseUrl, payload, {
    'x-api-key': config.apiKey,
    'x-tenant-id': config.tenantId,
  }).then((responsePayload) => {
    const record = asRecord(responsePayload);
    if (!record) throw new Error('Invalid lead response payload');

    if (typeof record.ok === 'boolean') {
      return {
        ok: record.ok,
        message: typeof record.message === 'string' ? record.message : 'Lead capture completed',
      };
    }

    if (record.success === true) {
      return {
        ok: true,
        message: typeof record.message === 'string' ? record.message : 'Lead captured successfully',
      };
    }

    throw new Error('Invalid lead response shape');
  });
}
