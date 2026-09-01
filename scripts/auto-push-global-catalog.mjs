#!/usr/bin/env node
/**
 * Push global pin catalog to GitHub (VC) without local `git`, then CLI-deploy
 * getpronounce.net (Git ignored-build = exit 0 — push alone does not go live).
 *
 * launchd / Desktop TCC cannot always use git against a Desktop repo.
 * Node reads the file; `gh api` commits onto origin/main.
 *
 * Large files (>~1MB): Contents API omits `content` — compare via git blob fetch.
 *
 *   node scripts/auto-push-global-catalog.mjs
 *   node scripts/auto-push-global-catalog.mjs --skip-deploy   # default behavior now
 *   node scripts/auto-push-global-catalog.mjs --skip-warm     # R2 only (no ISR GET)
 *   node scripts/auto-push-global-catalog.mjs --deploy        # CLI getpronounce (code path)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotCatalogToJson } from "./lib/global-pin-catalog-db.mjs";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { triggerCliDeployAfterCatalogPush } from "./lib/getpronounce-production-pin.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "src/data/globalPins/published.json";
const ABS = path.join(ROOT, FILE);
const REPO = process.env.GLOBAL_PUBLISH_REPO || "SuperWallaby/minjae-korean";
const BRANCH = process.env.GLOBAL_PUBLISH_PUSH_BRANCH || "main";
const GH = process.env.GH_BIN || "/opt/homebrew/bin/gh";

function wantsDeploy(argv) {
  if (argv.includes("--skip-deploy")) return false;
  if (argv.includes("--deploy")) return true;
  if (process.env.GLOBAL_CATALOG_FORCE_DEPLOY === "1") return true;
  if (process.env.GLOBAL_CATALOG_SKIP_DEPLOY === "1") return false;
  // Content-only default: CDN catalog is enough for live /pin pages.
  return false;
}

function uploadCatalogR2() {
  const up = spawnSync(
    process.execPath,
    [path.join(ROOT, "scripts", "upload-global-pins-r2.mjs")],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (up.status !== 0) {
    console.warn("upload-global-pins-r2 failed — live catalog may be stale");
    return false;
  }
  return true;
}

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
  const argv = process.argv.slice(2);
  const deploy = wantsDeploy(argv);

  snapshotCatalogToJson(ROOT);
  if (!existsSync(ABS)) {
    console.error("missing", ABS);
    process.exit(1);
  }

  // Live getpronounce reads R2 catalog — upload before any Git step.
  const r2ok = uploadCatalogR2();
  if (r2ok && !argv.includes("--skip-warm") && process.env.GLOBAL_ISR_SKIP_WARM !== "1") {
    const warm = spawnSync(
      process.execPath,
      [path.join(ROOT, "scripts", "warm-global-pin-isr.mjs"), "--from-last-round"],
      { cwd: ROOT, env: process.env, stdio: "inherit" },
    );
    if (warm.status !== 0) {
      console.warn(
        `ISR warm exit=${warm.status} — catalog is on R2; pin HTML may stay stale until the next hit`,
      );
    }
  } else if (!r2ok) {
    console.warn("skip ISR warm (R2 catalog upload failed)");
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
    if (deploy) {
      triggerCliDeployAfterCatalogPush();
    } else {
      console.log("skip getpronounce deploy (CDN catalog). Pass --deploy or GLOBAL_CATALOG_FORCE_DEPLOY=1 for code releases.");
    }
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
    if (deploy) {
      triggerCliDeployAfterCatalogPush();
    } else {
      console.log("skip getpronounce deploy (CDN catalog). Pass --deploy or GLOBAL_CATALOG_FORCE_DEPLOY=1 for code releases.");
    }
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

main();
