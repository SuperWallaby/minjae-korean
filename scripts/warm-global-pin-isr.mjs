#!/usr/bin/env node
/**
 * After global enrich + R2 catalog upload: invalidate ISR/CDN and GET pin
 * pages so the next visitor sees speakers (not a silent prerender).
 *
 *   node scripts/warm-global-pin-isr.mjs --from-last-round
 *   node scripts/warm-global-pin-isr.mjs --ids 49_bus-transit__es,50_small-talk-openers__es
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal } from "./lib/env_local.mjs";
import {
  PRONOUNCE_ORIGIN,
  langFromPinId,
  pronouncePinPath,
} from "./lib/atlas-pin-destination.mjs";
import {
  parsePipelineIds,
  readLastEnrichRound,
} from "./lib/last-global-enrich-round.mjs";

loadEnvLocal();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCOPE = process.env.VERCEL_SCOPE || "managertrbox-7710s-projects";
const GP_LINK = path.join(ROOT, ".vercel", "project.json.getpronounce");
const CONCURRENCY = Math.max(
  1,
  Number(process.env.GLOBAL_ISR_WARM_CONCURRENCY || 4) || 4,
);
const GET_MS = Math.max(
  8_000,
  Number(process.env.GLOBAL_ISR_WARM_TIMEOUT_MS || 25_000) || 25_000,
);

function parseArgs(argv) {
  const ids = [];
  let fromLast = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      console.log(
        "node scripts/warm-global-pin-isr.mjs --from-last-round\nnode scripts/warm-global-pin-isr.mjs --ids id1,id2",
      );
      process.exit(0);
    }
    if (a === "--from-last-round") fromLast = true;
    else if (a === "--ids" && argv[i + 1]) {
      ids.push(
        ...argv[++i]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (a.startsWith("--ids=")) {
      ids.push(
        ...a
          .slice(6)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return { ids, fromLast: fromLast || ids.length === 0 };
}

function resolveTargets(args) {
  if (args.ids.length) {
    return {
      ids: [...new Set(args.ids)],
      langs: [
        ...new Set(args.ids.map((id) => langFromPinId(id)).filter(Boolean)),
      ],
      source: "--ids",
    };
  }
  const last = readLastEnrichRound();
  if (last?.ids?.length) {
    return { ids: last.ids, langs: last.langs, source: last.source };
  }
  const pipe = parsePipelineIds();
  if (pipe.ids.length) {
    return { ids: pipe.ids, langs: pipe.langs, source: pipe.source };
  }
  return { ids: [], langs: [], source: "" };
}

function pinUrl(id) {
  return `${PRONOUNCE_ORIGIN}${pronouncePinPath(id, langFromPinId(id))}`;
}

function hubUrl(lang) {
  const code = String(lang || "").toLowerCase();
  if (!code || code === "zh") return `${PRONOUNCE_ORIGIN}/`;
  return `${PRONOUNCE_ORIGIN}/${code}/`;
}

function getpronounceLink() {
  if (!existsSync(GP_LINK)) return null;
  try {
    return JSON.parse(readFileSync(GP_LINK, "utf8"));
  } catch {
    return null;
  }
}

async function postRevalidate(ids, langs) {
  const secret = (process.env.KAJA_REVALIDATE_SECRET || "").trim();
  const url = `${PRONOUNCE_ORIGIN}/api/revalidate/global-pins`;
  const headers = { "content-type": "application/json" };
  if (secret) headers["x-revalidate-secret"] = secret;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ ids, langs }),
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    console.log(`revalidate API ${res.status} ${text.slice(0, 240)}`);
    return res.ok;
  } catch (e) {
    console.log(
      `revalidate API skip (${e instanceof Error ? e.message : e})`,
    );
    return false;
  }
}

function invalidateVercelTags(langs) {
  const tags = [
    "global-catalog",
    ...langs.map((l) => `global-catalog-${l}`),
  ].join(",");
  const link = getpronounceLink();
  const env = { ...process.env };
  if (link?.projectId) env.VERCEL_PROJECT_ID = link.projectId;
  if (link?.orgId) env.VERCEL_ORG_ID = link.orgId;
  const r = spawnSync(
    "npx",
    [
      "vercel",
      "cache",
      "invalidate",
      "--tag",
      tags,
      "--yes",
      "--scope",
      SCOPE,
    ],
    {
      cwd: ROOT,
      env,
      encoding: "utf8",
      timeout: 60_000,
    },
  );
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (out) console.log(out.slice(-800));
  if (r.status !== 0) {
    console.warn(`vercel cache invalidate exit=${r.status}`);
    return false;
  }
  console.log(`vercel cache invalidate tags=${tags}`);
  return true;
}

async function mapPool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await fn(items[idx], idx);
    }
  }
  const k = Math.min(Math.max(1, n), Math.max(1, items.length));
  await Promise.all(Array.from({ length: k }, worker));
  return out;
}

async function getPage(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "cache-control": "no-cache",
        pragma: "no-cache",
        "user-agent": "KajaIsrWarm/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(GET_MS),
    });
    const html = await res.text();
    const audio = /global-pin-tts|preload="none"|Play .+ in /i.test(html);
    const ms = Date.now() - started;
    console.log(
      `GET ${res.status} audio=${audio ? "yes" : "no"} ${ms}ms ${url}`,
    );
    return { ok: res.ok, audio };
  } catch (e) {
    console.log(
      `GET FAIL ${e instanceof Error ? e.message : e} ${url}`,
    );
    return { ok: false, audio: false };
  }
}

export async function warmGlobalPins({
  ids,
  langs,
  source = "",
  skipHub = false,
  skipInvalidate = false,
} = {}) {
  const pinIds = [...new Set((ids || []).map((s) => String(s).trim()).filter(Boolean))];
  const langList = [
    ...new Set(
      (langs || pinIds.map((id) => langFromPinId(id)))
        .map((s) => String(s || "").trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (!pinIds.length) {
    console.log("ISR warm: no pin ids");
    return { ok: 0, audio: 0, total: 0 };
  }
  console.log(
    `ISR warm pins=${pinIds.length} langs=${langList.join(",") || "?"} source=${source || "args"}`,
  );

  await postRevalidate(pinIds, langList);
  if (!skipInvalidate) invalidateVercelTags(langList);

  const urls = [
    ...pinIds.map((id) => pinUrl(id)),
    ...(skipHub ? [] : langList.map((lang) => hubUrl(lang))),
  ];
  const unique = [...new Set(urls)];
  const results = await mapPool(unique, CONCURRENCY, getPage);
  const audio = results.filter((r) => r?.audio).length;
  const ok = results.filter((r) => r?.ok).length;
  console.log(`ISR warm done ok=${ok}/${unique.length} audio=${audio}`);
  return { ok, audio, total: unique.length };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { ids, langs, source } = resolveTargets(args);
  await warmGlobalPins({ ids, langs, source });
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invoked && fileURLToPath(import.meta.url) === invoked) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
