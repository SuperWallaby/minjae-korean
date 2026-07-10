#!/usr/bin/env node
/**
 * Preview server for IG + Pinterest vocab pipeline + 예약 포스팅 (X queue).
 *   node scripts/ig-vocab-preview-server.mjs
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "ig-vocab-pipeline-test");
const PORT = Number(process.env.IG_VOCAB_PREVIEW_PORT || 5197);

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function schedulePost(code, topic) {
  const r = spawnSync(
    "npx",
    [
      "tsx",
      path.join(ROOT, "scripts/ig-vocab-schedule-post.ts"),
      "--code",
      code,
      "--topic",
      topic || "Korean vocabulary",
    ],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 4 * 1024 * 1024, env: process.env },
  );
  if (r.status !== 0) {
    const msg = (r.stderr || r.stdout || "schedule failed").trim();
    throw new Error(msg.split("\n").slice(-3).join(" "));
  }
  const line = (r.stdout || "").trim().split("\n").pop();
  return JSON.parse(line || "{}");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/schedule" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const json = JSON.parse(body || "{}");
      const code = String(json.code || "").trim();
      const topic = String(json.topic || "Korean vocabulary").trim();
      if (!code) return sendJson(res, 400, { ok: false, error: "code required" });
      const result = await schedulePost(code, topic);
      return sendJson(res, 200, { ok: true, ...result });
    } catch (e) {
      return sendJson(res, 500, {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  let filePath = path.join(OUT, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!filePath.startsWith(OUT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

if (!fs.existsSync(OUT)) {
  console.error(`Missing ${OUT} — run: node scripts/test-instagram-vocab-pipeline.mjs --restyle`);
  process.exit(1);
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vocab preview (IG + Pinterest) → http://127.0.0.1:${PORT}/`);
  console.log("예약 클릭 → X grammar_x_post_queue (cron when resumed)");
});
