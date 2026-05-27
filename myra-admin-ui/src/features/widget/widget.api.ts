import { apiClient, isBackendUnavailable } from "@/lib/apiClient";
import type { WidgetConfig } from "@/features/widget/widget.types";
import { getTenant } from "@/features/tenants/tenant.api";

const STORAGE_KEY = "myra-admin-fallback-widget-configs";

function readConfigs() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {} as Record<string, WidgetConfig>;
  try {
    return JSON.parse(raw) as Record<string, WidgetConfig>;
  } catch {
    return {};
  }
}

function writeConfigs(configs: Record<string, WidgetConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export async function getWidgetConfig(tenantId: string): Promise<WidgetConfig> {
  try {
    const { data } = await apiClient.get<WidgetConfig>(`/widget-config/${tenantId}`);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const saved = readConfigs()[tenantId];
    if (saved) return saved;
    const tenant = await getTenant(tenantId);
    return {
      tenantId,
      assistantName: tenant.assistantName,
      assistantIntro: tenant.assistantIntro,
      brandColor: tenant.brandColor,
      chatPosition: tenant.chatPosition,
      launcherLabel: "Chat with Myra",
      welcomeMessage: tenant.assistantIntro,
      enableLeadCapture: tenant.enableLeadCapture,
      enableSuggestedPrompts: tenant.enableSuggestedPrompts
    };
  }
}

export async function updateWidgetConfig(tenantId: string, payload: WidgetConfig): Promise<WidgetConfig> {
  try {
    const { data } = await apiClient.put<WidgetConfig>(`/widget-config/${tenantId}`, payload);
    return data;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const configs = readConfigs();
    configs[tenantId] = payload;
    writeConfigs(configs);
    return payload;
  }
}
