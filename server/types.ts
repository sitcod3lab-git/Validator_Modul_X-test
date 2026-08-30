export enum ValidationStatus {
  VALID = "valid",
  INVALID = "invalid",
  RISKY = "risky",
  UNKNOWN = "unknown",
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface SyntaxResult {
  passed: boolean;
  normalized_email?: string | null;
  local_part?: string | null;
  domain?: string | null;
  error?: string | null;
}

export interface MXRecord {
  host: string;
  priority: number;
}

export interface DNSResult {
  domain_exists: boolean;
  has_mx_records: boolean;
  mx_records: MXRecord[];
  has_spf: boolean;
  spf_record?: string | null;
  has_dmarc: boolean;
  dmarc_record?: string | null;
  has_dkim: boolean;
  error?: string | null;
}

export interface DisposableResult {
  is_disposable: boolean;
  is_free_provider: boolean;
  is_role_based: boolean;
  provider_name?: string | null;
}

export interface CatchAllResult {
  is_catch_all: boolean;
  confidence: number;
  error?: string | null;
}

export interface SMTPResult {
  verified?: boolean | null;
  smtp_code?: number | null;
  smtp_message?: string | null;
  server_banner?: string | null;
  supports_tls: boolean;
  error?: string | null;
  via_proxy: boolean;
}

export interface ScoringResult {
  score: number;
  risk_level: RiskLevel;
  breakdown: Record<string, number>;
  warnings: string[];
}

export interface ValidationResult {
  email: string;
  status: ValidationStatus;
  syntax: SyntaxResult;
  dns?: DNSResult | null;
  disposable?: DisposableResult | null;
  catch_all?: CatchAllResult | null;
  smtp?: SMTPResult | null;
  scoring: ScoringResult;
  processing_time_ms: number;
  validated_at: string;
}

export interface BulkTask {
  id: string;
  status: "pending" | "processing" | "completed" | "failure";
  total: number;
  progress: number;
  results: ValidationResult[];
  created_at: string;
  completed_at?: string;
  error?: string;
}
