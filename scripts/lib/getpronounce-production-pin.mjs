/**
 * Pin getpronounce.net to a CLI deployment.
 * Git ignored-build is exit 0 — catalog auto-push must trigger CLI (not Git).
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const PIN_FILE = path.join(
  ROOT,
  ".tmp/getpronounce-production-deployment.url",
);
export const DEPLOY_STAMP_FILE = path.join(
  ROOT,
  ".tmp/getpronounce-cli-deploy.last",
);
const SCOPE = "managertrbox-7710s-projects";
/** Default: avoid stacking a CLI build every enrich round. */
const DEFAULT_COOLDOWN_SEC = Number(
  process.env.GLOBAL_CATALOG_DEPLOY_COOLDOWN_SEC || 1800,
);

export function readPinnedProductionUrl() {
  if (!existsSync(PIN_FILE)) return "";
  return readFileSync(PIN_FILE, "utf8").trim();
}

export function writePinnedProductionUrl(url) {
  const u = String(url || "").trim();
  if (!u) return;
  mkdirSync(path.dirname(PIN_FILE), { recursive: true });
  writeFileSync(PIN_FILE, `${u}\n`, "utf8");
}

function execVercel(args) {
  return execFileSync("npx", ["vercel", ...args, "--scope", SCOPE], {
    encoding: "utf8",
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 8 * 1024 * 1024,
  });
}

function sleepMs(ms) {
  execFileSync("sleep", [String(Math.max(1, Math.ceil(ms / 1000)))]);
}

export function currentProductionUrl() {
  try {
    const out = execVercel(["inspect", "getpronounce.net"]);
    const m = out.match(/^\s+url\s+(\S+)/m);
    return m?.[1]?.trim() || "";
  } catch {
    return "";
  }
}

export function promoteProductionUrl(url) {
  const u = String(url || "").trim();
  if (!u) return false;
  execVercel(["promote", u, "--yes", "--timeout", "5m"]);
  return true;
}

function readDeployStampMs() {
  try {
    if (!existsSync(DEPLOY_STAMP_FILE)) return 0;
    const n = Number(readFileSync(DEPLOY_STAMP_FILE, "utf8").trim());
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeDeployStamp() {
  mkdirSync(path.dirname(DEPLOY_STAMP_FILE), { recursive: true });
  writeFileSync(DEPLOY_STAMP_FILE, `${Date.now()}\n`, "utf8");
}

/**
 * After catalog push: run CLI deploy only when the caller opted in.
 * Opt-out (also default from auto-push): --skip-deploy / GLOBAL_CATALOG_SKIP_DEPLOY=1
 * Opt-in: --deploy / GLOBAL_CATALOG_FORCE_DEPLOY=1
 * Exclusive lock lives in deploy-getpronounce.sh (manual + auto share it).
 */
export function triggerCliDeployAfterCatalogPush() {
  const skip =
    process.argv.includes("--skip-deploy") ||
    process.argv.includes("--skip-repromote") ||
    process.env.GLOBAL_CATALOG_SKIP_DEPLOY === "1";
  if (skip) {
    console.log(
      "getpronounce: skip CLI deploy (caller will deploy, or SKIP_DEPLOY=1)",
    );
    return { ok: true, skipped: true, reason: "skip-flag" };
  }

  const force = process.env.GLOBAL_CATALOG_FORCE_DEPLOY === "1";
  const cooldownSec = DEFAULT_COOLDOWN_SEC;
  const last = readDeployStampMs();
  const ageSec = last ? Math.round((Date.now() - last) / 1000) : Infinity;
  if (!force && last && ageSec < cooldownSec) {
    console.log(
      `getpronounce: CLI deploy cooldown (${ageSec}s < ${cooldownSec}s) — catalog on Git; next push after cooldown deploys`,
    );
    return { ok: true, skipped: true, reason: "cooldown" };
  }

  console.log(
    "getpronounce: triggering CLI deploy (bash scripts/deploy-getpronounce.sh --promote)",
  );
  const r = spawnSync(
    "bash",
    ["scripts/deploy-getpronounce.sh", "--promote"],
    {
      cwd: ROOT,
      env: process.env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (out) console.log(out.slice(-4000));
  if (r.status === 75) {
    console.log("getpronounce: CLI deploy skipped (lock held by another run)");
    return { ok: true, skipped: true, reason: "lock" };
  }
  if (r.status !== 0) {
    console.error(`getpronounce: CLI deploy failed exit=${r.status}`);
    return { ok: false, skipped: false, reason: "deploy-failed" };
  }
  writeDeployStamp();
  console.log("getpronounce: CLI deploy ok — production pinned");
  return { ok: true, skipped: false, reason: "deployed" };
}

/** @deprecated Git builds are disabled; prefer triggerCliDeployAfterCatalogPush. */
export function repromotePinnedAfterCatalogPush({ maxWaitMs = 12 * 60 * 1000 } = {}) {
  const pin = readPinnedProductionUrl();
  if (!pin) {
    console.log(
      "getpronounce: no pinned CLI deployment — skip re-promote",
    );
    return;
  }

  console.log(`getpronounce: pinned production ${pin}`);
  const start = Date.now();
  const intervalMs = 30_000;

  while (Date.now() - start < maxWaitMs) {
    const live = currentProductionUrl();
    if (live && live !== pin) {
      console.log(
        `getpronounce: production drifted (${live}) — re-promote pinned ${pin}`,
      );
      promoteProductionUrl(pin);
      const after = currentProductionUrl();
      console.log(`getpronounce: production alias → ${after || "?"}`);
      return;
    }
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `getpronounce: waiting for drift (${elapsed}s, live=${live || "?"})`,
    );
    sleepMs(intervalMs);
  }

  console.log(
    "getpronounce: production did not drift within wait window — pinned prod kept",
  );
}
