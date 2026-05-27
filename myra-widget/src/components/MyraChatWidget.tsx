import React, {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/* Web Speech API type shims */
interface SpeechRecognitionShim extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognitionShim };
    webkitSpeechRecognition: { new(): SpeechRecognitionShim };
  }
}
import { sendChatMessage, submitLead } from '../api/myraClient';
import type {
  LeadFormErrors,
  LeadFormState,
  LeadProfile,
  MyraChatWidgetProps,
  MyraMessage,
  MyraMode,
  QuestionSection,
  WidgetTheme,
} from '../types/myra.types';
import MyraBotAvatar from './MyraBotAvatar';
import '../styles/myra-widget.css';

const BRAND_COLOR = '#efab0a';

const DEFAULT_QUESTION_SECTIONS: QuestionSection[] = [
  {
    label: 'Recommended',
    mode: 'recruiter',
    prompts: ['What kind of engineer is Vijay?', "What are Vijay's strongest technical skills?"],
  },
  {
    label: 'Enterprise',
    mode: 'project-recommendation',
    prompts: ["Explain Vijay's JPMC fraud prevention project.", 'What cloud modernization work has Vijay done?'],
  },
  {
    label: 'Technical Deep Dive',
    mode: 'subject-matter-expert',
    prompts: ['How does Vijay build Spring Boot microservices?', 'What Kafka expertise does Vijay have?'],
  },
  {
    label: 'Recruiter Favorites',
    mode: 'recruiter',
    prompts: ['Why should a recruiter consider Vijay?', 'What roles fit Vijay best?'],
  },
];

const FOLLOW_UP_PROMPT_GROUPS = [
  { terms: ['what kind of engineer', 'kind of engineer'], prompts: ["What are Vijay's backend strengths?", 'What frontend experience does Vijay have?', 'What industries has Vijay worked in?'] },
  { terms: ['enterprise projects', 'projects has vijay', 'worked on'], prompts: ["Explain Vijay's JPMC fraud prevention project.", 'What did Vijay do at Wells Fargo?', 'Which project shows cloud modernization?'] },
  { terms: ['strongest technical skills', 'technical skills', 'skills'], prompts: ['How strong is Vijay in Java and Spring Boot?', 'What Kafka experience does Vijay have?', 'What cloud and DevOps tools has Vijay used?'] },
  { terms: ['java and spring boot', 'spring boot', 'java'], prompts: ['How does Vijay design REST APIs?', 'How does Vijay secure Spring Boot services?', 'How does Vijay tune backend performance?'] },
  { terms: ['microservices', 'scalable microservices', 'distributed'], prompts: ['How does Vijay build microservices?', 'What databases has Vijay worked with?', 'How does Vijay handle production issues?'] },
  { terms: ['cloud and devops', 'cloud', 'devops', 'aws'], prompts: ['What AWS services has Vijay used?', 'How does Vijay use Docker and Kubernetes?', 'What CI/CD tools has Vijay worked with?'] },
  { terms: ['recruiter', 'consider vijay', 'hire vijay'], prompts: ['What roles fit Vijay best?', 'What makes Vijay reliable in enterprise teams?', 'How does Vijay compare to other senior engineers?'] },
  { terms: ['roles fit', 'role fit', 'best roles'], prompts: ['Why should recruiters hire Vijay?', 'What makes Vijay reliable in enterprise teams?', 'How can I contact Vijay?'] },
  { terms: ['reliable', 'enterprise teams', 'production stability'], prompts: ['What enterprise projects has Vijay delivered?', 'What technical leadership strengths does Vijay have?', 'What monitoring tools has Vijay used?'] },
  { terms: ['technical leadership', 'leadership strengths', 'tech lead'], prompts: ['How does Vijay make architecture decisions?', 'How does Vijay handle production issues?', 'What roles fit Vijay best?'] },
  { terms: ['backend strengths', 'backend'], prompts: ['How does Vijay build microservices?', 'What databases has Vijay worked with?', 'How does Vijay handle production issues?'] },
  { terms: ['frontend experience', 'frontend', 'react'], prompts: ['How does Vijay use React and TypeScript?', 'How does Vijay connect UI to backend APIs?', 'What makes Vijay a full stack developer?'] },
  { terms: ['kafka expertise', 'kafka', 'event-driven'], prompts: ['How did Kafka fit into the JPMC project?', 'How does Vijay handle retries and reconciliation?', 'What is consumer lag in production?'] },
  { terms: ['databases', 'database', 'postgresql'], prompts: ['How does Vijay optimize SQL queries?', 'What database systems has Vijay worked with?', 'How does Vijay use JPA and Hibernate?'] },
  { terms: ['jpmc', 'fraud prevention', 'fraud'], prompts: ['How did Kafka fit into the JPMC project?', 'What did the Contact Handler service do?', 'How were customer responses reconciled?'] },
  { terms: ['product thinking', 'founder mindset'], prompts: ['How does Vijay connect engineering with product thinking?', 'What makes Vijay founder-minded?', "How does Myra support Vijay's professional brand?"] },
];

