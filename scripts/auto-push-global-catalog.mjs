#!/usr/bin/env node
/**
 * Push global pin catalog to GitHub (Vercel deploy) without local `git`.
 * launchd / Desktop TCC cannot always use git against a Desktop repo.
 * Node reads the file; `gh api` commits onto origin/main.
 *
 * Large files (>~1MB): Contents API omits `content` — compare via git blob fetch.
 *
 *   node scripts/auto-push-global-catalog.mjs
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repromotePinnedAfterCatalogPush } from "./lib/getpronounce-production-pin.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "src/data/globalPins/published.json";
const ABS = path.join(ROOT, FILE);
const REPO = process.env.GLOBAL_PUBLISH_REPO || "SuperWallaby/minjae-korean";
const BRANCH = process.env.GLOBAL_PUBLISH_PUSH_BRANCH || "main";
const GH = process.env.GH_BIN || "/opt/homebrew/bin/gh";

function stripVolatile(raw) {
  try {
    const j = JSON.parse(raw);
    if (j && typeof j === "object") delete j.generatedAt;
    return JSON.stringify(j);
  } catch {
    return raw;
  }
}

function pageCount(raw) {
  try {
    const j = JSON.parse(raw);
    return Array.isArray(j?.pages) ? j.pages.length : 0;
  } catch {
    return 0;
  }
}

function ghJson(args) {
  const out = execFileSync(GH, args, {
    encoding: "utf8",
    env: { ...process.env, HOME: process.env.HOME || "/Users/minjaekim" },
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}

function remoteFileText(remote) {
  if (remote?.content && remote.encoding === "base64") {
    return Buffer.from(String(remote.content), "base64").toString("utf8");
  }
  // Large file: Contents API returns encoding=none and empty content.
  const sha = String(remote?.sha || "").trim();
  if (!sha) return "";
  const blob = ghJson(["api", `repos/${REPO}/git/blobs/${sha}`]);
  if (blob?.content && blob.encoding === "base64") {
    return Buffer.from(String(blob.content), "base64").toString("utf8");
  }
  return "";
}

function main() {
  if (!existsSync(ABS)) {
    console.error("missing", ABS);
    process.exit(1);
  }
  if (!existsSync(GH)) {
    console.error("gh not found:", GH);
    process.exit(1);
  }

  const localRaw = readFileSync(ABS, "utf8");
  let remote;
  try {
    remote = ghJson([
      "api",
      `repos/${REPO}/contents/${FILE}?ref=${BRANCH}`,
    ]);
  } catch (e) {
    console.error("fetch remote failed", e instanceof Error ? e.message : e);
    process.exit(1);
  }

  let remoteRaw = "";
  try {
    remoteRaw = remoteFileText(remote);
  } catch (e) {
    console.error(
      "fetch remote blob failed",
      e instanceof Error ? e.message : e,
    );
    process.exit(1);
  }

  if (
    remoteRaw &&
    stripVolatile(localRaw) === stripVolatile(remoteRaw)
  ) {
    console.log(
      `remote global published.json up to date (pages=${pageCount(localRaw)})`,
    );
    return;
  }

  const localN = pageCount(localRaw);
  const remoteN = pageCount(remoteRaw);
  const tmp = path.join(
    process.env.TMPDIR || "/tmp",
    `global-published-put-${Date.now()}.json`,
  );
  writeFileSync(
    tmp,
    JSON.stringify({
      message: `chore(global): publish pin catalog (${remoteN}→${localN}) for live /pin pages + TTS.`,
      content: Buffer.from(localRaw, "utf8").toString("base64"),
      sha: remote.sha,
      branch: BRANCH,
    }),
  );
  try {
    const res = ghJson([
      "api",
      "--method",
      "PUT",
      `repos/${REPO}/contents/${FILE}`,
      "--input",
      tmp,
    ]);
    const commit = res?.commit?.sha || "?";
    console.log(
      `pushed ${FILE} → ${BRANCH} pages ${remoteN}→${localN} commit=${String(commit).slice(0, 8)}`,
    );
    // GitHub main already triggers Vercel Git deploy on project getpronounce.
    // Do NOT also POST the deploy hook — that races two production builds for the
    // same commit and can briefly flip getpronounce.net to a half-ready deploy.
    console.log(
      "getpronounce: Git push triggers Vercel build on main — re-promote pinned CLI deploy after",
    );
    repromotePinnedAfterCatalogPush();
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

main();
