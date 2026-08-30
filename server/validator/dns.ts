import dns from "dns";
import { DNSResult, MXRecord } from "../types";

const dnsPromises = dns.promises;
const DNS_TIMEOUT_MS = 3500;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }).catch(() => {
      clearTimeout(timer);
      return fallback;
    }),
    timeoutPromise,
  ]);
}

export async function checkDNS(domain: string): Promise<DNSResult> {
  const result: DNSResult = {
    domain_exists: false,
    has_mx_records: false,
    mx_records: [],
    has_spf: false,
    spf_record: null,
    has_dmarc: false,
    dmarc_record: null,
    has_dkim: false,
    error: null,
  };

  try {
    // 1. Resolve MX records
    const mxList = await withTimeout(
      dnsPromises.resolveMx(domain),
      DNS_TIMEOUT_MS,
      [] as dns.MxRecord[]
    );

    if (mxList && mxList.length > 0) {
      result.domain_exists = true;
      result.has_mx_records = true;
      result.mx_records = mxList
        .sort((a, b) => a.priority - b.priority)
        .map((m) => ({
          host: m.exchange,
          priority: m.priority,
        }));
    } else {
      // Fallback check: A/AAAA record existence for domain
      const aRecords = await withTimeout(
        dnsPromises.resolve4(domain),
        DNS_TIMEOUT_MS,
        [] as string[]
      );

      if (aRecords && aRecords.length > 0) {
        result.domain_exists = true;
        // RFC 5321 fallback: domain itself functions as implicit MX priority 0
        result.mx_records = [{ host: domain, priority: 0 }];
      } else {
        const aaaaRecords = await withTimeout(
          dnsPromises.resolve6(domain),
          DNS_TIMEOUT_MS,
          [] as string[]
        );
        if (aaaaRecords && aaaaRecords.length > 0) {
          result.domain_exists = true;
          result.mx_records = [{ host: domain, priority: 0 }];
        }
      }
    }

    if (!result.domain_exists) {
      return result;
    }

    // 2. Resolve SPF TXT record
    const txtRecords = await withTimeout(
      dnsPromises.resolveTxt(domain),
      DNS_TIMEOUT_MS,
      [] as string[][]
    );

    for (const chunk of txtRecords) {
      const fullText = chunk.join("");
      if (fullText.toLowerCase().startsWith("v=spf1")) {
        result.has_spf = true;
        result.spf_record = fullText;
        break;
      }
    }

    // 3. Resolve DMARC TXT record
    const dmarcRecords = await withTimeout(
      dnsPromises.resolveTxt(`_dmarc.${domain}`),
      DNS_TIMEOUT_MS,
      [] as string[][]
    );

    for (const chunk of dmarcRecords) {
      const fullText = chunk.join("");
      if (fullText.toLowerCase().includes("v=dmarc1")) {
        result.has_dmarc = true;
        result.dmarc_record = fullText;
        break;
      }
    }

    // 4. Resolve DKIM (probe common selectors)
    const selectors = ["default", "google", "selector1", "selector2", "dkim", "k1", "mail", "smtp"];
    const dkimChecks = selectors.map(async (sel) => {
      try {
        const dkimTxt = await withTimeout(
          dnsPromises.resolveTxt(`${sel}._domainkey.${domain}`),
          1500,
          [] as string[][]
        );
        for (const chunk of dkimTxt) {
          const text = chunk.join("");
          if (text.includes("v=DKIM1") || text.includes("k=rsa") || text.includes("p=")) {
            return true;
          }
        }
      } catch {
        // ignore
      }
      return false;
    });

    const dkimResults = await Promise.all(dkimChecks);
    if (dkimResults.some(Boolean)) {
      result.has_dkim = true;
    }

    return result;
  } catch (err: any) {
    result.error = err?.message || "DNS resolution failed";
    return result;
  }
}