const FALLBACK_FOLLOW_UPS = [
  "Which projects show Vijay's strengths best?",
  "What are Vijay's strongest technical skills?",
  'Why should a recruiter consider Vijay?',
];

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'proton.me',
]);

const EMPTY_LEAD_FORM: LeadFormState = { name: '', email: '', mobile: '', interest: 'Recruiter / Hiring' };

/* ── Helpers ── */

function createId(prefix = 'myra') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function storageKey(tenantId: string, key: string) {
  return `myra.${tenantId}.${key}`;
}

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}

function getOrCreateSessionId(tenantId: string): string {
  const key = storageKey(tenantId, 'sessionId');
  const existing = readStorage(key);
  if (existing) return existing;
  const next = createId('session');
  writeStorage(key, next);
  return next;
}

function readMessages(tenantId: string): MyraMessage[] {
  const raw = readStorage(storageKey(tenantId, 'history'));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MyraMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function persistMessages(tenantId: string, msgs: MyraMessage[]) {
  writeStorage(storageKey(tenantId, 'history'), JSON.stringify(msgs.slice(-30)));
}

function readTheme(tenantId: string): WidgetTheme {
  const stored = readStorage(storageKey(tenantId, 'theme'));
  return stored === 'light' ? 'light' : 'dark';
}

function storeTheme(tenantId: string, theme: WidgetTheme) {
  writeStorage(storageKey(tenantId, 'theme'), theme);
}

function readLeadProfile(tenantId: string): LeadProfile | null {
  const raw = readStorage(storageKey(tenantId, 'lead'));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LeadProfile;
    if (parsed?.name && parsed?.email && parsed?.mobile) {
      return { ...parsed, interest: parsed.interest || 'Portfolio Visitor' };
    }
  } catch { /* noop */ }
  return null;
}

