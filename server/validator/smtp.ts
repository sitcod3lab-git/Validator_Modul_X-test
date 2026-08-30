import net from "net";
import { SMTPResult, CatchAllResult, MXRecord } from "../types";

const SMTP_TIMEOUT_MS = 6000;

interface SMTPExchangeResult {
  code: number | null;
  message: string | null;
  banner: string | null;
  supportsTls: boolean;
  error: string | null;
}

function performSMTPCheck(
  mxHost: string,
  targetEmail: string,
  fromEmail = "verify@validator-check.org"
): Promise<SMTPExchangeResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = "";
    let supportsTls = false;
    let stage = "CONNECT"; // CONNECT -> EHLO -> MAIL_FROM -> RCPT_TO -> QUIT
    let buffer = "";
    let finalCode: number | null = null;
    let finalMessage: string | null = null;
    let isResolved = false;

    const cleanupAndResolve = (result: SMTPExchangeResult) => {
      if (isResolved) return;
      isResolved = true;
      try {
        if (!socket.destroyed) {
          socket.write("QUIT\r\n");
          socket.end();
          socket.destroy();
        }
      } catch {
        // ignore
      }
      resolve(result);
    };

    socket.setTimeout(SMTP_TIMEOUT_MS);

    socket.on("timeout", () => {
      cleanupAndResolve({
        code: null,
        message: null,
        banner: banner || null,
        supportsTls,
        error: "SMTP connection timed out",
      });
    });

    socket.on("error", (err: any) => {
      cleanupAndResolve({
        code: null,
        message: null,
        banner: banner || null,
        supportsTls,
        error: `SMTP error: ${err.message || "Connection failed"}`,
      });
    });

    socket.connect(25, mxHost, () => {
      // Waiting for server 220 banner
    });

    socket.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\r\n");

      // Only process when we have full lines
      if (!buffer.endsWith("\r\n")) {
        return;
      }

      // Check the last line's status code
      const lastLine = lines[lines.length - 2] || lines[lines.length - 1] || "";
      const match = lastLine.match(/^(\d{3})([ -])(.*)$/);
      if (!match) return;

      const code = parseInt(match[1], 10);
      const isComplete = match[2] === " ";
      if (!isComplete) return; // Multiline response in progress

      const responseText = buffer;
      buffer = ""; // reset for next command

      if (stage === "CONNECT") {
        banner = lastLine;
        if (code === 220) {
          stage = "EHLO";
          socket.write("EHLO validator.local\r\n");
        } else {
          cleanupAndResolve({
            code,
            message: lastLine,
            banner,
            supportsTls,
            error: `Server rejected connection with code ${code}`,
          });
        }
      } else if (stage === "EHLO") {
        if (responseText.toUpperCase().includes("STARTTLS")) {
          supportsTls = true;
        }
        if (code >= 200 && code < 300) {
          stage = "MAIL_FROM";
          socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
        } else {
          // Fallback to HELO
          stage = "HELO";
          socket.write("HELO validator.local\r\n");
        }
      } else if (stage === "HELO") {
        if (code >= 200 && code < 300) {
          stage = "MAIL_FROM";
          socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
        } else {
          cleanupAndResolve({
            code,
            message: lastLine,
            banner,
            supportsTls,
            error: `HELO rejected: ${code}`,
          });
        }
      } else if (stage === "MAIL_FROM") {
        if (code >= 200 && code < 300) {
          stage = "RCPT_TO";
          socket.write(`RCPT TO:<${targetEmail}>\r\n`);
        } else {
          cleanupAndResolve({
            code,
            message: lastLine,
            banner,
            supportsTls,
            error: `MAIL FROM rejected: ${code} ${lastLine}`,
          });
        }
      } else if (stage === "RCPT_TO") {
        finalCode = code;
        finalMessage = lastLine;
        cleanupAndResolve({
          code: finalCode,
          message: finalMessage,
          banner,
          supportsTls,
          error: null,
        });
      }
    });
  });
}

export async function verifyMailboxSMTP(
  email: string,
  mxRecords: MXRecord[]
): Promise<{ smtp: SMTPResult; catchAll: CatchAllResult }> {
  if (!mxRecords || mxRecords.length === 0) {
    return {
      smtp: {
        verified: null,
        smtp_code: null,
        smtp_message: null,
        server_banner: null,
        supports_tls: false,
        error: "No MX hosts available for SMTP verification",
        via_proxy: false,
      },
      catchAll: {
        is_catch_all: false,
        confidence: 0,
        error: "No MX hosts",
      },
    };
  }

  const primaryMx = mxRecords[0].host;
  const domain = email.split("@")[1];

  try {
    // 1. Verify target mailbox
    const checkRes = await performSMTPCheck(primaryMx, email);

    let verified: boolean | null = null;
    let error: string | null = checkRes.error;

    if (checkRes.code !== null) {
      if (checkRes.code === 250) {
        verified = true;
      } else if ([550, 551, 552, 553, 554].includes(checkRes.code)) {
        verified = false;
        error = checkRes.message || `Mailbox rejected (${checkRes.code})`;
      } else if ([450, 451, 452, 421].includes(checkRes.code)) {
        verified = null;
        error = `Temporary greylist/rate-limit (${checkRes.code})`;
      }
    }

    // 2. Catch-all test (probe non-existent email if mailbox seemed accepted)
    let isCatchAll = false;
    let confidence = 0;

    if (verified === true) {
      const probeEmail = `xdz9k2mrpqwf8nvj3ths@${domain}`;
      const catchCheck = await performSMTPCheck(primaryMx, probeEmail);
      if (catchCheck.code === 250) {
        isCatchAll = true;
        confidence = 0.95;
      } else if (catchCheck.code && [550, 551, 552, 553, 554].includes(catchCheck.code)) {
        isCatchAll = false;
        confidence = 0.9;
      }
    }

    return {
      smtp: {
        verified,
        smtp_code: checkRes.code,
        smtp_message: checkRes.message,
        server_banner: checkRes.banner,
        supports_tls: checkRes.supportsTls,
        error,
        via_proxy: false,
      },
      catchAll: {
        is_catch_all: isCatchAll,
        confidence,
        error: null,
      },
    };
  } catch (err: any) {
    return {
      smtp: {
        verified: null,
        smtp_code: null,
        smtp_message: null,
        server_banner: null,
        supports_tls: false,
        error: err?.message || "SMTP verification failed",
        via_proxy: false,
      },
      catchAll: {
        is_catch_all: false,
        confidence: 0,
        error: err?.message,
      },
    };
  }
}
