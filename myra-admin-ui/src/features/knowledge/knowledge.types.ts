export type KnowledgeStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export type KnowledgeSource = {
  id: string;
  tenantId: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV" | "FAQ";
  status: KnowledgeStatus;
  size?: string;
  createdAt: string;
};

export type FaqInput = {
  tenantId: string;
  question: string;
  answer: string;
};
