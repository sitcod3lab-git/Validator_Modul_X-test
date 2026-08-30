import { v4 as uuidv4 } from "uuid";
import { validateSyntax } from "./syntax";
import { checkDNS } from "./dns";
import { checkDisposableAndRole } from "./disposable";
import { verifyMailboxSMTP } from "./smtp";
import { calculateScore } from "./scoring";
import {
  ValidationResult,
  ValidationStatus,
  BulkTask,
} from "../types";

// In-memory cache for validated emails (TTL: 10 minutes)
interface CacheEntry {
  result: ValidationResult;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

// In-memory store for bulk tasks
export const bulkTasks = new Map<string, BulkTask>();

export class ValidationEngine {
  /**
   * Validate a single email across all 7 layers.
   */
  public static async validate(
    email: string,
    deep = true,
    bypassCache = false
  ): Promise<ValidationResult> {
    const startTime = performance.now();
    const cacheKey = `${email.toLowerCase().trim()}:${deep}`;

    if (!bypassCache) {
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.result;
      }
    }

    // Layer 1: Syntax Validation
    const syntax = validateSyntax(email);
    if (!syntax.passed) {
      const { scoring, status } = calculateScore(syntax, null, null, null, null);
      const processingTime = performance.now() - startTime;
      const res: ValidationResult = {
        email,
        status,
        syntax,
        dns: null,
        disposable: null,
        catch_all: null,
        smtp: null,
        scoring,
        processing_time_ms: processingTime,
        validated_at: new Date().toISOString(),
      };
      cache.set(cacheKey, { result: res, expiresAt: Date.now() + CACHE_TTL_MS });
      return res;
    }

    const domain = syntax.domain!;
    const localPart = syntax.local_part!;

    // Layer 2, 3, 4: DNS & Disposable in parallel
    const [dnsResult, disposableResult] = await Promise.all([
      checkDNS(domain),
      Promise.resolve(checkDisposableAndRole(localPart, domain)),
    ]);

    let smtpResult = null;
    let catchAllResult = null;

    // Layer 5, 6, 7: SMTP & Catch-All (only if deep is requested and DNS exists)
    if (deep && dnsResult.domain_exists && dnsResult.has_mx_records) {
      try {
        const smtpCheck = await verifyMailboxSMTP(
          syntax.normalized_email || email,
          dnsResult.mx_records
        );
        smtpResult = smtpCheck.smtp;
        catchAllResult = smtpCheck.catchAll;
      } catch (err: any) {
        smtpResult = {
          verified: null,
          smtp_code: null,
          smtp_message: null,
          server_banner: null,
          supports_tls: false,
          error: err?.message || "SMTP check failed",
          via_proxy: false,
        };
      }
    }

    // Layer 7: Scoring
    const { scoring, status } = calculateScore(
      syntax,
      dnsResult,
      disposableResult,
      catchAllResult,
      smtpResult
    );

    const processingTime = performance.now() - startTime;
    const finalResult: ValidationResult = {
      email: syntax.normalized_email || email,
      status,
      syntax,
      dns: dnsResult,
      disposable: disposableResult,
      catch_all: catchAllResult,
      smtp: smtpResult,
      scoring,
      processing_time_ms: processingTime,
      validated_at: new Date().toISOString(),
    };

    cache.set(cacheKey, {
      result: finalResult,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return finalResult;
  }

  /**
   * Create and start a bulk validation job in background.
   */
  public static createBulkTask(emails: string[]): BulkTask {
    const taskId = uuidv4();
    const task: BulkTask = {
      id: taskId,
      status: "processing",
      total: emails.length,
      progress: 0,
      results: [],
      created_at: new Date().toISOString(),
    };

    bulkTasks.set(taskId, task);

    // Process asynchronously with concurrency control
    this.processBulkQueue(task, emails);

    return task;
  }

  private static async processBulkQueue(task: BulkTask, emails: string[]) {
    const CONCURRENCY = 5;
    let index = 0;

    const worker = async () => {
      while (index < emails.length) {
        const currentIndex = index++;
        const targetEmail = emails[currentIndex];
        try {
          // Bulk uses quick or deep validation depending on list size
          const deep = emails.length <= 15;
          const result = await this.validate(targetEmail, deep);
          task.results.push(result);
        } catch (err: any) {
          const syntax = validateSyntax(targetEmail);
          const { scoring, status } = calculateScore(syntax, null, null, null, null);
          task.results.push({
            email: targetEmail,
            status: ValidationStatus.INVALID,
            syntax,
            dns: null,
            disposable: null,
            catch_all: null,
            smtp: null,
            scoring,
            processing_time_ms: 0,
            validated_at: new Date().toISOString(),
          });
        }
        task.progress = task.results.length;
      }
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY, emails.length) }, () =>
      worker()
    );

    await Promise.all(workers);
    task.status = "completed";
    task.completed_at = new Date().toISOString();
  }
}
