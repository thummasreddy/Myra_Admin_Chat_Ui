export type MyraMode =
  | 'portfolio'
  | 'recruiter'
  | 'subject-matter-expert'
  | 'project-recommendation'
  | 'business-vision'
  | 'interview-preparation'
  | 'architecture'
  | 'resume-deep-dive'
  | 'startup-exploration';

export type MyraMessageRole = 'assistant' | 'user';

export type WidgetTheme = 'dark' | 'light';

export interface MyraAction {
  id: string;
  type: 'section' | 'route' | 'link';
  label: string;
  target: string;
}

export interface MyraMessage {
  id: string;
  role: MyraMessageRole;
  content: string;
  createdAt: string;
  mode?: MyraMode;
  actions?: MyraAction[];
}

export interface MyraChatRequest {
  message: string;
  session_id: string;
  tenant_id: string;
  mode?: MyraMode;
}

export interface MyraChatResponse {
  reply: string;
  session_id: string;
  mode?: MyraMode;
  suggestedPrompts?: string[];
}

export interface MyraLeadRequest {
  name: string;
  email: string;
  mobile: string;
  interest: string;
  message?: string;
  session_id: string;
  tenant_id: string;
}

export interface MyraLeadResponse {
  ok: boolean;
  message: string;
}

export type LeadFormState = {
  name: string;
  email: string;
  mobile: string;
  interest: string;
};

export type LeadProfile = LeadFormState & {
  capturedAt: string;
};

export type LeadFormErrors = Partial<Record<Exclude<keyof LeadFormState, 'interest'>, string>>;

export type QuestionSection = {
  label: string;
  mode: MyraMode;
  prompts: string[];
};

export interface MyraChatWidgetProps {
  tenantId: string;
  apiBaseUrl: string;
  apiKey: string;
  chatServiceUrl?: string;
  leadServiceUrl?: string;
  assistantName?: string;
  brandColor?: string;
  ownerName?: string;
  questionSections?: QuestionSection[];
  position?: 'bottom-right' | 'bottom-left';
}