function storeLeadProfile(tenantId: string, lead: LeadProfile) {
  writeStorage(storageKey(tenantId, 'lead'), JSON.stringify(lead));
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidMobile(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return /^\+?[0-9][0-9\s().-]{6,24}$/.test(trimmed) && digits.length >= 7 && digits.length <= 15;
}

function emailDomain(value: string) {
  return value.trim().toLowerCase().split('@')[1] || '';
}

function getInitialMode(lead: LeadProfile | null): MyraMode {
  if (!lead) return 'recruiter';
  const interest = lead.interest.toLowerCase();
  if (interest.includes('project') || interest.includes('portfolio')) return 'project-recommendation';
  if (interest.includes('technical')) return 'subject-matter-expert';
  const domain = emailDomain(lead.email);
  if (interest.includes('recruiter') || interest.includes('employer') || (domain && !PERSONAL_EMAIL_DOMAINS.has(domain))) return 'recruiter';
  return 'portfolio';
}

function normalizePromptKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(vijay|his|he|him|what|how|does|do|is|are|can|the|a|an|and|or|to|in|with|for)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniquePrompts(prompts: string[], exclude: string[] = []) {
  const seen = new Set(exclude.map(normalizePromptKey).filter(Boolean));
  return prompts.filter((prompt) => {
    const key = normalizePromptKey(prompt);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getFollowUpPrompts(question: string) {
  const lower = question.toLowerCase();
  const matched = FOLLOW_UP_PROMPT_GROUPS.find((g) => g.terms.some((t) => lower.includes(t)));
  return uniquePrompts(matched?.prompts || FALLBACK_FOLLOW_UPS, [question]).slice(0, 3);
}

function formatTimestamp(value?: string): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
  } catch { return ''; }
}

function renderTextWithLinks(text: string): React.ReactNode[] {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const url = match[0].replace(/[),.;!?]+$/, '');
    const suffix = match[0].slice(url.length);
    nodes.push(
      <a key={`link-${match.index}`} href={url} target="_blank" rel="noreferrer" className="myra-msg-link">
        {url}
      </a>,
    );
    if (suffix) nodes.push(suffix);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function formatMessageContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {renderTextWithLinks(line)}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

/* ── SVG Icons (inline, zero deps) ── */

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function IconMinimize() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconMicOff() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .67-.09 1.32-.27 1.93" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconThumbsUp() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon myra-icon-sm">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function IconThumbsDown() {
  return (
    <svg viewBox="0 0 24 24" className="myra-icon myra-icon-sm">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

/* ── Typing Indicator ── */

function TypingIndicator({ theme, brandColor }: { theme: WidgetTheme; brandColor: string }) {
  return (
    <div className="myra-message-row myra-message-row-assistant">
      <MyraBotAvatar className="myra-msg-avatar-bot" size="small" variant="head" />
      <div className={`myra-typing-pill myra-typing-pill-${theme}`}>
        <span className="myra-typing-label">Myra is thinking</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="myra-typing-dot"
            style={{ backgroundColor: brandColor, animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Voice Hook ── */

function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionShim | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported || isListening) return;
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, isListening, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, start, stop };
}

/* ── Main Widget ── */

export default function MyraChatWidget({
  tenantId,
  apiBaseUrl,
  apiKey,
  chatServiceUrl,
  leadServiceUrl,
  assistantName = 'Myra',
  brandColor: propBrandColor,
  ownerName = 'Vijay',
  questionSections,
  position = 'bottom-right',
}: MyraChatWidgetProps) {
  const brandColor = propBrandColor || BRAND_COLOR;
  const sections = questionSections || DEFAULT_QUESTION_SECTIONS;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<MyraMessage[]>(() => readMessages(tenantId));
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId(tenantId));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<WidgetTheme>(() => readTheme(tenantId));
  const [mode, setMode] = useState<MyraMode>('recruiter');

  const [leadProfile, setLeadProfile] = useState<LeadProfile | null>(() => readLeadProfile(tenantId));
  const [leadForm, setLeadForm] = useState<LeadFormState>(EMPTY_LEAD_FORM);
  const [leadErrors, setLeadErrors] = useState<LeadFormErrors>({});
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState('');
  const [leadGreetingName, setLeadGreetingName] = useState(() => {
    const profile = readLeadProfile(tenantId);
    return profile ? getFirstName(profile.name) : '';
  });

  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([]);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [feedbackByMessage, setFeedbackByMessage] = useState<Record<string, 'up' | 'down'>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const clientConfig = { apiBaseUrl, apiKey, tenantId, chatServiceUrl, leadServiceUrl };

  const voice = useVoiceInput((text) => {
    setInput((current) => (current ? `${current} ${text}` : text));
    inputRef.current?.focus();
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen && leadProfile) inputRef.current?.focus();
  }, [isOpen, leadProfile]);

  const resizeComposer = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '48px';
    const next = Math.min(el.scrollHeight, 112);
    el.style.height = `${Math.max(48, next)}px`;
    el.style.overflowY = el.scrollHeight > 112 ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    resizeComposer();
  }, [input, isOpen, resizeComposer]);

  const updateMessages = useCallback(
    (next: MyraMessage[]) => {
      setMessages(next);
      persistMessages(tenantId, next);
    },
    [tenantId],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: MyraMessage = {
        id: createId('user'),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
        mode,
      };
      const optimistic = [...messages, userMsg];
      updateMessages(optimistic);
      setIsLoading(true);

      try {
        const response = await sendChatMessage(clientConfig, {
          message: trimmed,
          session_id: sessionId,
          tenant_id: tenantId,
          mode,
        });
        if (response.session_id && response.session_id !== sessionId) {
          setSessionId(response.session_id);
          writeStorage(storageKey(tenantId, 'sessionId'), response.session_id);
        }
        const assistantMsg: MyraMessage = {
          id: createId('assistant'),
          role: 'assistant',
          content: response.reply,
          createdAt: new Date().toISOString(),
          mode: response.mode || mode,
        };
        updateMessages([...optimistic, assistantMsg]);
      } catch {
        const errorMsg: MyraMessage = {
          id: createId('error'),
          role: 'assistant',
          content: "Sorry, I couldn't process that request. Please try again.",
          createdAt: new Date().toISOString(),
        };
        updateMessages([...optimistic, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [clientConfig, isLoading, messages, mode, sessionId, tenantId, updateMessages],
  );

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    setFollowUpPrompts(getFollowUpPrompts(trimmed));
    void handleSendMessage(trimmed);
  };

  const handlePromptClick = (prompt: string, nextMode?: MyraMode) => {
    if (isLoading) return;
    if (nextMode) setMode(nextMode);
    setInput('');
    setFollowUpPrompts(getFollowUpPrompts(prompt));
    void handleSendMessage(prompt);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') setIsOpen(false);
  };

  const handleClearChat = () => {
    const nextSessionId = createId('session');
    setSessionId(nextSessionId);
    writeStorage(storageKey(tenantId, 'sessionId'), nextSessionId);
    updateMessages([]);
    setFollowUpPrompts([]);
    setShowMoreQuestions(false);
    setLeadGreetingName(leadProfile ? getFirstName(leadProfile.name) : '');
  };

  const toggleTheme = () => {
    const next: WidgetTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storeTheme(tenantId, next);
  };

  const handleFeedback = (messageIndex: number, rating: 'up' | 'down') => {
    const message = messages[messageIndex];
    setFeedbackByMessage((current) => ({ ...current, [message.id]: rating }));
  };

  const handleLeadFieldChange = (field: keyof LeadFormState, value: string) => {
    setLeadForm((current) => ({ ...current, [field]: value }));
    setLeadSubmitError('');
    if (field !== 'interest' && leadErrors[field]) {
      setLeadErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const validateLeadForm = () => {
    const nextErrors: LeadFormErrors = {};
    if (!leadForm.name.trim()) nextErrors.name = 'Name is required.';
    if (!leadForm.email.trim()) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(leadForm.email)) nextErrors.email = 'Enter a valid email address.';
    if (!leadForm.mobile.trim()) nextErrors.mobile = 'Mobile number is required.';
    else if (!isValidMobile(leadForm.mobile))
      nextErrors.mobile = 'Include a valid number with country code if needed.';
    return nextErrors;
  };

  const handleLeadSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLeadSubmitting) return;
    const nextErrors = validateLeadForm();
    if (Object.keys(nextErrors).length) {
      setLeadErrors(nextErrors);
      setLeadSubmitError('');
      return;
    }

    const nextLead: LeadProfile = {
      name: leadForm.name.trim(),
      email: leadForm.email.trim(),
      mobile: leadForm.mobile.trim(),
      interest: leadForm.interest,
      capturedAt: new Date().toISOString(),
    };
    const nextMode = getInitialMode(nextLead);
    setLeadErrors({});
    setLeadSubmitError('');
    setIsLeadSubmitting(true);

    try {
      await submitLead(clientConfig, {
        name: nextLead.name,
        email: nextLead.email,
        mobile: nextLead.mobile,
        interest: nextLead.interest || 'portfolio-chat',
        message: `Started a ${assistantName} chat. Interest: ${nextLead.interest}. Mobile: ${nextLead.mobile}`,
        session_id: sessionId,
        tenant_id: tenantId,
      });
      storeLeadProfile(tenantId, nextLead);
      setLeadProfile(nextLead);
      setLeadGreetingName(getFirstName(nextLead.name));
      setMode(nextMode);
    } catch {
      setLeadSubmitError('Could not send your details yet. Please try again.');
    } finally {
      setIsLeadSubmitting(false);
    }
  };

  const hasUserMessages = messages.some((m) => m.role === 'user');
  const visitorName = leadGreetingName || (leadProfile ? getFirstName(leadProfile.name) : '');
  const visibleQuestionSections = showMoreQuestions ? sections : sections.slice(0, 2);
  const panelClass = isExpanded ? 'myra-panel-expanded' : 'myra-panel-compact';
  const brandStyle = { '--myra-brand': brandColor } as React.CSSProperties;

  return (
    <div className="myra-widget-root" style={brandStyle}>
      {isOpen && (
        <section
          role="dialog"
          aria-label={`${assistantName} assistant`}
          className={`myra-panel ${panelClass} myra-panel-${position} myra-theme-${theme}`}
          data-expanded={isExpanded}
        >
          <div className="myra-panel-frame">
            {/* Controls row */}
            <div className="myra-panel-controls">
              <button
                type="button"
                onClick={toggleTheme}
                className="myra-control-btn"
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((c) => !c)}
                className="myra-control-btn"
                aria-label={isExpanded ? 'Minimize' : 'Expand'}
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <IconMinimize /> : <IconExpand />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="myra-control-btn"
                aria-label="Close"
                title="Close"
              >
                <IconX />
              </button>
            </div>

            <div className="myra-cockpit">
              <div className="myra-chat-console">
                {/* Status header with avatar */}
                <div className="myra-status-line">
                  <MyraBotAvatar className="myra-status-avatar" size="medium" variant="head" />
                  <div className="myra-status-copy">
                    <span className="myra-status-title" style={{ color: brandColor }}>
                      {assistantName.toUpperCase()} | {ownerName.toUpperCase()}&rsquo;S AI ASSISTANT
                    </span>
                  </div>
                </div>

                {/* Lead capture or chat view */}
                {!leadProfile ? (
                  <div className="myra-lead-screen">
                    <form
                      onSubmit={handleLeadSubmit}
                      className={`myra-lead-card myra-lead-card-${theme}`}
                      noValidate
                    >
                      <MyraBotAvatar className="myra-lead-avatar" size="medium" variant="head" />
                      <div className="myra-lead-intro">
                        <h2>Hi, I&apos;m {assistantName}.</h2>
                        <p>
                          Welcome. Before chatting, tell us where to send {ownerName}&apos;s
                          professional insights and future updates.
                        </p>
                      </div>
                      <div className="myra-lead-fields">
                        <label>
                          <span>Full Name</span>
                          <input
                            type="text"
                            value={leadForm.name}
                            onChange={(e) => handleLeadFieldChange('name', e.target.value)}
                            autoComplete="name"
                            placeholder="Your name"
                            aria-invalid={Boolean(leadErrors.name)}
                          />
                          {leadErrors.name && <small>{leadErrors.name}</small>}
                        </label>
                        <label>
                          <span>Email</span>
                          <input
                            type="email"
                            value={leadForm.email}
                            onChange={(e) => handleLeadFieldChange('email', e.target.value)}
                            autoComplete="email"
                            placeholder="you@example.com"
                            aria-invalid={Boolean(leadErrors.email)}
                          />
                          {leadErrors.email && <small>{leadErrors.email}</small>}
                        </label>
                        <label>
                          <span>Mobile Number</span>
                          <input
                            type="tel"
                            value={leadForm.mobile}
                            onChange={(e) => handleLeadFieldChange('mobile', e.target.value)}
                            autoComplete="tel"
                            placeholder="+1 555 123 4567"
                            aria-invalid={Boolean(leadErrors.mobile)}
                          />
                          {leadErrors.mobile && <small>{leadErrors.mobile}</small>}
                        </label>
                        <label>
                          <span>Interest</span>
                          <select
                            value={leadForm.interest}
                            onChange={(e) => handleLeadFieldChange('interest', e.target.value)}
                            aria-label="Conversation interest"
                          >
                            <option>Recruiter / Hiring</option>
                            <option>Employer / Technical Team</option>
                            <option>Project / Consulting</option>
                            <option>Portfolio Visitor</option>
                          </select>
                        </label>
                      </div>
                      {leadSubmitError && (
                        <div className="myra-lead-error" role="alert">
                          {leadSubmitError}
                        </div>
                      )}
                      <button
                        type="submit"
                        className="myra-lead-submit"
                        disabled={isLeadSubmitting}
                        style={{ backgroundColor: brandColor }}
                      >
                        {isLeadSubmitting ? 'Sending...' : 'Start Chat'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    {/* Chat transcript */}
                    <div className="myra-transcript" aria-live="polite">
                      <div className="myra-message-stack">
                        {!hasUserMessages && (
                          <div className="myra-guided-start">
                            <div className="myra-compact-greeting">
                              <strong>Thanks, {visitorName}.</strong>
                              <span>How can I help you today?</span>
                            </div>
                            <div className="myra-question-sections">
                              {visibleQuestionSections.map((section) => (
                                <div key={section.label} className="myra-prompt-section">
                                  <p className="myra-prompt-section-label">{section.label}</p>
                                  <div className="myra-prompt-grid">
                                    {uniquePrompts(section.prompts).map((prompt) => (
                                      <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => handlePromptClick(prompt, section.mode)}
                                        disabled={isLoading}
                                        className="myra-prompt-chip"
                                      >
                                        {prompt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="myra-view-more-btn"
                              onClick={() => setShowMoreQuestions((c) => !c)}
                            >
                              {showMoreQuestions ? 'Show fewer questions' : 'View more questions'}
                            </button>
                          </div>
                        )}

                        {messages.map((msg, index) => {
                          const ts = formatTimestamp(msg.createdAt);
                          return (
                            <div
                              key={msg.id}
                              className={`myra-message-row myra-message-row-${msg.role}`}
                            >
                              {msg.role === 'assistant' && (
                                <MyraBotAvatar
                                  className="myra-msg-avatar-bot"
                                  size="small"
                                  variant="head"
                                />
                              )}
                              <div
                                className={`myra-msg-bubble myra-msg-bubble-${msg.role}`}
                                style={msg.role === 'user' ? { backgroundColor: brandColor } : undefined}
                              >
                                {formatMessageContent(msg.content)}
                                <div className="myra-msg-meta">
                                  {ts && <span className="myra-msg-time">{ts}</span>}
                                  {msg.role === 'assistant' && index > 0 && (
                                    <div className="myra-feedback-row">
                                      <button
                                        type="button"
                                        onClick={() => handleFeedback(index, 'up')}
                                        className={`myra-feedback-btn ${feedbackByMessage[msg.id] === 'up' ? 'myra-feedback-active' : ''}`}
                                        aria-label="Helpful"
                                        title="Helpful"
                                        style={
                                          feedbackByMessage[msg.id] === 'up'
                                            ? { color: brandColor }
                                            : undefined
                                        }
                                      >
                                        <IconThumbsUp />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleFeedback(index, 'down')}
                                        className={`myra-feedback-btn ${feedbackByMessage[msg.id] === 'down' ? 'myra-feedback-active' : ''}`}
                                        aria-label="Needs improvement"
                                        title="Needs improvement"
                                        style={
                                          feedbackByMessage[msg.id] === 'down'
                                            ? { color: brandColor }
                                            : undefined
                                        }
                                      >
                                        <IconThumbsDown />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {isLoading && <TypingIndicator theme={theme} brandColor={brandColor} />}

                        {!isLoading && hasUserMessages && followUpPrompts.length > 0 && (
                          <div className="myra-followup-panel">
                            {followUpPrompts.map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                onClick={() => handlePromptClick(prompt)}
                                className="myra-followup-chip"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Composer footer */}
                    <div className="myra-composer-footer">
                      <div className="myra-composer-toolbar">
                        <button
                          type="button"
                          onClick={handleClearChat}
                          className="myra-clear-btn"
                          title="Clear chat"
                          aria-label="Clear chat"
                        >
                          <IconTrash />
                        </button>
                      </div>
                      <form
                        onSubmit={handleSubmit}
                        className={`myra-input-row myra-input-row-${theme}`}
                      >
                        <button
                          type="button"
                          onClick={voice.isListening ? voice.stop : voice.start}
                          disabled={!voice.isSupported}
                          className={`myra-composer-btn myra-composer-btn-secondary ${voice.isListening ? 'myra-composer-btn-active' : ''}`}
                          aria-label={voice.isListening ? 'Stop voice input' : 'Start voice input'}
                          title={
                            voice.isSupported
                              ? voice.isListening
                                ? 'Stop voice input'
                                : 'Voice input'
                              : 'Voice input unavailable'
                          }
                        >
                          {voice.isListening ? <IconMicOff /> : <IconMic />}
                        </button>
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          rows={1}
                          className="myra-composer-input"
                          placeholder={`Ask about ${ownerName}'s experience, skills, projects, or career journey.`}
                          disabled={isLoading}
                          aria-label={`Message ${assistantName}`}
                        />
                        <button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          className="myra-composer-send"
                          style={{ backgroundColor: brandColor }}
                          aria-label="Send message"
                          title="Send"
                        >
                          <IconSend />
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Launcher FAB with robot avatar */}
      {!isOpen && (
        <button
          type="button"
          className={`myra-hologram-button myra-launcher-${position}`}
          onClick={() => setIsOpen(true)}
          aria-label={`Open ${assistantName} assistant`}
          aria-expanded={false}
        >
          <span className="myra-hologram-shell" aria-hidden="true">
            <MyraBotAvatar className="myra-launcher-avatar" size="large" variant="head" />
          </span>
        </button>
      )}
    </div>
  );
}
