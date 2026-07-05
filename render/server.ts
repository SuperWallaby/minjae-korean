/**
 * Capybara grammar-comparison image render sidecar (CPU/Sharp).
 * POST /render-grammar-comparison → WebP bytes
 * GET /health
 *
 * Run from repo root:
 *   npx tsx render/server.ts
 */
import http from "node:http";

import { renderGrammarComparisonImage } from "../src/lib/grammarComparisonImage";

const PORT = Number(process.env.CAPYBARA_RENDER_PORT ?? 8766);
const HOST = process.env.CAPYBARA_RENDER_HOST ?? "0.0.0.0";
const API_KEY = process.env.CAPYBARA_RENDER_API_KEY?.trim() ?? "";

type RenderBody = {
  questionEn?: string;
  items?: Array<{ wordName: string; situationsEn: string[] }>;
  outputWidth?: number;
  webpQuality?: number;
};

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function authorized(req: http.IncomingMessage): boolean {
  if (!API_KEY) return true;
  return req.headers["x-api-key"] === API_KEY;
}

const server = http.createServer(async (req, res) => {
  const path = req.url?.split("?")[0] ?? "";

  if (req.method === "GET" && path === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "capybara-render" }));
    return;
  }

  if (req.method === "POST" && path === "/render-grammar-comparison") {
    if (!authorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    try {
      const body = (await readJsonBody(req)) as RenderBody;
      const questionEn = body.questionEn?.trim() ?? "";
      const items = body.items ?? [];

      if (!questionEn || items.length < 2) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "questionEn and items (min 2) are required" }),
        );
        return;
      }

      const webp = await renderGrammarComparisonImage({
        questionEn,
        items,
        outputWidth: body.outputWidth,
        webpQuality: body.webpQuality,
      });

      res.writeHead(200, {
        "Content-Type": "image/webp",
        "Content-Length": webp.length,
      });
      res.end(webp);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: message }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, HOST, () => {
  console.log(`Capybara render service on http://${HOST}:${PORT}`);
});
