import type { ChatPosition } from "@/features/tenants/tenant.types";

export type WidgetConfig = {
  tenantId: string;
  assistantName: string;
  assistantIntro: string;
  brandColor: string;
  chatPosition: ChatPosition;
  launcherLabel: string;
  welcomeMessage: string;
  enableLeadCapture: boolean;
  enableSuggestedPrompts: boolean;
};
