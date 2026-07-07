#!/usr/bin/env node
/**
 * One-time X OAuth 2.0 setup for @kajakorean posting.
 *
 * Local auto (recommended — callback stays on your laptop):
 *   yarn x-oauth2-setup
 *   Portal Callback URL: http://127.0.0.1:8721/callback
 *
 * Manual (copy code from browser after redirect):
 *   yarn x-oauth2-setup --manual
 *   Portal Callback URL must match exactly, e.g. https://kajakorean.com/callback
 */
import { createInterface } from "node:readline/promises";
import { createServer } from "node:http";
import { stdin as input, stdout as output } from "node:process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TwitterApi } from "twitter-api-v2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LOCAL_CALLBACK = "http://127.0.0.1:8721/callback";
const MANUAL_CALLBACK =
  process.env.X_OAUTH2_CALLBACK_URL?.trim() ||
  "https://kajakorean.com/callback";
const SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
];

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);
  const workerEnv = join(ROOT, "x-poster", "worker-runtime.env");
  if (existsSync(workerEnv)) {
    for (const line of readFileSync(workerEnv, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function requireEnv(name: string) {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `Missing env: ${name}\n` +
        "Add it to x-poster/worker-runtime.env (copy from worker-runtime.env.example)\n" +
        "  X_OAUTH2_CLIENT_ID / X_OAUTH2_CLIENT_SECRET from X Developer Portal → Keys and tokens",
    );
  }
  return v;
}

function upsertEnvFile(path: string, updates: Record<string, string>) {
  let text = existsSync(path) ? readFileSync(path, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    text = re.test(text) ? text.replace(re, line) : `${text.replace(/\s*$/, "")}\n${line}\n`;
  }
  writeFileSync(path, text, "utf8");
}

function parseArgs(argv: string[]) {
  const manual = argv.includes("--manual");
  const callbackFlag = argv.find((a) => a.startsWith("--callback="));
  const callback = callbackFlag
    ? callbackFlag.slice("--callback=".length)
    : manual
      ? MANUAL_CALLBACK
      : LOCAL_CALLBACK;
  return { manual, callback };
}

function extractCode(raw: string): string {
  const t = raw.trim();
  if (!t) throw new Error("Empty input");
  try {
    const url = new URL(t);
    const code = url.searchParams.get("code");
    if (code) return code;
  } catch {
    // not a URL — assume raw code
  }
  return t;
}

async function waitForAuthCodeLocal(callbackUrl: string): Promise<string> {
  const callback = new URL(callbackUrl);
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", callbackUrl);
      if (url.pathname !== callback.pathname) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      if (error) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>OAuth failed</h1><p>${error}</p>`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }
      if (!code) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Missing code</h1>");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>Success</h1><p>Return to the terminal. You can close this tab.</p>",
      );
      server.close();
      resolve(code);
    });
    server.listen(Number(callback.port), callback.hostname, () => {
      console.log(`Listening on ${callbackUrl}`);
    });
    server.on("error", reject);
  });
}

async function waitForAuthCodeManual(): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    console.log(
      "\nAfter approving, the browser redirects to your Callback URL.",
    );
    console.log(
      "The page may 404 — that is OK. Copy the FULL address bar URL, or just the code= value.\n",
    );
    const raw = await rl.question("Paste redirect URL or code: ");
    return extractCode(raw);
  } finally {
    rl.close();
  }
}

async function main() {
  await loadEnv();
  const { manual, callback } = parseArgs(process.argv.slice(2));
  const clientId = requireEnv("X_OAUTH2_CLIENT_ID");
  const clientSecret = requireEnv("X_OAUTH2_CLIENT_SECRET");

  const client = new TwitterApi({ clientId, clientSecret });
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    callback,
    { scope: SCOPES },
  );

  console.log("\n=== X OAuth 2.0 setup ===\n");
  console.log("Portal checklist (Settings → User authentication settings):");
  console.log("  • App permissions: Read and write");
  console.log("  • Type of App: Web App or Automated App");
  console.log("  • Website URL: https://kajakorean.com");
  console.log("  • Callback URL (add exactly):");
  console.log(`    ${callback}\n`);
  if (manual) {
    console.log("Mode: manual — no local server. Copy code from browser after redirect.\n");
  } else {
    console.log(
      "Mode: local — runs a tiny server on your laptop only (not the GPU worker).\n",
    );
  }
  console.log("Open this URL (log in as @kajakorean):\n");
  console.log(url);
  console.log(`\n(state=${state})\n`);

  const code = manual
    ? await waitForAuthCodeManual()
    : await waitForAuthCodeLocal(callback);

  const login = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callback,
  });

  const accessToken = login.accessToken;
  const refreshToken = login.refreshToken;
  if (!refreshToken) {
    throw new Error(
      "No refresh token returned — ensure offline.access scope is enabled",
    );
  }

  const me = await login.client.v2.me();
  console.log(`\nAuthorized as @${me.data.username}\n`);

  const workerEnv = join(ROOT, "x-poster", "worker-runtime.env");
  upsertEnvFile(workerEnv, {
    X_OAUTH2_ACCESS_TOKEN: accessToken,
    X_OAUTH2_REFRESH_TOKEN: refreshToken,
    X_OAUTH2_CLIENT_ID: clientId,
    X_OAUTH2_CLIENT_SECRET: clientSecret,
    X_USERNAME: me.data.username ?? "kajakorean",
  });

  console.log("Saved tokens to x-poster/worker-runtime.env");
  console.log("\nNext:");
  console.log("  yarn deploy-x-poster");
  console.log("  ssh lab-worker 'bash ~/korean-teacher-mj/x-poster/run-post.sh'");
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
