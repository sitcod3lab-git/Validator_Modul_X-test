import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ValidationEngine, bulkTasks } from "./server/validator/engine";
import { checkDNS } from "./server/validator/dns";
import { checkDisposableAndRole } from "./server/validator/disposable";

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ---- API Routes -----------------------------------------------------------

  // Health check
  app.get("/api/v1/health", (req, res) => {
    res.json({
      status: "healthy",
      app: "EmailValidator Pro",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Single validation
  app.post("/api/v1/validate/single", async (req, res) => {
    try {
      const email = req.body?.email;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Field 'email' is required" });
      }

      const deep = req.query.deep === "false" ? false : true;
      const result = await ValidationEngine.validate(email, deep);
      return res.json(result);
    } catch (err: any) {
      console.error("Single validation error:", err);
      return res.status(500).json({ error: err?.message || "Internal validation error" });
    }
  });

  // Quick validation (GET)
  app.get("/api/v1/validate/quick/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const result = await ValidationEngine.validate(email, false);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Validation failed" });
    }
  });

  // Bulk validation
  app.post("/api/v1/validate/bulk", async (req, res) => {
    try {
      const rawEmails = req.body?.emails;
      if (!Array.isArray(rawEmails) || rawEmails.length === 0) {
        return res.status(400).json({ error: "Field 'emails' must be a non-empty array" });
      }

      // Filter and clean emails
      const emails = [
        ...new Set(
          rawEmails
            .map((e) => (typeof e === "string" ? e.trim() : ""))
            .filter((e) => e.length > 0)
        ),
      ].slice(0, 1000); // cap at 1000

      if (emails.length === 0) {
        return res.status(400).json({ error: "No valid email addresses provided" });
      }

      // If very small batch (<= 5), validate immediately
      if (emails.length <= 5) {
        const results = await Promise.all(
          emails.map((e) => ValidationEngine.validate(e, false))
        );
        return res.json({
          task_id: "sync-" + Date.now(),
          status: "completed",
          total: emails.length,
          progress: emails.length,
          results,
          message: `Processed ${emails.length} emails`,
        });
      }

      // Create background task
      const task = ValidationEngine.createBulkTask(emails);
      return res.json({
        task_id: task.id,
        status: "processing",
        total: task.total,
        message: `Task ${task.id} queued for processing`,
      });
    } catch (err: any) {
      console.error("Bulk validation error:", err);
      return res.status(500).json({ error: err?.message || "Bulk validation failed" });
    }
  });

  // Bulk task status polling
  app.get("/api/v1/validate/bulk/status/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    const task = bulkTasks.get(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.json(task);
  });

  // Domain lookup
  app.get("/api/v1/domain/:domain", async (req, res) => {
    try {
      const domain = req.params.domain.toLowerCase().trim();
      const [dnsResult, disposableResult] = await Promise.all([
        checkDNS(domain),
        Promise.resolve(checkDisposableAndRole("info", domain)),
      ]);

      return res.json({
        domain,
        dns: dnsResult,
        disposable: disposableResult,
        checked_at: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Domain check failed" });
    }
  });

  // Stats
  app.get("/api/v1/stats", (req, res) => {
    res.json({
      proxy_pool: {
        active_proxies: 0,
        total_requests: 0,
        success_rate: 100,
      },
      version: "2.0.0",
      active_bulk_tasks: bulkTasks.size,
    });
  });

  // ---- Vite Middleware / Static Serving -------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EmailValidator Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
