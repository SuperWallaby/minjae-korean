#!/usr/bin/env node
/**
 * One-time OAuth 1.0a setup for @kajakorean (media upload + posting).
 *
 * Prerequisite: Portal Callback URL → http://127.0.0.1:8721/callback
 * App permissions: Read and write
 *
 *   yarn x-oauth1-setup
 */
import { createInterface } from "node:readline/promises";
import { createServer } from "node:http";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { stdin as input, stdout as output } from "node:process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TwitterApi } from "twitter-api-v2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CALLBACK_URL = "http://127.0.0.1:8721/callback";

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
  if (!v) throw new Error(`Missing env: ${name}`);
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

async function waitForCallback(
  expectedOauthToken: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", CALLBACK_URL);
      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const oauthToken = url.searchParams.get("oauth_token");
      const oauthVerifier = url.searchParams.get("oauth_verifier");
      const denied = url.searchParams.get("denied");
      if (denied) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Access denied</h1>");
        server.close();
        reject(new Error("User denied access"));
        return;
      }
      if (!oauthVerifier || oauthToken !== expectedOauthToken) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Invalid callback</h1>");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>Success</h1><p>Return to the terminal.</p>");
      server.close();
      resolve(oauthVerifier);
    });
    server.listen(8721, "127.0.0.1", () => {
      console.log(`Listening on ${CALLBACK_URL}`);
    });
    server.on("error", reject);
  });
}

async function waitForVerifierManual(): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    const raw = await rl.question("Paste oauth_verifier (or full callback URL): ");
    const t = raw.trim();
    try {
      const url = new URL(t);
      const v = url.searchParams.get("oauth_verifier");
      if (v) return v;
    } catch {
      // raw verifier
    }
    return t;
  } finally {
    rl.close();
  }
}

async function main() {
  await loadEnv();
  const manual = process.argv.includes("--manual");
  const appKey = requireEnv("X_API_KEY");
  const appSecret = requireEnv("X_API_SECRET");

  const client = new TwitterApi({ appKey, appSecret });
  const authLink = await client.generateAuthLink(
    manual ? "https://kajakorean.com/callback" : CALLBACK_URL,
  );

  const requestClient = new TwitterApi({
    appKey,
    appSecret,
    accessToken: authLink.oauth_token,
    accessSecret: authLink.oauth_token_secret,
  });

  console.log("\n=== X OAuth 1.0a setup ===\n");
  console.log("Portal checklist:");
  console.log("  • App permissions: Read and write");
  console.log("  • Callback URL:", manual ? "https://kajakorean.com/callback" : CALLBACK_URL);
  console.log("\nOpen (log in as @kajakorean):\n");
  console.log(authLink.url);
  console.log("");

  const oauthVerifier = manual
    ? await waitForVerifierManual()
    : await waitForCallback(authLink.oauth_token);

  const login = await requestClient.login(oauthVerifier);
  const me = await login.client.v2.me();
  console.log(`\nAuthorized as @${me.data.username}\n`);

  const workerEnv = join(ROOT, "x-poster", "worker-runtime.env");
  upsertEnvFile(workerEnv, {
    X_API_KEY: appKey,
    X_API_SECRET: appSecret,
    X_ACCESS_TOKEN: login.accessToken,
    X_ACCESS_TOKEN_SECRET: login.accessSecret,
    X_USERNAME: me.data.username ?? "kajakorean",
  });

  console.log("Saved OAuth 1.0a tokens to x-poster/worker-runtime.env");
  console.log("\nNext:");
  console.log("  yarn deploy-x-poster");
  console.log("  ssh lab-worker 'bash ~/korean-teacher-mj/x-poster/run-post.sh'");
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
