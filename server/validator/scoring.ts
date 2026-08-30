import {
  ValidationStatus,
  RiskLevel,
  SyntaxResult,
  DNSResult,
  DisposableResult,
  CatchAllResult,
  SMTPResult,
  ScoringResult,
} from "../types";

export function calculateScore(
  syntax: SyntaxResult,
  dns: DNSResult | null,
  disposable: DisposableResult | null,
  catchAll: CatchAllResult | null,
  smtp: SMTPResult | null
): { scoring: ScoringResult; status: ValidationStatus } {
  let score = 100;
  const breakdown: Record<string, number> = { base: 100 };
  const warnings: string[] = [];

  // Layer 1: Syntax
  if (!syntax.passed) {
    score -= 50;
    breakdown.syntax = -50;
    warnings.push(syntax.error || "Invalid email syntax format");
  }

  // Layer 2 & 3: DNS
  if (dns) {
    if (!dns.domain_exists) {
      score -= 30;
      breakdown.domain_not_found = -30;
      warnings.push("Domain does not exist or has no valid DNS records");
    } else if (!dns.has_mx_records) {
      score -= 20;
      breakdown.no_mx = -20;
      warnings.push("No MX records found — domain cannot receive email");
    }

    if (dns.has_spf) {
      score += 3;
      breakdown.has_spf = 3;
    } else if (dns.domain_exists) {
      warnings.push("No SPF record found — domain has higher spam risk");
    }

    if (dns.has_dmarc) {
      score += 3;
      breakdown.has_dmarc = 3;
    } else if (dns.domain_exists) {
      warnings.push("No DMARC record configured");
    }

    if (dns.has_dkim) {
      score += 2;
      breakdown.has_dkim = 2;
    }
  }

  // Layer 4: Disposable & Role
  if (disposable) {
    if (disposable.is_disposable) {
      score -= 40;
      breakdown.disposable = -40;
      warnings.push("Disposable/temporary email domain detected");
    }
    if (disposable.is_role_based) {
      score -= 10;
      breakdown.role_based = -10;
      warnings.push("Role-based email address (admin@, info@, etc.) — lower engagement rate");
    }
    if (disposable.is_free_provider) {
      score -= 5;
      breakdown.free_provider = -5;
    }
  }

  // Layer 5: Catch-All
  if (catchAll?.is_catch_all) {
    score -= 20;
    breakdown.catch_all = -20;
    warnings.push("Catch-all domain — mailbox cannot be verified individually");
  }

  // Layer 6: SMTP
  if (smtp) {
    if (smtp.verified === true) {
      score += 10;
      breakdown.smtp_verified = 10;
    } else if (smtp.verified === false) {
      score -= 30;
      breakdown.smtp_failed = -30;
      warnings.push(
        `Mailbox does not exist (SMTP ${smtp.smtp_code || 550}: ${smtp.error || "rejected"})`
      );
    } else if (smtp.error) {
      score -= 5;
      breakdown.smtp_inconclusive = -5;
      warnings.push(`SMTP verification inconclusive: ${smtp.error}`);
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status: ValidationStatus;
  if (!syntax.passed || (dns && !dns.domain_exists) || smtp?.verified === false) {
    status = ValidationStatus.INVALID;
  } else if (score >= 75) {
    status = ValidationStatus.VALID;
  } else if (score >= 45) {
    status = ValidationStatus.RISKY;
  } else if (score > 0) {
    status = ValidationStatus.UNKNOWN;
  } else {
    status = ValidationStatus.INVALID;
  }

  // Determine risk level
  let riskLevel: RiskLevel;
  if (score >= 75) {
    riskLevel = RiskLevel.LOW;
  } else if (score >= 45) {
    riskLevel = RiskLevel.MEDIUM;
  } else {
    riskLevel = RiskLevel.HIGH;
  }

  return {
    scoring: {
      score,
      risk_level: riskLevel,
      breakdown,
      warnings,
    },
    status,
  };
}
