#!/usr/bin/env node
/**
 * Before pinning: write SEO pages → push published.json (Vercel) → wait until live.
 *
 *   node scripts/ensure-vocab-seo-live.mjs --ids a,b,c
 *   node scripts/ensure-vocab-seo-live.mjs --ids a,b --no-wait
 *   VOCAB_OUT=... node scripts/ensure-vocab-seo-live.mjs --ids a
 *
 * Exit 0 only when every requested id is in published.json (and live, unless --no-wait).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRONOUNCE_ORIGIN,
  pronouncePinPath,
} from "./lib/atlas-pin-destination.mjs";
import { koPinIdForVocab } from "./lib/vocab-ko-redirects.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT =
  (process.env.VOCAB_OUT || "").trim() ||
  path.join(ROOT, ".tmp", "vocab-infographic-gen");
const PUBLISHED = path.join(ROOT, "src/data/vocabInfographic/published.json");
const SITE = (process.env.PIN_SEO_SITE_ORIGIN || "https://kajakorean.com").replace(
  /\/$/,
  "",
);
const NPX =
  process.env.NPX_BIN ||
  "/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/npx";
const NODE =
  process.env.NODE_BIN ||
  "/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node";

function parseArgs(argv) {
  let ids = [];
  let wait = true;
  let push = true;
  const waitMs = Math.max(
    60_000,
    Number(process.env.VOCAB_SEO_LIVE_WAIT_MS || 720_000) || 720_000,
  );
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--ids" && argv[i + 1]) {
      ids = argv[++i]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a.startsWith("--ids=")) {
      ids = a
        .slice(6)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a === "--no-wait") wait = false;
    else if (a === "--wait") wait = true;
    else if (a === "--no-push") push = false;
    else if (a === "--push") push = true;
  }
  return { ids, wait, push, waitMs };
}

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function publishedById() {
  const file = loadJson(PUBLISHED, { pages: [] });
  return new Map(
    (Array.isArray(file?.pages) ? file.pages : [])
      .filter((p) => p?.bundleId && p?.slug)
      .map((p) => [p.bundleId, p]),
  );
}

function run(cmd, args, timeoutMs) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      VOCAB_OUT: OUT,
      PATH: `/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:${process.env.PATH || ""}`,
    },
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 32 * 1024 * 1024,
  });
  const log = `${r.stdout || ""}${r.stderr || ""}`.trim();
  return { ok: r.status === 0, status: r.status, log };
}

async function isLive(url) {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 403 || head.status === 404) {
      const get = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { Accept: "text/html" },
      });
      return get.ok;
    }
    return false;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { ids, wait, push, waitMs } = parseArgs(process.argv.slice(2));
  if (!ids.length) {
    console.error("usage: ensure-vocab-seo-live.mjs --ids id1,id2");
    process.exit(2);
  }

  const quizIds = ids.filter((id) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
  );
  const vocabIds = ids.filter((id) => !quizIds.includes(id));
  if (quizIds.length) {
    console.log(
      `skip vocab SEO for ${quizIds.length} quiz word pin(s) — how-to-say pages already published`,
    );
  }
  if (!vocabIds.length) {
    console.log("nothing to ensure for vocab bundles");
    process.exit(0);
  }

  console.log(`==> ensure SEO for ${vocabIds.length} pin(s) (out=${OUT})`);

  let byId = publishedById();
  const missingLocal = vocabIds.filter((id) => !byId.has(id));
  if (missingLocal.length) {
    console.log(
      `→ yarn vocab:publish (missing locally: ${missingLocal.join(", ")})`,
    );
    const pub = run(NPX, ["tsx", "scripts/publish-vocab-seo-pages.ts"], 300_000);
    if (pub.log) console.log(pub.log.slice(-1200));
    if (!pub.ok) {
      console.error("publish failed");
      process.exit(1);
    }
    byId = publishedById();
    const still = vocabIds.filter((id) => !byId.has(id));
    if (still.length) {
      console.error(
        `still missing from published.json after publish: ${still.join(", ")}`,
      );
      console.error(
        "hint: bundle id must be ASCII (run node scripts/migrate-non-ascii-bundle-ids.mjs); needs imageUrl in vocab-x-scheduled.json",
      );
      process.exit(1);
    }
  } else {
    console.log("local published.json already has all requested ids");
  }

  const targets = vocabIds.map((id) => {
    const p = byId.get(id);
    const koPin = p?.slug ? koPinIdForVocab(ROOT, id, p.slug) : "";
    if (koPin) {
      return {
        id,
        url: `${PRONOUNCE_ORIGIN}${pronouncePinPath(koPin, "ko")}`,
        mapped: true,
      };
    }
    return {
      id,
      url: `${SITE}/vocab/${encodeURIComponent(id)}/${encodeURIComponent(p.slug)}`,
      mapped: false,
    };
  });

  const needLive = [];
  for (const t of targets) {
    if (await isLive(t.url)) {
      console.log(`  already live ${t.id}`);
    } else {
      needLive.push(t);
    }
  }

  if (!needLive.length) {
    console.log("all requested /vocab pages already live — nothing to deploy");
    process.exit(0);
  }

  if (push) {
    console.log(
      `→ push published.json (need live: ${needLive.map((t) => t.id).join(", ")})`,
    );
    const pushed = run(
      NODE,
      ["scripts/auto-push-vocab-published.mjs"],
      180_000,
    );
    if (pushed.log) console.log(pushed.log);
    if (!pushed.ok) {
      console.error("auto-push failed — SEO file written locally but not deployed");
      process.exit(1);
    }
  }

  if (!wait) {
    console.log("skip live wait (--no-wait)");
    process.exit(0);
  }

  console.log(
    `→ wait until live (max ${Math.round(waitMs / 1000)}s): ${needLive.map((t) => t.id).join(", ")}`,
  );
  const started = Date.now();
  const pending = new Set(needLive.map((t) => t.id));
  while (pending.size && Date.now() - started < waitMs) {
    for (const t of needLive) {
      if (!pending.has(t.id)) continue;
      if (await isLive(t.url)) {
        pending.delete(t.id);
        console.log(`  live ok ${t.id}`);
      }
    }
    if (!pending.size) break;
    await sleep(15_000);
    console.log(
      `  still waiting (${pending.size}): ${[...pending].join(", ")}`,
    );
  }

  if (pending.size) {
    console.error(
      `live SEO not ready after deploy wait: ${[...pending].join(", ")}`,
    );
    process.exit(1);
  }

  console.log("all requested /vocab pages are live — safe to pin");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
