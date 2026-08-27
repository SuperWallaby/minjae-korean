#!/usr/bin/env node
/**
 * Trigger getpronounce.net production deploy (manual / non-Git paths only).
 *
 * Catalog auto-push commits to GitHub main — that already triggers one Vercel Git
 * deploy on project getpronounce. Do not call this from auto-push-global-catalog.mjs
 * (double deploy races production alias).
 *
 * Use when deploying without a Git push:
 * 1) GETPRONOUNCE_DEPLOY_HOOK env
 * 2) .tmp/getpronounce-deploy-hook (written by setup; gitignored)
 *
 *   node scripts/trigger-getpronounce-deploy.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOOK_FILE = path.join(ROOT, ".tmp/getpronounce-deploy-hook");

function readHook() {
  const fromEnv = process.env.GETPRONOUNCE_DEPLOY_HOOK?.trim();
  if (fromEnv) return fromEnv;
  if (existsSync(HOOK_FILE)) {
    return readFileSync(HOOK_FILE, "utf8").trim();
  }
  return "";
}

async function main() {
  const hook = readHook();
  if (hook) {
    const res = await fetch(hook, { method: "POST" });
    if (!res.ok) {
      console.error(`getpronounce deploy hook failed: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    console.log("getpronounce deploy hook triggered");
    return;
  }

  console.log(
    "getpronounce: main push → Vercel Git deploy (project getpronounce, NEXT_PUBLIC_SITE_MODE=pronounce)",
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
