/**
 * Pin getpronounce.net to a CLI deployment so catalog auto-push (Git → Vercel)
 * cannot replace production with a main-branch build that lacks local pronounce-site.
 */
import { execFileSync } from "node:child_process";
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
const SCOPE = "managertrbox-7710s-projects";

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

/** After catalog Git push, wait for Vercel Git deploy then restore pinned prod. */
export function repromotePinnedAfterCatalogPush({ maxWaitMs = 12 * 60 * 1000 } = {}) {
  const pin = readPinnedProductionUrl();
  if (!pin) {
    console.log(
      "getpronounce: no pinned CLI deployment (.tmp/getpronounce-production-deployment.url) — skip re-promote",
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
        `getpronounce: Git deploy took production (${live}) — re-promote pinned ${pin}`,
      );
      promoteProductionUrl(pin);
      const after = currentProductionUrl();
      console.log(`getpronounce: production alias → ${after || "?"}`);
      return;
    }
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `getpronounce: waiting for Git deploy (${elapsed}s, live=${live || "?"})`,
    );
    sleepMs(intervalMs);
  }

  console.log(
    "getpronounce: Git deploy did not replace production within wait window — pinned prod kept",
  );
}
