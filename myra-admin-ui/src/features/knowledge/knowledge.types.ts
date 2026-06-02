export type KnowledgeStatus = "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "PROCESSING" | "READY" | "REJECTED" | "FAILED";

export type KnowledgeSource = {
  id: string;
  tenantId: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV" | "FAQ" | "WEBSITE";
  status: KnowledgeStatus;
  size?: string;
  reviewNotes?: string;
  uploadedBy?: string;
  createdAt: string;
};

export type FaqInput = {
  tenantId: string;
  question: string;
  answer: string;
};
