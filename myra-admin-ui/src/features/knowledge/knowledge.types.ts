export type ScanStatus =
  | "PENDING_CRAWL"
  | "CRAWLING"
  | "CRAWL_COMPLETED"
  | "CRAWL_FAILED"
  | "DRAFT_GENERATED"
  | "TENANT_REVIEW_REQUIRED"
  | "APPROVED_SOURCE_OF_TRUTH"
  | "REJECTED"
  | "SUPERSEDED";

export type DocumentExtractionStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "EXTRACTION_COMPLETED"
  | "EXTRACTION_FAILED"
  | "DRAFT_GENERATED"
  | "TENANT_REVIEW_REQUIRED"
  | "APPROVED_SOURCE_OF_TRUTH"
  | "REJECTED"
  | "SUPERSEDED";

export type DifferenceSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DifferenceType =
  | "MATCH"
  | "CONFLICT"
  | "MISSING_IN_WEBSITE"
  | "MISSING_IN_DOCUMENT"
  | "NEEDS_TENANT_REVIEW"
  | "LOW_CONFIDENCE_MATCH";
export type DifferenceCategory =
  | "PRICING"
  | "CONTACT_INFO"
  | "BUSINESS_HOURS"
  | "ADDRESS"
  | "SERVICES"
  | "PRODUCTS"
  | "POLICY"
  | "REFUND"
  | "DELIVERY"
  | "FAQ"
  | "LEGAL"
  | "OTHER";
export type ResolutionStatus =
  | "OPEN"
  | "ACCEPTED_WEBSITE_VALUE"
  | "ACCEPTED_DOCUMENT_VALUE"
  | "CUSTOM_VALUE_PROVIDED"
  | "MARKED_NOT_APPLICABLE"
  | "RESOLVED"
  | "REJECTED";
export type ComparisonStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type KnowledgeVersionStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED_SOURCE_OF_TRUTH" | "SUPERSEDED" | "REJECTED";

export interface WebsiteScan {
  scan_id: string;
  tenant_id: string;
  website_url: string;
  status: ScanStatus;
  max_pages: number;
  max_depth: number;
  pages_discovered: number;
  pages_crawled: number;
  pages_failed: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ScanPage {
  id: string;
  scan_id: string;
  page_url: string;
  page_title: string | null;
  extracted_text: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface UploadedDocument {
  upload_id: string;
  tenant_id: string;
  original_file_name: string;
  file_type: string;
  file_size: number;
  extraction_status: DocumentExtractionStatus;
  document_type: string | null;
  uploaded_at: string;
  extracted_text?: string | null;
}

export interface KnowledgeComparison {
  comparison_id: string;
  tenant_id: string;
  website_scan_id: string;
  status: ComparisonStatus;
  total_differences: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface KnowledgeDifference {
  difference_id: string;
  comparison_id: string;
  category: DifferenceCategory;
  difference_type: DifferenceType;
  severity: DifferenceSeverity;
  title: string;
  description: string | null;
  website_value: string | null;
  document_value: string | null;
  website_source_url: string | null;
  document_source_name: string | null;
  recommendation: string | null;
  resolution_status: ResolutionStatus;
  resolved_value: string | null;
  resolution_notes: string | null;
}

export interface KnowledgeVersion {
  version_id: string;
  tenant_id: string;
  version_number: number;
  status: KnowledgeVersionStatus;
  content_hash: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface KnowledgeApproval {
  approval_id: string;
  tenant_id: string;
  knowledge_version_id: string;
  approver_name: string;
  approver_email: string;
  approver_role: string | null;
  approval_status: string;
  approved_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages?: number;
}

export type DifferenceFilters = {
  category?: DifferenceCategory;
  severity?: DifferenceSeverity;
  resolution_status?: ResolutionStatus;
};

export type DifferenceResolutionPayload = {
  resolution_status: Exclude<ResolutionStatus, "OPEN">;
  resolved_value?: string | null;
  resolution_notes?: string | null;
};

export type ApprovalPayload = {
  tenant_id: string;
  knowledge_version_id: string;
  approver_name: string;
  approver_email: string;
  approver_role?: string | null;
  approval_status: "APPROVED";
  confirmation_text: string;
  approval_notes?: string | null;
};

export type ComparisonMode = "STRICT" | "BALANCED" | "LENIENT" | string;

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
