import { SyntaxResult } from "../types";

// RFC 5322 compliant regex for practical email validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

export function validateSyntax(rawEmail: string): SyntaxResult {
  if (!rawEmail || typeof rawEmail !== "string") {
    return { passed: false, error: "Email address is required" };
  }

  const email = rawEmail.trim();

  if (email.length === 0) {
    return { passed: false, error: "Email address cannot be empty" };
  }

  if (email.length > 254) {
    return { passed: false, error: "Email exceeds maximum length of 254 characters" };
  }

  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === email.length - 1) {
    return { passed: false, error: "Email must contain a valid local-part and domain separated by '@'" };
  }

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);

  if (localPart.length > 64) {
    return { passed: false, error: "Local-part exceeds maximum length of 64 characters" };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { passed: false, error: "Local-part cannot start or end with a period" };
  }

  if (localPart.includes("..")) {
    return { passed: false, error: "Local-part cannot contain consecutive periods" };
  }

  if (domainPart.length > 253) {
    return { passed: false, error: "Domain part exceeds maximum length of 253 characters" };
  }

  if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
    return { passed: false, error: "Domain part cannot start or end with a period" };
  }

  if (domainPart.includes("..")) {
    return { passed: false, error: "Domain part cannot contain consecutive periods" };
  }

  const domainLabels = domainPart.split(".");
  if (domainLabels.length < 2) {
    return { passed: false, error: "Domain must contain a valid top-level domain (TLD)" };
  }

  for (const label of domainLabels) {
    if (!label || label.length > 63) {
      return { passed: false, error: "Domain labels must be between 1 and 63 characters" };
    }
    if (!DOMAIN_LABEL_REGEX.test(label)) {
      return { passed: false, error: `Invalid characters in domain label: "${label}"` };
    }
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (/^\d+$/.test(tld)) {
    return { passed: false, error: "Top-level domain (TLD) cannot be purely numeric" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { passed: false, error: "Email syntax violates standard RFC formatting" };
  }

  const normalizedDomain = domainPart.toLowerCase();
  const normalizedEmail = `${localPart}@${normalizedDomain}`;

  return {
    passed: true,
    normalized_email: normalizedEmail,
    local_part: localPart,
    domain: normalizedDomain,
    error: null,
  };
}
